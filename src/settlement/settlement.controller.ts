import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateSettlementDto } from './dtos/create-settlement.dto';
import { SettlementService } from './settlement.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetEntityByGroupIdParamDto } from 'src/shared/dtos/get-entity-by-group-id-param.dto';
import { ISettlement } from './interfaces/settlement.interface';
import { BalanceResponseDto } from './dtos/balance-response.dto';
import { GroupDetailedBalancesDto } from './dtos/detailed-balance-response.dto';
import { SettlementResponseDto } from './dtos/settlement-response.dto';

@ApiTags('Settlement Endpoints')
@Controller('settlements')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new settlement',
    description:
      'Creates a settlement between two users in a group. The fromUser pays the toUser the specified amount to settle debts.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Settlement created successfully',
    type: SettlementResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid settlement data or users not in debt',
  })
  async create(
    @Body() createSettlementDto: CreateSettlementDto,
  ): Promise<ISettlement> {
    return this.settlementService.create(createSettlementDto);
  }

  @Get('group/:groupId')
  @ApiOperation({
    summary: 'Get all settlements for a group',
    description:
      'Returns all settlements that have been made within the specified group',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of settlements for the group',
    type: [SettlementResponseDto],
  })
  async findByGroupId(
    @Param() param: GetEntityByGroupIdParamDto,
  ): Promise<ISettlement[]> {
    return this.settlementService.findByGroupId(param.groupId);
  }

  @Get('balances/:groupId')
  @ApiOperation({
    summary: 'Get simple balances for a group',
    description:
      'Returns the net balance for each member in the group. Positive balance means the user is owed money, negative means they owe money.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of member balances',
    type: [BalanceResponseDto],
  })
  async getBalances(
    @Param() param: GetEntityByGroupIdParamDto,
  ): Promise<BalanceResponseDto[]> {
    return this.settlementService.calculateBalances(param.groupId);
  }

  @Get('detailed-balances/:groupId')
  @ApiOperation({
    summary: 'Get detailed balances for a group',
    description:
      'Returns detailed information about who owes whom in the group. For each member, shows who they owe money to, who owes them money, and their net balance. Results are cached for 1 minute.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detailed balances for all members in the group',
    type: GroupDetailedBalancesDto,
  })
  async getDetailedBalances(
    @Param() param: GetEntityByGroupIdParamDto,
  ): Promise<GroupDetailedBalancesDto> {
    return this.settlementService.calculateDetailedBalances(param.groupId);
  }
}
