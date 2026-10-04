import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '../entities/investment.entity';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepo: Repository<Investment>,
  ) {}

  async findAll() {
    return this.investmentRepo.find({
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(dto: CreateInvestmentDto) {
    const investment = this.investmentRepo.create({
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      date: dto.date || new Date().toISOString().split('T')[0],
    });
    return this.investmentRepo.save(investment);
  }

  async remove(id: string) {
    const item = await this.investmentRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inversión no encontrada');
    await this.investmentRepo.delete(id);
    return { success: true };
  }
}

