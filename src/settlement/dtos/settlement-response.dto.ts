import { ApiProperty } from '@nestjs/swagger';

class UserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;
}

class GroupInfoDto {
  @ApiProperty({
    description: 'Group ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Group name',
    example: 'Trip to Paris',
  })
  name: string;
}

export class SettlementResponseDto {
  @ApiProperty({
    description: 'Settlement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Settlement amount',
    example: 25.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Optional notes about the settlement',
    example: 'Paid via bank transfer',
    required: false,
  })
  notes: string;

  @ApiProperty({
    description: 'When the settlement was created',
    example: '2023-07-21T15:30:45.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User who paid the money (sender)',
    type: UserInfoDto,
  })
  fromUser: UserInfoDto;

  @ApiProperty({
    description: 'User who received the money (recipient)',
    type: UserInfoDto,
  })
  toUser: UserInfoDto;

  @ApiProperty({
    description: 'Group the settlement belongs to',
    type: GroupInfoDto,
  })
  group: GroupInfoDto;
}
