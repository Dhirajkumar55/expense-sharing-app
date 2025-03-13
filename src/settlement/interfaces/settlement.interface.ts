export interface ISettlement {
  id: string;
  amount: number;
  notes?: string;
  createdAt: Date;
  fromUser: {
    id: string;
    name: string;
  };
  toUser: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  };
}
