import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { ExpenseDao } from './expense.dao';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { EqualSplitValidationStrategy } from './strategies/equal-split-validation.strategy';
import { ExactSplitValidationStrategy } from './strategies/exact-split-validation.strategy';
import { PercentageSplitValidationStrategy } from './strategies/percentage-split-validation.strategy';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseType } from './enums/expense-type.enum';
import { BadRequestException } from '@nestjs/common';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let userService: UserService;
  let groupService: GroupService;
  let expenseDao: ExpenseDao;

  const mockExpenseDao = {
    createExpense: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByGroupId: jest.fn(),
  };

  const mockUserService = {
    validateUsers: jest.fn(),
  };

  const mockGroupService = {
    findByIdOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: ExpenseDao,
          useValue: mockExpenseDao,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
        EqualSplitValidationStrategy,
        ExactSplitValidationStrategy,
        PercentageSplitValidationStrategy,
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    userService = module.get<UserService>(UserService);
    groupService = module.get<GroupService>(GroupService);
    expenseDao = module.get<ExpenseDao>(ExpenseDao);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException when there are duplicate userIds in splits', async () => {
      // Arrange
      const createExpenseDto: CreateExpenseDto = {
        description: 'Test Expense',
        amount: 100,
        type: ExpenseType.EQUAL,
        paidById: 'user1',
        groupId: 'group1',
        splits: [
          { userId: 'user1', amount: 50 },
          { userId: 'user1', amount: 50 }, // Duplicate userId
        ],
      };

      // Act & Assert
      await expect(service.create(createExpenseDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserService.validateUsers).not.toHaveBeenCalled();
      expect(mockGroupService.findByIdOrThrow).toHaveBeenCalledWith('group1');
    });

    it('should create an expense when there are no duplicate userIds in splits', async () => {
      // Arrange
      const createExpenseDto: CreateExpenseDto = {
        description: 'Test Expense',
        amount: 100,
        type: ExpenseType.EQUAL,
        paidById: 'user1',
        groupId: 'group1',
        splits: [
          { userId: 'user1', amount: 50 },
          { userId: 'user2', amount: 50 },
        ],
      };

      const mockUser1 = { id: 'user1', name: 'User 1' };
      const mockUser2 = { id: 'user2', name: 'User 2' };
      const mockGroup = {
        id: 'group1',
        name: 'Group 1',
        members: [mockUser1, mockUser2],
      };
      const mockExpense = {
        id: 'expense1',
        description: 'Test Expense',
        amount: 100,
        type: ExpenseType.EQUAL,
        paidBy: mockUser1,
        paidById: 'user1',
        group: mockGroup,
        groupId: 'group1',
        splits: [
          {
            id: 'split1',
            amount: 50,
            user: mockUser1,
            userId: 'user1',
          },
          {
            id: 'split2',
            amount: 50,
            user: mockUser2,
            userId: 'user2',
          },
        ],
        createdAt: new Date(),
      };

      mockUserService.validateUsers.mockResolvedValueOnce([mockUser1]);
      mockUserService.validateUsers.mockResolvedValueOnce([
        mockUser1,
        mockUser2,
      ]);
      mockGroupService.findByIdOrThrow.mockResolvedValueOnce(mockGroup);
      mockExpenseDao.createExpense.mockResolvedValueOnce(mockExpense);

      // Act
      await service.create(createExpenseDto);

      // Assert
      expect(mockUserService.validateUsers).toHaveBeenCalledWith(['user1']);
      expect(mockUserService.validateUsers).toHaveBeenCalledWith([
        'user1',
        'user2',
      ]);
      expect(mockGroupService.findByIdOrThrow).toHaveBeenCalledWith('group1');
      expect(mockExpenseDao.createExpense).toHaveBeenCalled();
    });
  });
});
