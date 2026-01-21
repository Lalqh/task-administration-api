import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Delete } from '@nestjs/common';

@Entity('tasks')
export class Task {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Fix login bug', maxLength: 255 })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ example: 'Investigate and resolve the login issue' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @ApiProperty({ example: '2026-01-31T00:00:00.000Z', description: 'ISO-8601 string (returned as Date)' })
  @Column({ type: 'timestamp' })
  dueDate: Date;

  @ApiPropertyOptional({ example: 'Needs review by PO' })
  @Column({ type: 'text', nullable: true })
  comments?: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean' })
  isPublic: boolean;

  @ApiPropertyOptional({ type: () => User, description: 'Responsible user (nullable)' })
  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  responsible?: User;

  @ApiPropertyOptional({ type: () => [Tag], description: 'Associated tags' })
  @ManyToMany(() => Tag, (tag) => tag.tasks, {
    cascade: true,
  })
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: Tag[];

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}