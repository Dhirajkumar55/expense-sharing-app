import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetEntityByIdParamDto {
  @ApiProperty({ type: String })
  @IsUUID('4')
  id: string;
}
