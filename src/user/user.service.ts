import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserDao } from './user.dao';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private userDao: UserDao) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userDao.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    return this.userDao.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userDao.findAll();
    return users;
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.userDao.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async validateUsers(userIds: string[]): Promise<User[]> {
    const users = await this.userDao.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }
    return users;
  }
}
