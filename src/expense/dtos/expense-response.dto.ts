import { ApiProperty } from '@nestjs/swagger';
import { ExpenseType } from '../enums/expense-type.enum';

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

class SplitDto {
  @ApiProperty({
    description: 'Split ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Split amount',
    example: 25.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Split percentage (only for percentage splits)',
    example: 33.33,
    required: false,
  })
  percentage?: number;

  @ApiProperty({
    description: 'User this split belongs to',
    type: UserInfoDto,
  })
  user: UserInfoDto;
}

export class ExpenseResponseDto {
  @ApiProperty({
    description: 'Expense ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Expense description',
    example: 'Dinner at Restaurant',
  })
  description: string;

  @ApiProperty({
    description: 'Total expense amount',
    example: 100.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Type of expense split',
    enum: ExpenseType,
    example: ExpenseType.EQUAL,
  })
  type: ExpenseType;

  @ApiProperty({
    description: 'When the expense was created',
    example: '2023-07-21T15:30:45.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User who paid for the expense',
    type: UserInfoDto,
  })
  paidBy: UserInfoDto;

  @ApiProperty({
    description: 'Group the expense belongs to',
    type: GroupInfoDto,
  })
  group: GroupInfoDto;

  @ApiProperty({
    description: 'How the expense is split among users',
    type: [SplitDto],
  })
  splits: SplitDto[];
}
