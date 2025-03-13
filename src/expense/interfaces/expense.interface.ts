import { ExpenseType } from '../enums/expense-type.enum';
import { ISplit } from './split-response.interface';

export interface IExpense {
  id: string;
  description: string;
  amount: number;
  type: ExpenseType;
  paidBy: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  };
  splits: ISplit[];
  createdAt: Date;
}
