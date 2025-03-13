import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalance } from './entities/user-balance.entity';
import { User } from './user.entity';

@Injectable()
export class UserBalanceDao {
  constructor(
    @InjectRepository(UserBalance)
    private readonly userBalanceRepository: Repository<UserBalance>,
  ) {}

  async upsertBalance(ctx: {
    fromUser: User;
    toUser: User;
    amount: number;
  }): Promise<UserBalance> {
    // Try to find existing balance between these users
    const existingBalance = await this.userBalanceRepository.findOne({
      where: [
        { fromUserId: ctx.fromUser.id, toUserId: ctx.toUser.id },
        { fromUserId: ctx.toUser.id, toUserId: ctx.fromUser.id },
      ],
    });

    if (existingBalance) {
      // If balance exists, update it
      if (existingBalance.fromUserId === ctx.fromUser.id) {
        existingBalance.amount = Number(existingBalance.amount) + ctx.amount;
      } else {
        existingBalance.amount = Number(existingBalance.amount) - ctx.amount;
        // If balance becomes negative, swap users to maintain convention
        if (existingBalance.amount < 0) {
          const temp = existingBalance.fromUser;
          existingBalance.fromUser = existingBalance.toUser;
          existingBalance.toUser = temp;
          existingBalance.fromUserId = existingBalance.fromUser.id;
          existingBalance.toUserId = existingBalance.toUser.id;
          existingBalance.amount = Math.abs(existingBalance.amount);
        }
      }
      return this.userBalanceRepository.save(existingBalance);
    }

    // If no balance exists, create new one
    const balance = this.userBalanceRepository.create({
      fromUser: ctx.fromUser,
      toUser: ctx.toUser,
      fromUserId: ctx.fromUser.id,
      toUserId: ctx.toUser.id,
      amount: ctx.amount,
    });

    return this.userBalanceRepository.save(balance);
  }

  async findBalancesByUserId(userId: string): Promise<UserBalance[]> {
    return this.userBalanceRepository.find({
      where: [{ fromUserId: userId }, { toUserId: userId }],
      relations: ['fromUser', 'toUser'],
    });
  }

  async recalculateBalances(
    userId: string,
    balances: Map<string, number>,
  ): Promise<void> {
    // Delete all existing balances for this user
    await this.userBalanceRepository
      .createQueryBuilder()
      .delete()
      .where('fromUserId = :userId OR toUserId = :userId', { userId })
      .execute();

    // Create new balance records
    const balancePromises = Array.from(balances.entries()).map(
      ([otherUserId, amount]) => {
        if (amount === 0) return null;

        const balance = this.userBalanceRepository.create({
          fromUserId: amount > 0 ? otherUserId : userId,
          toUserId: amount > 0 ? userId : otherUserId,
          amount: Math.abs(amount),
        });

        return this.userBalanceRepository.save(balance);
      },
    );

    await Promise.all(balancePromises.filter(Boolean));
  }
}
