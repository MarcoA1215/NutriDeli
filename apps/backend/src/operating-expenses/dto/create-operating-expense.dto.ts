import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ExpenseCategory } from '../../entities/operating-expense.entity';

export class CreateOperatingExpenseDto {
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  date?: string;
}

