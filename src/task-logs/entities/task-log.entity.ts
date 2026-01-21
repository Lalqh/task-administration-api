import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('task_logs')
export class TaskLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50 })
  entity: string;

  @Column({type: 'int'})
  entityId: number;

  @Column({type: 'int'})
  userId: number;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}