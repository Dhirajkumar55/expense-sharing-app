import { BadRequestException, Injectable } from '@nestjs/common';
import { SettlementDao } from './settlement.dao';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';
import { CreateSettlementDto } from './dtos/create-settlement.dto';
import { Settlement } from './settlement.entity';
import { ExpenseService } from 'src/expense/expense.service';
import { ISettlement } from './interfaces/settlement.interface';
import { CacheService } from 'src/shared/cache/cache.service';
import { GROUP_BALANCES_CACHE_KEY } from 'src/shared/constants';
import { BalanceResponseDto } from './dtos/balance-response.dto';
import {
  DetailedUserBalanceDto,
  GroupDetailedBalancesDto,
} from './dtos/detailed-balance-response.dto';

@Injectable()
export class SettlementService {
  constructor(
    private readonly settlementDao: SettlementDao,
    private readonly expenseService: ExpenseService,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createSettlementDto: CreateSettlementDto): Promise<ISettlement> {
    if (createSettlementDto.fromUserId === createSettlementDto.toUserId) {
      throw new BadRequestException(
        'Cannot create a settlement between the same user',
      );
    }

    // Validate users exist
    const [fromUser, toUser] = await Promise.all([
      this.userService.findByIdOrThrow(createSettlementDto.fromUserId),
      this.userService.findByIdOrThrow(createSettlementDto.toUserId),
    ]);

    // Validate group exists
    const group = await this.groupService.findByIdOrThrow(
      createSettlementDto.groupId,
    );

    // Validate that both users are members of the group
    const groupMemberIds = group.members.map((member) => member.id);
    if (
      !groupMemberIds.includes(fromUser.id) ||
      !groupMemberIds.includes(toUser.id)
    ) {
      throw new BadRequestException('Both users must be members of the group');
    }

    // Get current balances to ensure the settlement is valid
    const balances = await this.calculateBalances(createSettlementDto.groupId);
    const fromUserBalance =
      balances.find((b) => b.userId === fromUser.id)?.balance ?? 0;
    const toUserBalance =
      balances.find((b) => b.userId === toUser.id)?.balance ?? 0;

    // User can only pay if they have a negative balance (they owe money)
    if (fromUserBalance >= 0) {
      throw new BadRequestException(
        `User ${fromUser.name} does not owe any money in this group`,
      );
    }

    // Ensure the recipient should receive money (positive balance)
    if (toUserBalance <= 0) {
      throw new BadRequestException(
        `User ${toUser.name} is not owed any money in this group`,
      );
    }

    // Ensure the settlement amount isn't more than what is owed
    const maxSettlementAmount = Math.min(
      Math.abs(fromUserBalance),
      toUserBalance,
    );
    if (createSettlementDto.amount > maxSettlementAmount) {
      throw new BadRequestException(
        `Maximum possible settlement amount is ${maxSettlementAmount}`,
      );
    }

    const settlement = await this.settlementDao.create({
      amount: createSettlementDto.amount,
      notes: createSettlementDto.notes || '',
      fromUser,
      toUser,
      group,
    });

    // Invalidate the cache for this group
    await this.invalidateGroupBalancesCache(group.id);

    return this.mapSettlementToResponse(settlement);
  }

  private async invalidateGroupBalancesCache(groupId: string): Promise<void> {
    await this.cacheService.del(`${GROUP_BALANCES_CACHE_KEY}:${groupId}`);
  }

  async findByGroupId(groupId: string): Promise<ISettlement[]> {
    await this.groupService.findByIdOrThrow(groupId);
    const settlements = await this.settlementDao.findByGroupId(groupId);
    return settlements.map((settlement) =>
      this.mapSettlementToResponse(settlement),
    );
  }

  async calculateBalances(groupId: string): Promise<BalanceResponseDto[]> {
    const group = await this.groupService.findByIdOrThrow(groupId);

    // Get all expenses and settlements for the group
    const expenses = await this.expenseService.findByGroupId(groupId);
    const settlements = await this.settlementDao.findByGroupId(groupId);

    // Initialize balances for all group members
    const balances = new Map<
      string,
      { userId: string; userName: string; balance: number }
    >();
    group.members.forEach((member) => {
      balances.set(member.id, {
        userId: member.id,
        userName: member.name,
        balance: 0,
      });
    });

    // Process expenses
    expenses.forEach((expense) => {
      // Add the full amount to the payer's balance (positive = is owed money)
      const payerBalance = balances.get(expense.paidBy.id);
      if (payerBalance) {
        payerBalance.balance += Number(expense.amount);
      }

      // Subtract each split amount from the corresponding user's balance
      expense.splits.forEach((split) => {
        const userBalance = balances.get(split.user.id);
        if (userBalance) {
          userBalance.balance -= Number(split.amount);
        }
      });
    });

    // Process settlements
    settlements.forEach((settlement) => {
      // The user who paid (fromUser) increases their balance
      const fromUserBalance = balances.get(settlement.fromUserId);
      if (fromUserBalance) {
        fromUserBalance.balance += Number(settlement.amount);
      }

      // The user who received (toUser) decreases their balance
      const toUserBalance = balances.get(settlement.toUserId);
      if (toUserBalance) {
        toUserBalance.balance -= Number(settlement.amount);
      }
    });

    return Array.from(balances.values());
  }

