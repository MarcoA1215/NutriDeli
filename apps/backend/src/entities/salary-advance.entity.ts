import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum AdvanceStatus {
  PENDIENTE = 'PENDIENTE',
  DESCONTADO = 'DESCONTADO',
}

@Entity('salary_advances')
export class SalaryAdvance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('float')
  amountUSD: number;

  @Column('float', { nullable: true })
  amountBs: number;

  @Column('float', { nullable: true })
  exchangeRate: number;

  @Column()
  reason: string;

  @Column({ type: 'varchar', default: AdvanceStatus.PENDIENTE })
  status: AdvanceStatus;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}

