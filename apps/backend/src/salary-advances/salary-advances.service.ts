import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SalaryAdvance, AdvanceStatus } from '../entities/salary-advance.entity';
import { OperatingExpense, ExpenseCategory } from '../entities/operating-expense.entity';
import { User } from '../entities/user.entity';
import { CreateSalaryAdvanceDto } from './dto/create-salary-advance.dto';

@Injectable()
export class SalaryAdvancesService {
  constructor(
    @InjectRepository(SalaryAdvance)
    private advanceRepo: Repository<SalaryAdvance>,
    @InjectRepository(OperatingExpense)
    private expenseRepo: Repository<OperatingExpense>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async findAll(status?: AdvanceStatus) {
    const where: any = {};
    if (status) where.status = status;
    return this.advanceRepo.find({
      where,
      relations: { user: true },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async getPendingByEmployee(userId: string) {
    return this.advanceRepo.find({
      where: {
        userId,
        status: AdvanceStatus.PENDIENTE,
      },
      order: { date: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(dto: CreateSalaryAdvanceDto) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: dto.userId } });
      if (!user) throw new NotFoundException('Empleado no encontrado');

      const dateStr = dto.date || new Date().toISOString().split('T')[0];

      // 1. Guardar el Vale en salary_advances
      const advance = manager.create(SalaryAdvance, {
        userId: user.id,
        amountUSD: dto.amountUSD,
        amountBs: dto.amountBs,
        exchangeRate: dto.exchangeRate,
        reason: dto.reason,
        status: AdvanceStatus.PENDIENTE,
        date: dateStr,
      });
      const savedAdvance = await manager.save(SalaryAdvance, advance);

      // 2. Extraer de la caja activa: generar egreso operativo en CASH
      const expense = manager.create(OperatingExpense, {
        category: ExpenseCategory.VALE_EMPLEADO,
        amount: dto.amountUSD,
        paymentMethod: 'CASH',
        description: `Vale/Adelanto de empleado: ${user.username} - ${dto.reason}`,
        referenceId: savedAdvance.id,
        date: dateStr,
      });
      await manager.save(OperatingExpense, expense);

      return savedAdvance;
    });
  }

  async cancel(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const advance = await manager.findOne(SalaryAdvance, { where: { id } });
      if (!advance) throw new NotFoundException('Vale no encontrado');
      if (advance.status === AdvanceStatus.DESCONTADO) {
        throw new BadRequestException('No se puede cancelar un vale que ya ha sido descontado en nómina');
      }

      // Eliminar el egreso de caja asociado si existe
      await manager.delete(OperatingExpense, { referenceId: advance.id });
      await manager.remove(SalaryAdvance, advance);

      return { success: true, message: 'Vale cancelado y egreso de caja revertido' };
    });
  }
}

