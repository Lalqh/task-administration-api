import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Task } from './task.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tags')
export class Tag {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'backend' })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @ManyToMany(() => Task, (task) => task.tags)
  tasks?: Task[];
}