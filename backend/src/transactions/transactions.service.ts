import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

type TransactionResponse = Omit<Transaction, 'amount'> & { amount: number };

function parseTransactionDate(value: string): Date {
  const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return new Date(calendarDate ? `${value}T12:00:00.000Z` : value);
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: FindTransactionsQueryDto): Promise<TransactionResponse[]> {
    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        ...(query.type ? { type: query.type } : {}),
        ...(query.search?.trim()
          ? { title: { contains: query.search.trim(), mode: 'insensitive' } }
          : {}),
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map((row) => this.toResponse(row));
  }

  async getSummary(userId: string) {
    const totals = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });
    const transactionCount = await this.prisma.transaction.count({ where: { userId } });
    const totalIncome = Number(
      totals.find((row) => row.type === TransactionType.INCOME)?._sum.amount ?? 0,
    );
    const totalExpense = Number(
      totals.find((row) => row.type === TransactionType.EXPENSE)?._sum.amount ?? 0,
    );

    return {
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
      transactionCount,
    };
  }

  async findOne(id: string, userId: string): Promise<TransactionResponse> {
    const row = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException('Transaction not found.');
    return this.toResponse(row);
  }

  async create(userId: string, dto: CreateTransactionDto): Promise<TransactionResponse> {
    const row = await this.prisma.transaction.create({
      data: {
        title: dto.title.trim(),
        amount: new Prisma.Decimal(dto.amount),
        type: dto.type,
        category: dto.category ?? TransactionCategory.OTHER,
        date: dto.date ? parseTransactionDate(dto.date) : new Date(),
        description: dto.description?.trim() || null,
        userId,
      },
    });

    return this.toResponse(row);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponse> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Provide at least one field to update.');
    }

    const data: Prisma.TransactionUpdateManyMutationInput = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.amount !== undefined ? { amount: new Prisma.Decimal(dto.amount) } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.category !== undefined ? { category: dto.category } : {}),
      ...(dto.date !== undefined ? { date: parseTransactionDate(dto.date) } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
    };

    const result = await this.prisma.transaction.updateMany({
      where: { id, userId },
      data,
    });
    if (result.count === 0) throw new NotFoundException('Transaction not found.');

    const row = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException('Transaction not found.');
    return this.toResponse(row);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.prisma.transaction.deleteMany({ where: { id, userId } });
    if (result.count === 0) throw new NotFoundException('Transaction not found.');
  }

  private toResponse(row: Transaction): TransactionResponse {
    return { ...row, amount: Number(row.amount) };
  }
}
