import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '@nutrideli/shared-types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'varchar', default: UserRole.POS })
  role: UserRole;

  @Column('float', { default: 0, nullable: true })
  salaryAmount: number;

  @Column({ default: 'SEMANAL', nullable: true })
  salaryPeriod: string; // 'SEMANAL' | 'QUINCENAL' | 'MENSUAL'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

