import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcryptjs';
import { Employee } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEmployeeDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.employee.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({ skip, take: limit }),
      this.prisma.employee.count(),
    ]);
    const sanitizedData = data.map(({ password: _, ...emp }) => emp);
    return {
      data: sanitizedData,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUniqueOrThrow({
      where: { id },
    });
    const { password: _, ...result } = employee;
    return result;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({ where: { email } });
  }

  async update(id: string, data: UpdateEmployeeDto) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.employee.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }
}
