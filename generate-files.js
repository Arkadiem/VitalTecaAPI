const fs = require('fs');
const path = require('path');

const files = {
  // Employees
  'src/employees/dto/create-employee.dto.ts': `import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsString() @IsOptional() role?: string;
}`,
  'src/employees/dto/update-employee.dto.ts': `import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}`,
  'src/employees/employees.service.ts': `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateEmployeeDto) { return this.prisma.employee.create({ data }); }
  findAll() { return this.prisma.employee.findMany(); }
  findOne(id: string) { return this.prisma.employee.findUnique({ where: { id } }); }
  update(id: string, data: UpdateEmployeeDto) { return this.prisma.employee.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.employee.delete({ where: { id } }); }
}`,
  'src/employees/employees.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  @Post() create(@Body() createEmployeeDto: CreateEmployeeDto) { return this.employeesService.create(createEmployeeDto); }
  @Get() findAll() { return this.employeesService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.employeesService.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) { return this.employeesService.update(id, updateEmployeeDto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.employeesService.remove(id); }
}`,
  // Books
  'src/books/dto/create-book.dto.ts': `import { IsNotEmpty, IsString, IsInt, IsOptional, Min } from 'class-validator';
export class CreateBookDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() author: string;
  @IsString() @IsNotEmpty() isbn: string;
  @IsInt() @Min(0) @IsOptional() stock?: number;
}`,
  'src/books/dto/update-book.dto.ts': `import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
export class UpdateBookDto extends PartialType(CreateBookDto) {}`,
  'src/books/books.service.ts': `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateBookDto) { return this.prisma.book.create({ data }); }
  findAll() { return this.prisma.book.findMany(); }
  findOne(id: string) { return this.prisma.book.findUnique({ where: { id } }); }
  update(id: string, data: UpdateBookDto) { return this.prisma.book.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.book.delete({ where: { id } }); }
}`,
  'src/books/books.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @Post() create(@Body() createBookDto: CreateBookDto) { return this.booksService.create(createBookDto); }
  @Get() findAll() { return this.booksService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.booksService.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) { return this.booksService.update(id, updateBookDto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.booksService.remove(id); }
}`,
  // Inventory
  'src/inventory/dto/create-inventory.dto.ts': `import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
export class CreateInventoryDto {
  @IsUUID() @IsNotEmpty() bookId: string;
  @IsUUID() @IsNotEmpty() employeeId: string;
  @IsString() @IsOptional() status?: string;
}`,
  'src/inventory/dto/update-inventory.dto.ts': `import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';
export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}`,
  'src/inventory/inventory.service.ts': `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateInventoryDto) { return this.prisma.inventory.create({ data }); }
  findAll() { return this.prisma.inventory.findMany({ include: { book: true, employee: true } }); }
  findOne(id: string) { return this.prisma.inventory.findUnique({ where: { id }, include: { book: true, employee: true } }); }
  update(id: string, data: UpdateInventoryDto) { return this.prisma.inventory.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.inventory.delete({ where: { id } }); }
}`,
  'src/inventory/inventory.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  @Post() create(@Body() createInventoryDto: CreateInventoryDto) { return this.inventoryService.create(createInventoryDto); }
  @Get() findAll() { return this.inventoryService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.inventoryService.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) { return this.inventoryService.update(id, updateInventoryDto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.inventoryService.remove(id); }
}`,
  // Loans
  'src/loans/dto/create-loan.dto.ts': `import { IsNotEmpty, IsUUID } from 'class-validator';
export class CreateLoanDto {
  @IsUUID() @IsNotEmpty() bookId: string;
  @IsUUID() @IsNotEmpty() userId: string;
  @IsUUID() @IsNotEmpty() employeeId: string;
}`,
  'src/loans/dto/update-loan.dto.ts': `import { PartialType } from '@nestjs/mapped-types';
import { CreateLoanDto } from './create-loan.dto';
import { IsDateString, IsOptional } from 'class-validator';
export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @IsDateString() @IsOptional() returnDate?: string | Date;
}`,
  'src/loans/loans.service.ts': `import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Loan } from '@prisma/client';
@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLoanDto): Promise<Loan> {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: data.bookId } });
      if (!book) throw new BadRequestException('Book not found');
      if (book.stock <= 0) throw new BadRequestException('Book is out of stock');

      await tx.book.update({
        where: { id: data.bookId },
        data: { stock: { decrement: 1 } },
      });

      return tx.loan.create({ data });
    });
  }

  findAll() { return this.prisma.loan.findMany({ include: { book: true, user: true, employee: true } }); }
  findOne(id: string) { return this.prisma.loan.findUnique({ where: { id }, include: { book: true, user: true, employee: true } }); }
  update(id: string, data: UpdateLoanDto) { return this.prisma.loan.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.loan.delete({ where: { id } }); }
}`,
  'src/loans/loans.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}
  @Post() create(@Body() createLoanDto: CreateLoanDto) { return this.loansService.create(createLoanDto); }
  @Get() findAll() { return this.loansService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.loansService.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) { return this.loansService.update(id, updateLoanDto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.loansService.remove(id); }
}`
};

for (const [file, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\\n');
}
console.log('Todos los archivos generados con éxito.');
