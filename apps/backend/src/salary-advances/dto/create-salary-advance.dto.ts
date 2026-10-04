import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSalaryAdvanceDto {
  @IsString()
  userId: string;

  @IsNumber()
  amountUSD: number;

  @IsOptional()
  @IsNumber()
  amountBs?: number;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  date?: string;
}

