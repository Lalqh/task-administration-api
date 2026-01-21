import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Tag } from './entities/tag.entity';
import { User } from 'src/users/user.entity';
import { TaskLog } from 'src/task-logs/entities/task-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Tag, User, TaskLog])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
