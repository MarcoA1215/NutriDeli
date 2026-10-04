import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SalaryAdvancesService } from './salary-advances.service';
import { CreateSalaryAdvanceDto } from './dto/create-salary-advance.dto';
import { AdvanceStatus } from '../entities/salary-advance.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@nutrideli/shared-types';

@Controller('salary-advances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalaryAdvancesController {
  constructor(private readonly advancesService: SalaryAdvancesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.POS)
  findAll(@Query('status') status?: AdvanceStatus) {
    return this.advancesService.findAll(status);
  }

  @Get('pending/:userId')
  @Roles(UserRole.ADMIN, UserRole.POS)
  getPendingByEmployee(@Param('userId') userId: string) {
    return this.advancesService.getPendingByEmployee(userId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.POS)
  create(@Body() dto: CreateSalaryAdvanceDto) {
    return this.advancesService.create(dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  cancel(@Param('id') id: string) {
    return this.advancesService.cancel(id);
  }
}

