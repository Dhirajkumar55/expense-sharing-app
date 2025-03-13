import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../enums/expense-type.enum';
import { CreateSplitDto } from './create-split.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: ExpenseType })
  @IsEnum(ExpenseType)
  type: ExpenseType;

  @ApiProperty({ type: String })
  @IsUUID('4')
  paidById: string;

  @ApiProperty({ type: String })
  @IsUUID('4')
  groupId: string;

  @ApiProperty({ type: [CreateSplitDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSplitDto)
  splits: CreateSplitDto[];
}