  async calculateDetailedBalances(
    groupId: string,
  ): Promise<GroupDetailedBalancesDto> {
    // Try to get from cache first
    const cacheKey = `${GROUP_BALANCES_CACHE_KEY}:${groupId}`;
    const cachedBalances =
      await this.cacheService.get<GroupDetailedBalancesDto>(cacheKey);

    if (cachedBalances) {
      return cachedBalances;
    }

    const group = await this.groupService.findByIdOrThrow(groupId);
    const expenses = await this.expenseService.findByGroupId(groupId);
    const settlements = await this.settlementDao.findByGroupId(groupId);

    // Initialize detailed balances for all members
    const memberBalances: Map<string, DetailedUserBalanceDto> = new Map();

    group.members.forEach((member) => {
      memberBalances.set(member.id, {
        userId: member.id,
        userName: member.name,
        owes: [],
        isOwed: [],
        netBalance: 0,
      });
    });

    // Process expenses to calculate who owes whom
    expenses.forEach((expense) => {
      const payerId = expense.paidBy.id;
      const payerName = expense.paidBy.name;

      // For each split, calculate how much each user owes the payer
      expense.splits.forEach((split) => {
        const userId = split.user.id;
        const userName = split.user.name;
        const amount = Number(split.amount);

        // Skip if the payer is the same as the split user (self-payment)
        if (payerId === userId) return;

        // User owes the payer
        const userBalance = memberBalances.get(userId);
        if (userBalance) {
          // Check if there's already an entry for this payer
          const existingOweIndex = userBalance.owes.findIndex(
            (o) => o.userId === payerId,
          );

          if (existingOweIndex >= 0) {
            userBalance.owes[existingOweIndex].amount += amount;
          } else {
            userBalance.owes.push({
              userId: payerId,
              userName: payerName,
              amount,
            });
          }

          // Update net balance (negative means user owes money)
          userBalance.netBalance -= amount;
        }

        // Payer is owed by the user
        const payerBalance = memberBalances.get(payerId);
        if (payerBalance) {
          // Check if there's already an entry for this user
          const existingOwedIndex = payerBalance.isOwed.findIndex(
            (o) => o.userId === userId,
          );

          if (existingOwedIndex >= 0) {
            payerBalance.isOwed[existingOwedIndex].amount += amount;
          } else {
            payerBalance.isOwed.push({
              userId,
              userName,
              amount,
            });
          }

          // Update net balance (positive means user is owed money)
          payerBalance.netBalance += amount;
        }
      });
    });

    // Process settlements
    settlements.forEach((settlement) => {
      const fromUserId = settlement.fromUserId;
      const toUserId = settlement.toUserId;
      const amount = Number(settlement.amount);

      // Update the payer (fromUser)
      const fromUserBalance = memberBalances.get(fromUserId);
      if (fromUserBalance) {
        // Reduce what the user owes to the recipient
        const existingOweIndex = fromUserBalance.owes.findIndex(
          (o) => o.userId === toUserId,
        );
        if (existingOweIndex >= 0) {
          fromUserBalance.owes[existingOweIndex].amount -= amount;

          // Remove the entry if the amount is zero or negative
          if (fromUserBalance.owes[existingOweIndex].amount <= 0) {
            fromUserBalance.owes.splice(existingOweIndex, 1);
          }
        }

        // Update net balance
        fromUserBalance.netBalance += amount;
      }

      // Update the recipient (toUser)
      const toUserBalance = memberBalances.get(toUserId);
      if (toUserBalance) {
        // Reduce what the recipient is owed by the payer
        const existingOwedIndex = toUserBalance.isOwed.findIndex(
          (o) => o.userId === fromUserId,
        );
        if (existingOwedIndex >= 0) {
          toUserBalance.isOwed[existingOwedIndex].amount -= amount;

          // Remove the entry if the amount is zero or negative
          if (toUserBalance.isOwed[existingOwedIndex].amount <= 0) {
            toUserBalance.isOwed.splice(existingOwedIndex, 1);
          }
        }

        // Update net balance
        toUserBalance.netBalance -= amount;
      }
    });

    // Create the result object
    const result: GroupDetailedBalancesDto = {
      groupId,
      memberBalances: Array.from(memberBalances.values()),
      lastUpdated: new Date(),
    };

    // Store in cache with 1-minute TTL
    await this.cacheService.set(cacheKey, result, 60000);

    return result;
  }

  private mapSettlementToResponse(settlement: Settlement): ISettlement {
    return {
      id: settlement.id,
      amount: Number(settlement.amount),
      notes: settlement.notes,
      createdAt: settlement.createdAt,
      fromUser: {
        id: settlement.fromUser.id,
        name: settlement.fromUser.name,
      },
      toUser: {
        id: settlement.toUser.id,
        name: settlement.toUser.name,
      },
      group: {
        id: settlement.group.id,
        name: settlement.group.name,
      },
    };
  }
}
