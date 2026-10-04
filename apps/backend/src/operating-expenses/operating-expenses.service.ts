import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OperatingExpense } from '../entities/operating-expense.entity';
import { CreateOperatingExpenseDto } from './dto/create-operating-expense.dto';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '@nutrideli/shared-types';

@Injectable()
export class OperatingExpensesService {
  constructor(
    @InjectRepository(OperatingExpense)
    private expenseRepo: Repository<OperatingExpense>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async findAll() {
    return this.expenseRepo.find({
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(dto: CreateOperatingExpenseDto) {
    const expense = this.expenseRepo.create({
      category: dto.category,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod || 'CASH',
      description: dto.description,
      referenceId: dto.referenceId,
      date: dto.date || new Date().toISOString().split('T')[0],
    });
    return this.expenseRepo.save(expense);
  }

  async remove(id: string) {
    const item = await this.expenseRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Egreso no encontrado');
    await this.expenseRepo.delete(id);
    return { success: true };
  }

  async getCashDrawerSummary(dateStr?: string) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);

    // 1. Obtener órdenes del día no canceladas
    const orders = await this.orderRepo.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    const activeOrders = orders.filter(o => o.status !== OrderStatus.CANCELED);

    // Ventas en efectivo: órdenes sin pago móvil ref o pago en efectivo
    let totalCashSales = 0;
    let totalElectronicSales = 0;

    for (const o of activeOrders) {
      if (o.pagoMovilRef && o.pagoMovilRef.trim() !== '') {
        totalElectronicSales += o.totalAmount;
      } else {
        totalCashSales += o.totalAmount;
      }
    }

    // 2. Egresos en efectivo (Vales, etc.)
    const expenses = await this.expenseRepo.find({
      where: { date: targetDate },
    });

    const cashExpenses = expenses.filter(e => e.paymentMethod === 'CASH');
    const totalCashExpenses = cashExpenses.reduce((acc, e) => acc + e.amount, 0);

    const netCashInDrawer = totalCashSales - totalCashExpenses;

    return {
      date: targetDate,
      totalCashSales,
      totalElectronicSales,
      totalCashExpenses,
      cashExpensesList: cashExpenses,
      netCashInDrawer: Math.max(0, netCashInDrawer),
      calculatedNetDrawer: netCashInDrawer,
    };
  }
}

