import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSplitDto {
  @ApiProperty({ type: String })
  @IsUUID('4')
  userId: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  percentage?: number;
}
