import { CreateSplitDto } from '../dtos/create-split.dto';

export interface SplitValidationStrategy {
  validate(amount: number, splits: CreateSplitDto[]): void;
}
