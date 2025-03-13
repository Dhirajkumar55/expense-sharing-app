import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettlementDto {
  @ApiProperty({ type: String })
  @IsUUID('4')
  @IsNotEmpty()
  fromUserId: string;

  @ApiProperty({ type: String })
  @IsUUID('4')
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty({ type: String })
  @IsUUID('4')
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
