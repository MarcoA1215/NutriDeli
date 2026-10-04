import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OperatingExpensesService } from './operating-expenses.service';
import { CreateOperatingExpenseDto } from './dto/create-operating-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@nutrideli/shared-types';

@Controller('operating-expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperatingExpensesController {
  constructor(private readonly expensesService: OperatingExpensesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.POS)
  findAll() {
    return this.expensesService.findAll();
  }

  @Get('cash-drawer-summary')
  @Roles(UserRole.ADMIN, UserRole.POS)
  getCashDrawerSummary(@Query('date') date?: string) {
    return this.expensesService.getCashDrawerSummary(date);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateOperatingExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}

