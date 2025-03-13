import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dtos/create-group.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetEntityByIdParamDto } from 'src/shared/dtos/get-entity-by-id-param.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { IGroup } from './interfaces/group.interface';
import { GroupResponseDto } from './dtos/group-response.dto';

@ApiTags('Group endpoints')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new group',
    description: 'Creates a new group with specified members.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Group created successfully',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid group data or member IDs',
  })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<IGroup> {
    return this.groupService.create(createGroupDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update group members',
    description: 'Adds new members to an existing group.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group updated successfully',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid member IDs',
  })
  async update(
    @Param() param: GetEntityByIdParamDto,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<IGroup> {
    return this.groupService.update({ id: param.id, updateGroupDto });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all groups',
    description: 'Returns a list of all groups with their members.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all groups',
    type: [GroupResponseDto],
  })
  async findAll(): Promise<IGroup[]> {
    return this.groupService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get group by ID',
    description: 'Returns a specific group with its members.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The group',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  async findById(@Param() param: GetEntityByIdParamDto): Promise<IGroup> {
    return this.groupService.findById(param.id);
  }
}
