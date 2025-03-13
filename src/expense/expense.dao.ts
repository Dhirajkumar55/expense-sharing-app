import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/group/group.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.enitity';
import { Split } from './entities/split.entity';
import { ExpenseType } from './enums/expense-type.enum';

@Injectable()
export class ExpenseDao {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Split)
    private readonly splitRepository: Repository<Split>,
  ) {}

  async createExpense(ctx: {
    description: string;
    amount: number;
    type: ExpenseType;
    paidBy: User;
    group: Group;
    splits: Array<{ user: User; amount: number; percentage?: number }>;
  }): Promise<Expense> {
    const expense = this.expenseRepository.create({
      description: ctx.description,
      amount: ctx.amount,
      type: ctx.type,
      paidBy: ctx.paidBy,
      paidById: ctx.paidBy.id,
      group: ctx.group,
      groupId: ctx.group.id,
    });

    const savedExpense = await this.expenseRepository.save(expense);

    const splitEntities = ctx.splits.map((split) =>
      this.splitRepository.create({
        amount: split.amount,
        percentage: split.percentage,
        user: split.user,
        userId: split.user.id,
        expense: savedExpense,
        expenseId: savedExpense.id,
      }),
    );

    savedExpense.splits = await this.splitRepository.save(splitEntities);
    return savedExpense;
  }

  findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({
      relations: ['paidBy', 'group', 'splits', 'splits.user'],
    });
  }

  findById(id: string): Promise<Expense | null> {
    return this.expenseRepository.findOne({
      where: { id },
      relations: ['paidBy', 'group', 'splits', 'splits.user'],
    });
  }

  findByGroupId(groupId: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { groupId },
      relations: ['paidBy', 'group', 'splits', 'splits.user'],
    });
  }
}
