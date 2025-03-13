import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settlement } from './settlement.entity';
import { User } from 'src/user/user.entity';
import { Group } from 'src/group/group.entity';

@Injectable()
export class SettlementDao {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
  ) {}

  async create(ctx: {
    amount: number;
    notes: string;
    fromUser: User;
    toUser: User;
    group: Group;
  }): Promise<Settlement> {
    const settlement = this.settlementRepository.create({
      amount: ctx.amount,
      notes: ctx.notes,
      fromUser: ctx.fromUser,
      fromUserId: ctx.fromUser.id,
      toUser: ctx.toUser,
      toUserId: ctx.toUser.id,
      group: ctx.group,
      groupId: ctx.group.id,
    });
    return this.settlementRepository.save(settlement);
  }

  async findByGroupId(groupId: string): Promise<Settlement[]> {
    return this.settlementRepository.find({
      where: { groupId },
      relations: ['fromUser', 'toUser', 'group'],
    });
  }
}
