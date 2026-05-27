import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Roles('ADMIN', 'LIBRARIAN')
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo préstamo' })
  @ApiResponse({ status: 201, description: 'Préstamo creado (descuenta stock)' })
  @ApiResponse({ status: 400, description: 'Libro sin stock' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Roles('ADMIN', 'LIBRARIAN', 'USER')
  @Get()
  @ApiOperation({ summary: 'Obtener todos los préstamos' })
  @ApiResponse({ status: 200, description: 'Lista de préstamos' })
  findAll() {
    return this.loansService.findAll();
  }

  @Roles('ADMIN', 'LIBRARIAN', 'USER')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un préstamo por ID' })
  @ApiResponse({ status: 200, description: 'Préstamo encontrado' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Roles('ADMIN', 'LIBRARIAN')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un préstamo' })
  @ApiResponse({ status: 200, description: 'Préstamo actualizado' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un préstamo (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Préstamo eliminado' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }

  @Roles('ADMIN', 'LIBRARIAN')
  @Patch(':id/return')
  @ApiOperation({ summary: 'Registrar devolución de un libro' })
  @ApiResponse({ status: 200, description: 'Libro devuelto (restaura stock)' })
  @ApiResponse({ status: 400, description: 'Libro ya devuelto' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  returnBook(@Param('id') id: string) {
    return this.loansService.returnBook(id);
  }
}
