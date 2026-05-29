import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Role } from '../common/enums/role.enum';
import { Loan } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

export interface JwtUser {
  userId: string;
  email: string;
  role: Role;
  isEmployee: boolean;
}

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLoanDto): Promise<Loan> {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: data.bookId } });
      if (!book) throw new BadRequestException('Book not found');
      if (book.stock <= 0)
        throw new BadRequestException('Book is out of stock');

      await tx.book.update({
        where: { id: data.bookId },
        data: { stock: { decrement: 1 } },
      });

      return tx.loan.create({ data });
    });
  }

  async findAll(user: JwtUser, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const where = user.role === Role.CLIENT ? { userId: user.userId } : {};

    const [data, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        skip,
        take: limit,
        include: {
          book: true,
          user: {
            select: { id: true, name: true, email: true, isActive: true },
          },
          employee: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      this.prisma.loan.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: JwtUser) {
    const loan = await this.prisma.loan.findUniqueOrThrow({
      where: { id },
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true, isActive: true } },
        employee: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // CLIENT solo puede ver sus propios préstamos
    if (user.role === Role.CLIENT && loan.userId !== user.userId) {
      throw new ForbiddenException(
        'Solo puedes acceder a tus propios préstamos',
      );
    }

    return loan;
  }

  update(id: string, data: UpdateLoanDto) {
    return this.prisma.loan.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.loan.delete({ where: { id } });
  }

  async returnBook(id: string): Promise<Loan> {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUniqueOrThrow({ where: { id } });
      if (loan.returnDate) {
        throw new BadRequestException('Loan is already returned');
      }

      await tx.book.update({
        where: { id: loan.bookId },
        data: { stock: { increment: 1 } },
      });

      return tx.loan.update({
        where: { id },
        data: { returnDate: new Date() },
      });
    });
  }
}
