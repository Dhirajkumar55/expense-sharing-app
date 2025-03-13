import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetEntityByGroupIdParamDto } from 'src/shared/dtos/get-entity-by-group-id-param.dto';
import { GetEntityByIdParamDto } from 'src/shared/dtos/get-entity-by-id-param.dto';
import { IExpense } from './interfaces/expense.interface';
import { ExpenseResponseDto } from './dtos/expense-response.dto';

@ApiTags('Expense endpoints')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new expense',
    description:
      'Creates a new expense in a group with specified splits among members. This will invalidate the group balance cache.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Expense created successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid expense data or split validation failed',
  })
  create(@Body() createExpenseDto: CreateExpenseDto): Promise<IExpense> {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all expenses',
    description: 'Returns all expenses across all groups',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all expenses',
    type: [ExpenseResponseDto],
  })
  findAll(): Promise<IExpense[]> {
    return this.expenseService.findAll();
  }

  @Get('group/:groupId')
  @ApiOperation({
    summary: 'Get all expenses for a group',
    description:
      'Returns all expenses that have been created within the specified group',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of expenses for the group',
    type: [ExpenseResponseDto],
  })
  findByGroupId(
    @Param() param: GetEntityByGroupIdParamDto,
  ): Promise<IExpense[]> {
    return this.expenseService.findByGroupId(param.groupId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get expense by ID',
    description: 'Returns a specific expense by its ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The expense',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Expense not found',
  })
  findById(@Param() param: GetEntityByIdParamDto): Promise<IExpense> {
    return this.expenseService.findByIdOrThrow(param.id);
  }
}
