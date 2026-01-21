import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskLogDto } from './dto/create-task-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskLog } from './entities/task-log.entity';

@Injectable()
export class TaskLogsService {
  constructor(
    @InjectRepository(TaskLog)
    private readonly taskLogsRepo: Repository<TaskLog>,
  ) {}

  async create(createTaskLogDto: CreateTaskLogDto): Promise<TaskLog> {
    try {
      const log = this.taskLogsRepo.create(createTaskLogDto);
      return await this.taskLogsRepo.save(log);
    } catch (error) {
      throw new InternalServerErrorException('Error creating task log');
    }
  }
}
