import { Injectable, BadRequestException } from '@nestjs/common';
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
      if (book.stock <= 0)
        throw new BadRequestException('Book is out of stock');

      await tx.book.update({
        where: { id: data.bookId },
        data: { stock: { decrement: 1 } },
      });

      return tx.loan.create({ data });
    });
  }

  findAll() {
    return this.prisma.loan.findMany({
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true, isActive: true } },
        employee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.loan.findUniqueOrThrow({
      where: { id },
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true, isActive: true } },
        employee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
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
