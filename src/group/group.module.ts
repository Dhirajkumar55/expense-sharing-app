import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupDao } from './group.dao';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), forwardRef(() => UserModule)],
  controllers: [GroupController],
  providers: [GroupService, GroupDao],
  exports: [GroupService],
})
export class GroupModule {}
