import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskLogsService } from './task-logs.service';
import { TaskLog } from './entities/task-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskLog])],
  providers: [TaskLogsService],
})
export class TaskLogsModule {}
