import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@nutrideli/shared-types';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('simple')
  @Roles(UserRole.ADMIN, UserRole.POS)
  getEmployeesSimple() {
    return this.usersService.getEmployeesSimple();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() data: any) {
    return this.usersService.create(data);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Post(':id/pay-payroll')
  @Roles(UserRole.ADMIN)
  payPayroll(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.payPayroll(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}

