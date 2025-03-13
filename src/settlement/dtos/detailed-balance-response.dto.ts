import { ApiProperty } from '@nestjs/swagger';

class UserDebtDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'Amount of money',
    example: 25.5,
  })
  amount: number;
}

export class DetailedUserBalanceDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'List of users this user owes money to',
    type: [UserDebtDto],
  })
  owes: UserDebtDto[];

  @ApiProperty({
    description: 'List of users who owe money to this user',
    type: [UserDebtDto],
  })
  isOwed: UserDebtDto[];

  @ApiProperty({
    description:
      'Net balance amount. Positive means user is owed money, negative means user owes money.',
    example: -25.5,
  })
  netBalance: number;
}

export class GroupDetailedBalancesDto {
  @ApiProperty({
    description: 'Group ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  groupId: string;

  @ApiProperty({
    description: 'Detailed balances for each member in the group',
    type: [DetailedUserBalanceDto],
  })
  memberBalances: DetailedUserBalanceDto[];

  @ApiProperty({
    description: 'When the balances were last calculated',
    example: '2023-07-21T15:30:45.123Z',
  })
  lastUpdated: Date;
}
