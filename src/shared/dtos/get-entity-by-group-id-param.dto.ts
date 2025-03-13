import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetEntityByGroupIdParamDto {
  @ApiProperty({ type: String })
  @IsUUID('4')
  groupId: string;
}
