import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Expense } from './entities/expense.enitity';
import { UserService } from 'src/user/user.service';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseType } from './enums/expense-type.enum';
import { ExpenseDao } from './expense.dao';
import { GroupService } from 'src/group/group.service';
import { SplitValidationStrategy } from './interfaces/split-validation-strategy.interface';
import { EqualSplitValidationStrategy } from './strategies/equal-split-validation.strategy';
import { ExactSplitValidationStrategy } from './strategies/exact-split-validation.strategy';
import { PercentageSplitValidationStrategy } from './strategies/percentage-split-validation.strategy';
import { User } from 'src/user/user.entity';
import { IExpense } from './interfaces/expense.interface';
import { Group } from 'src/group/group.entity';
import { CacheService } from 'src/shared/cache/cache.service';
import { GROUP_BALANCES_CACHE_KEY } from 'src/shared/constants';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly expenseDao: ExpenseDao,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly equalSplitValidationStrategy: EqualSplitValidationStrategy,
    private readonly exactSplitValidationStrategy: ExactSplitValidationStrategy,
    private readonly percentageSplitValidationStrategy: PercentageSplitValidationStrategy,
    private readonly cacheService: CacheService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<IExpense> {
    const userIds = createExpenseDto.splits.map((split) => split.userId);
    const uniqueUserIds = new Set(userIds);
    const [paidBy, group, users] = await Promise.all([
      this.userService.findByIdOrThrow(createExpenseDto.paidById),
      this.groupService.findByIdOrThrow(createExpenseDto.groupId),
      this.userService.validateUsers([...uniqueUserIds]),
    ]);

    this.validateExpense({ createExpenseDto, group });

    const userMap = new Map(users.map((user) => [user.id, user]));
    const splits = createExpenseDto.splits.map((split) => ({
      user: userMap.get(split.userId) as User,
      amount: split.amount,
      percentage: split.percentage,
    }));

    const expense = await this.expenseDao.createExpense({
      description: createExpenseDto.description,
      amount: createExpenseDto.amount,
      type: createExpenseDto.type,
      paidBy,
      group,
      splits,
    });

    await this.invalidateGroupBalancesCache(group.id);

    return this.mapExpenseToResponse(expense);
  }

  private async invalidateGroupBalancesCache(groupId: string): Promise<void> {
    await this.cacheService.del(`${GROUP_BALANCES_CACHE_KEY}:${groupId}`);
  }

  async findAll(): Promise<IExpense[]> {
    const expenses = await this.expenseDao.findAll();
    return expenses.map((expense) => this.mapExpenseToResponse(expense));
  }

  async findByIdOrThrow(id: string): Promise<IExpense> {
    const expense = await this.expenseDao.findById(id);
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return this.mapExpenseToResponse(expense);
  }

  async findByGroupId(groupId: string): Promise<IExpense[]> {
    await this.groupService.findByIdOrThrow(groupId);
    const expenses = await this.expenseDao.findByGroupId(groupId);
    return expenses.map((expense) => this.mapExpenseToResponse(expense));
  }

  private validateExpense(ctx: {
    createExpenseDto: CreateExpenseDto;
    group: Group;
  }) {
    const { createExpenseDto, group } = ctx;
    const userIds = createExpenseDto.splits.map((split) => split.userId);
    const uniqueUserIds = new Set(userIds);

    if (userIds.length !== uniqueUserIds.size) {
      const duplicateUserIds = userIds.filter(
        (id, index) => userIds.indexOf(id) !== index,
      );
      throw new BadRequestException(
        `Duplicate user IDs found in splits: ${duplicateUserIds.join(', ')}. Each user can only appear once in splits.`,
      );
    }

    const groupMemberIds = new Set(group.members.map((member) => member.id));
    const nonMemberIds = [...uniqueUserIds].filter(
      (id) => !groupMemberIds.has(id),
    );
    if (nonMemberIds.length > 0) {
      throw new BadRequestException(
        `Users with IDs ${nonMemberIds.join(', ')} are not members of this group`,
      );
    }

    const isPayerAMemberOfGroup = groupMemberIds.has(createExpenseDto.paidById);
    if (!isPayerAMemberOfGroup) {
      throw new BadRequestException('Payer must be a member of the group');
    }

    this.validateSplits(createExpenseDto);
  }

  private validateSplits(createExpenseDto: CreateExpenseDto): void {
    const { amount, type, splits } = createExpenseDto;

    if (!splits || splits.length === 0) {
      throw new BadRequestException('At least one split is required');
    }

    const expenseTypeToValidationMap: Record<
      ExpenseType,
      SplitValidationStrategy
    > = {
      [ExpenseType.EQUAL]: this.equalSplitValidationStrategy,
      [ExpenseType.EXACT]: this.exactSplitValidationStrategy,
      [ExpenseType.PERCENTAGE]: this.percentageSplitValidationStrategy,
    };

    const validationStrategy = expenseTypeToValidationMap[type];

    validationStrategy.validate(amount, splits);
  }

  private mapExpenseToResponse(expense: Expense): IExpense {
    return {
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      type: expense.type,
      createdAt: expense.createdAt,
      paidBy: {
        id: expense.paidBy.id,
        name: expense.paidBy.name,
      },
      group: {
        id: expense.group.id,
        name: expense.group.name,
      },
      splits: expense.splits.map((split) => ({
        id: split.id,
        amount: Number(split.amount),
        percentage: split.percentage ? Number(split.percentage) : undefined,
        user: {
          id: split.user.id,
          name: split.user.name,
        },
      })),
    };
  }
}
