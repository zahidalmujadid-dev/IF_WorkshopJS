import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class FindTransactionsQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
