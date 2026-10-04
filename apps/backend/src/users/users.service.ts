import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { OperatingExpense, ExpenseCategory } from '../entities/operating-expense.entity';
import { SalaryAdvance, AdvanceStatus } from '../entities/salary-advance.entity';
import { UserRole } from '@nutrideli/shared-types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(OperatingExpense)
    private expenseRepo: Repository<OperatingExpense>,
    @InjectRepository(SalaryAdvance)
    private advanceRepo: Repository<SalaryAdvance>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Create default admin if no users exist
    const count = await this.usersRepo.count();
    if (count === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      const admin = this.usersRepo.create({
        username: 'admin',
        passwordHash: hash,
        role: UserRole.ADMIN,
      });
      await this.usersRepo.save(admin);
      console.log('Default admin user created: admin / admin123');
    }
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepo.findOne({ where: { username } });
    return user || undefined;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getEmployeesSimple(): Promise<Partial<User>[]> {
    const users = await this.usersRepo.find({ order: { username: 'ASC' } });
    return users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      salaryAmount: u.salaryAmount,
      salaryPeriod: u.salaryPeriod,
    }));
  }

  async create(data: any): Promise<User> {
    const hash = await bcrypt.hash(data.password, 10);
    const user = this.usersRepo.create({
      username: data.username,
      passwordHash: hash,
      role: data.role || UserRole.POS,
      salaryAmount: data.salaryAmount !== undefined ? parseFloat(data.salaryAmount) : 0,
      salaryPeriod: data.salaryPeriod || 'SEMANAL',
    });
    return this.usersRepo.save(user);
  }

  async update(id: string, data: any): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (data.username) user.username = data.username;
    if (data.role) user.role = data.role;
    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
    }
    if (data.salaryAmount !== undefined) {
      user.salaryAmount = parseFloat(data.salaryAmount) || 0;
    }
    if (data.salaryPeriod) {
      user.salaryPeriod = data.salaryPeriod;
    }

    return this.usersRepo.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepo.delete(id);
  }

  async payPayroll(userId: string, dto: {
    amountPaid: number;
    paymentMethod: string;
    discountAdvances?: boolean;
    advanceIds?: string[];
    notes?: string;
    date?: string;
  }) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) throw new NotFoundException('Empleado no encontrado');

      const dateStr = dto.date || new Date().toISOString().split('T')[0];

      // 1. Registrar gasto de nómina en OperatingExpenses
      const expense = manager.create(OperatingExpense, {
        category: ExpenseCategory.PAYROLL,
        amount: dto.amountPaid,
        paymentMethod: dto.paymentMethod || 'CASH',
        description: `Pago de nómina: ${user.username} - ${user.salaryPeriod || 'SEMANAL'}${dto.notes ? ` (${dto.notes})` : ''}`,
        referenceId: user.id,
        date: dateStr,
      });
      await manager.save(OperatingExpense, expense);

      // 2. Si se descontaron vales, pasarlos a estatus DESCONTADO
      if (dto.discountAdvances && dto.advanceIds && dto.advanceIds.length > 0) {
        await manager.update(SalaryAdvance, { id: In(dto.advanceIds) }, { status: AdvanceStatus.DESCONTADO });
      }

      return {
        success: true,
        message: 'Nómina pagada y registrada exitosamente',
        expense,
      };
    });
  }
}

