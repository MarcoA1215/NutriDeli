import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum InvestmentType {
  INVERSION_EXTERNA = 'INVERSION_EXTERNA',
  REINVERSION_GANANCIA = 'REINVERSION_GANANCIA',
}

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: InvestmentType;

  @Column('float')
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}

