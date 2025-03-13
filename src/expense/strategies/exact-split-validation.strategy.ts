import { BadRequestException, Injectable } from '@nestjs/common';
import { SplitValidationStrategy } from '../interfaces/split-validation-strategy.interface';
import { CreateSplitDto } from '../dtos/create-split.dto';

@Injectable()
export class ExactSplitValidationStrategy implements SplitValidationStrategy {
  validate(amount: number, splits: CreateSplitDto[]): void {
    let totalSplitAmount = 0;

    for (const split of splits) {
      totalSplitAmount += split.amount;
    }

    if (Math.abs(totalSplitAmount - amount) > 0.01) {
      throw new BadRequestException(
        `For EXACT split type, the sum of split amounts (${totalSplitAmount.toFixed(2)}) must equal the expense amount (${amount.toFixed(2)})`,
      );
    }
  }
}
