export interface IGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  members: {
    id: string;
    name: string;
    email: string;
  }[];
}
