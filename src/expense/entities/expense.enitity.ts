import { Group } from 'src/group/group.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ExpenseType } from '../enums/expense-type.enum';
import { Split } from './split.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpenseType,
    default: ExpenseType.EQUAL,
  })
  type: ExpenseType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'paid_by_id' })
  paidBy: User;

  @Column({ name: 'paid_by_id' })
  paidById: string;

  @ManyToOne(() => Group, (group) => group.expenses)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ name: 'group_id' })
  groupId: string;

  @OneToMany(() => Split, (split) => split.expense, { cascade: true })
  splits: Split[];
}
