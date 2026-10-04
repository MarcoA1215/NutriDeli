import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperatingExpense } from '../entities/operating-expense.entity';
import { Order } from '../entities/order.entity';
import { OperatingExpensesService } from './operating-expenses.service';
import { OperatingExpensesController } from './operating-expenses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OperatingExpense, Order])],
  providers: [OperatingExpensesService],
  controllers: [OperatingExpensesController],
  exports: [OperatingExpensesService],
})
export class OperatingExpensesModule {}

