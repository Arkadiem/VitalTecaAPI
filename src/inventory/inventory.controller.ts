import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles('ADMIN', 'LIBRARIAN')
  @Post()
  @ApiOperation({ summary: 'Crear un registro de inventario' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Roles('ADMIN', 'LIBRARIAN')
  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de inventario' })
  @ApiResponse({ status: 200, description: 'Lista de registros' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Roles('ADMIN', 'LIBRARIAN')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de inventario por ID' })
  @ApiResponse({ status: 200, description: 'Registro encontrado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Roles('ADMIN', 'LIBRARIAN')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de inventario' })
  @ApiResponse({ status: 200, description: 'Registro actualizado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Registro eliminado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
