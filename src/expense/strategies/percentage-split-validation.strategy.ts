// expense-sharing-app/src/expense/strategies/percentage-split-validation-strategy.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { SplitValidationStrategy } from '../interfaces/split-validation-strategy.interface';
import { CreateSplitDto } from '../dtos/create-split.dto';

@Injectable()
export class PercentageSplitValidationStrategy
  implements SplitValidationStrategy
{
  validate(amount: number, splits: CreateSplitDto[]): void {
    let totalSplitPercentage = 0;

    for (const split of splits) {
      if (!split.percentage) {
        throw new BadRequestException(
          'For PERCENTAGE split type, percentage is required for each split',
        );
      }
      totalSplitPercentage += split.percentage;

      const expectedAmount = (amount * split.percentage) / 100;
      if (Math.abs(split.amount - expectedAmount) > 0.01) {
        throw new BadRequestException(
          `Split amount ${split.amount.toFixed(2)} does not match the expected amount ${expectedAmount.toFixed(2)} for percentage ${split.percentage}%`,
        );
      }
    }

    if (Math.abs(totalSplitPercentage - 100) > 0.01) {
      throw new BadRequestException(
        `For PERCENTAGE split type, the sum of percentages (${totalSplitPercentage.toFixed(2)}%) must equal 100%`,
      );
    }
  }
}
