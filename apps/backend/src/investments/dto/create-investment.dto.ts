import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { InvestmentType } from '../../entities/investment.entity';

export class CreateInvestmentDto {
  @IsEnum(InvestmentType)
  type: InvestmentType;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  date?: string;
}

