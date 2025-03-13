import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupDao } from './group.dao';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Group } from './group.entity';
import { UserService } from 'src/user/user.service';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { IGroup } from './interfaces/group.interface';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupDao: GroupDao,
    private readonly userService: UserService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<IGroup> {
    const members = await this.userService.validateUsers(
      createGroupDto.memberIds,
    );

    const group = await this.groupDao.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
      members,
    });

    return this.mapGroupToResponse(group);
  }

  async update(ctx: {
    id: string;
    updateGroupDto: UpdateGroupDto;
  }): Promise<IGroup> {
    const { id, updateGroupDto } = ctx;

    // Fetch the existing group
    const existingGroup = await this.groupDao.findById(id);
    if (!existingGroup) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }

    const newMembers = await this.userService.validateUsers(
      updateGroupDto.memberIds,
    );

    const updatedGroup = await this.groupDao.addMembers(
      existingGroup,
      newMembers,
    );

    return this.mapGroupToResponse(updatedGroup);
  }

  async findAll(): Promise<IGroup[]> {
    const groups = await this.groupDao.findAll();
    return groups.map((group) => this.mapGroupToResponse(group));
  }

  async findById(id: string): Promise<IGroup> {
    const group = await this.groupDao.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return this.mapGroupToResponse(group);
  }

  async findByIdOrThrow(id: string): Promise<Group> {
    const group = await this.groupDao.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  private mapGroupToResponse(group: Group): IGroup {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
      })),
    };
  }
}
