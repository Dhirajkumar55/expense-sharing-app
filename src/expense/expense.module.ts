import { forwardRef, Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { Expense } from './entities/expense.enitity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupModule } from 'src/group/group.module';
import { UserModule } from 'src/user/user.module';
import { Split } from './entities/split.entity';
import { ExpenseDao } from './expense.dao';
import { EqualSplitValidationStrategy } from './strategies/equal-split-validation.strategy';
import { ExactSplitValidationStrategy } from './strategies/exact-split-validation.strategy';
import { PercentageSplitValidationStrategy } from './strategies/percentage-split-validation.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Split]),
    forwardRef(() => UserModule),
    GroupModule,
  ],
  controllers: [ExpenseController],
  providers: [
    ExpenseService,
    ExpenseDao,
    EqualSplitValidationStrategy,
    ExactSplitValidationStrategy,
    PercentageSplitValidationStrategy,
  ],
  exports: [ExpenseService],
})
export class ExpenseModule {}
