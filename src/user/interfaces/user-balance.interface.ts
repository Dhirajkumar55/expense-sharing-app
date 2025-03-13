export interface UserBalanceDetail {
  userId: string;
  userName: string;
  amount: number;
}

export interface UserBalanceSummary {
  // Positive amounts mean the user is owed money
  // Negative amounts mean the user owes money
  owedByOthers: UserBalanceDetail[]; // People who owe money to the user
  owesToOthers: UserBalanceDetail[]; // People the user owes money to
  netBalance: number; // Total net balance
}
