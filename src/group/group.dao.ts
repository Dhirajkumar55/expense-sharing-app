import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Group } from './group.entity';

@Injectable()
export class GroupDao {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(ctx: {
    name: string;
    description?: string;
    members: User[];
  }): Promise<Group> {
    const group = this.groupRepository.create(ctx);
    return this.groupRepository.save(group);
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find({ relations: ['members'] });
  }

  async findById(id: string): Promise<Group | null> {
    return this.groupRepository.findOne({
      where: { id },
      relations: ['members'],
    });
  }

  async addMembers(group: Group, newMembers: User[]): Promise<Group> {
    const memberMap = new Map(
      group.members.map((member) => [member.id, member]),
    );
    newMembers.forEach((member) => memberMap.set(member.id, member));
    group.members = Array.from(memberMap.values());
    return this.groupRepository.save(group);
  }
}
