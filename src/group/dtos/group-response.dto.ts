import { Group } from '../group.entity';
import { UserResponseDto } from '../../user/dtos/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

class GroupMemberDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;
}

export class GroupResponseDto {
  @ApiProperty({
    description: 'Group ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Group name',
    example: 'Trip to Paris',
  })
  name: string;

  @ApiProperty({
    description: 'Group description',
    example: 'Expenses for our Paris vacation',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'When the group was created',
    example: '2023-07-21T15:30:45.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the group was last updated',
    example: '2023-07-21T15:30:45.123Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Members of the group',
    type: [GroupMemberDto],
  })
  members: GroupMemberDto[];

  constructor(group: Group) {
    this.id = group.id;
    this.name = group.name;
    this.description = group.description;

    if (group.members) {
      this.members = group.members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
      }));
    }
  }
}
