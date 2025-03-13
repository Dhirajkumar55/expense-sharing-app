import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetEntityByIdParamDto } from 'src/shared/dtos/get-entity-by-id-param.dto';
import { UserResponseDto } from './dtos/user-response.dto';

@ApiTags('User endpoints')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user in the system with the provided details.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  createUser(@Body() payload: CreateUserDto) {
    return this.userService.create(payload);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns a list of all users in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  findAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns a specific user by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findUserById(@Param() param: GetEntityByIdParamDto) {
    return this.userService.findByIdOrThrow(param.id);
  }
}
