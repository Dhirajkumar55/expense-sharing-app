import { forwardRef, Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { SettlementDao } from './settlement.dao';
import { ExpenseModule } from 'src/expense/expense.module';
import { GroupModule } from 'src/group/group.module';
import { UserModule } from 'src/user/user.module';
import { Settlement } from './settlement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settlement]),
    forwardRef(() => ExpenseModule),
    GroupModule,
    UserModule,
  ],
  controllers: [SettlementController],
  providers: [SettlementService, SettlementDao],
})
export class SettlementModule {}
