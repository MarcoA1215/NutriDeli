import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ExpenseCategory {
  VALE_EMPLEADO = 'VALE_EMPLEADO',
  PAYROLL = 'PAYROLL',
  GENERAL = 'GENERAL',
}

@Entity('operating_expenses')
export class OperatingExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  category: ExpenseCategory;

  @Column('float')
  amount: number; // Monto en USD

  @Column({ default: 'CASH' })
  paymentMethod: string; // CASH | TRANSFER | PAGO_MOVIL

  @Column()
  description: string;

  @Column({ nullable: true })
  referenceId: string; // ID de vale o ID de usuario

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}

