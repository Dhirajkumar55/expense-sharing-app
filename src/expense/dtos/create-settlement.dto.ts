import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSettlementDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ type: String })
  @IsUUID('4')
  payerId: string;

  @ApiProperty({ type: String })
  @IsUUID('4')
  receiverId: string;

  @ApiProperty({ type: String })
  @IsUUID('4')
  groupId: string;
}
