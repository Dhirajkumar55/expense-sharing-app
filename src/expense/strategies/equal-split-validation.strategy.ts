// expense-sharing-app/src/expense/strategies/equal-split-validation-strategy.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { SplitValidationStrategy } from '../interfaces/split-validation-strategy.interface';
import { CreateSplitDto } from '../dtos/create-split.dto';

@Injectable()
export class EqualSplitValidationStrategy implements SplitValidationStrategy {
  validate(amount: number, splits: CreateSplitDto[]): void {
    const expectedEqualAmount = amount / splits.length;
    const tolerance = 0.01;

    for (const split of splits) {
      if (Math.abs(split.amount - expectedEqualAmount) > tolerance) {
        throw new BadRequestException(
          `For EQUAL split type, all amounts must be equal to ${expectedEqualAmount.toFixed(2)}`,
        );
      }
    }
  }
}
