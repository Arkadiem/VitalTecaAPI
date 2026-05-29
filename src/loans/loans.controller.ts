import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtUser } from './loans.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo préstamo' })
  @ApiResponse({
    status: 201,
    description: 'Préstamo creado (descuenta stock)',
  })
  @ApiResponse({ status: 400, description: 'Libro sin stock' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Get()
  @ApiOperation({ summary: 'Obtener préstamos (CLIENT solo los suyos)' })
  @ApiResponse({ status: 200, description: 'Lista de préstamos' })
  findAll(
    @Req() req: { user: JwtUser },
    @Query() paginationDto: PaginationDto,
  ) {
    return this.loansService.findAll(req.user, paginationDto);
  }

  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un préstamo por ID (CLIENT solo el suyo)' })
  @ApiResponse({ status: 200, description: 'Préstamo encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  findOne(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.loansService.findOne(id, req.user);
  }

  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un préstamo' })
  @ApiResponse({ status: 200, description: 'Préstamo actualizado' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un préstamo (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Préstamo eliminado' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }

  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Patch(':id/return')
  @ApiOperation({ summary: 'Registrar devolución de un libro' })
  @ApiResponse({ status: 200, description: 'Libro devuelto (restaura stock)' })
  @ApiResponse({ status: 400, description: 'Libro ya devuelto' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  returnBook(@Param('id') id: string) {
    return this.loansService.returnBook(id);
  }
}
