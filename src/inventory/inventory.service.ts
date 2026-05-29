import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateInventoryDto) {
    return this.prisma.inventory.create({ data });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        skip,
        take: limit,
        include: {
          book: true,
          employee: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      this.prisma.inventory.count(),
    ]);

    return {
      data,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  findOne(id: string) {
    return this.prisma.inventory.findUniqueOrThrow({
      where: { id },
      include: {
        book: true,
        employee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  update(id: string, data: UpdateInventoryDto) {
    return this.prisma.inventory.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.inventory.delete({ where: { id } });
  }
}
