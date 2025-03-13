export interface ISplit {
  id: string;
  amount: number;
  percentage?: number;
  user: {
    id: string;
    name: string;
  };
}
