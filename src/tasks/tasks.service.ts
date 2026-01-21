import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-task.dto';
import { User } from 'src/users/user.entity';
import { Tag } from './entities/tag.entity';
import { TaskLog } from 'src/task-logs/entities/task-log.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(TaskLog)
    private readonly taskLogRepo: Repository<TaskLog>,
  ) {}

  private async isOwner(taskId: number, userId: number): Promise<boolean> {
    if (!userId || userId <= 0) return false;
    return this.taskLogRepo.exists({
      where: { entity: 'task', action: 'create', entityId: taskId, userId },
    });
  }

  async create(dto: CreateTaskDto, userId: number): Promise<Task> {
    try {
      const { responsibleId, tagNames, ...data } = dto;

      const task = this.taskRepository.create(data);

      if (responsibleId) {
        const user = await this.userRepository.findOne({
          where: { id: responsibleId },
        });
        if (!user)
          throw new BadRequestException(
            'El responsable especificado no existe',
          );
        task.responsible = user;
      }

      if (tagNames?.length) {
        const normalized = Array.from(
          new Set(tagNames.map((n) => n.trim()).filter((n) => n.length)),
        );

        const existing = await this.tagRepository.findBy({
          name: In(normalized),
        });
        const existingNames = new Set(existing.map((t) => t.name));
        const toCreate = normalized
          .filter((n) => !existingNames.has(n))
          .map((name) => this.tagRepository.create({ name }));
        let created: Tag[] = [];
        if (toCreate.length) {
          created = await this.tagRepository.save(toCreate);
        }

        task.tags = [...existing, ...created];
      }

      const saved = await this.taskRepository.save(task);
      await this.taskLogRepo.save(
        this.taskLogRepo.create({
          action: 'create',
          entity: 'task',
          entityId: saved.id,
          userId,
          description: 'Task created',
        }),
      );

      return saved;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al crear la tarea');
    }
  }

  async findAll(
    query: QueryTasksDto,
    userId?: number,
  ): Promise<{
    items: Task[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 10 } = query;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.responsible', 'responsible')
      .leftJoinAndSelect('task.tags', 'tags')
      .leftJoin(
        TaskLog,
        'log',
        'log.entity = :entity AND log.action = :action AND log.entityId = task.id',
        {
          entity: 'task',
          action: 'create',
        },
      )
      .where('task.deletedAt IS NULL')
      .distinct(true);

    userId
      ? qb.andWhere('(task.isPublic = TRUE OR log.userId = :userId)', {
          userId,
        })
      : qb.andWhere('task.isPublic = TRUE');

    qb.orderBy('task.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    try {
      const [items, total] = await qb.getManyAndCount();
      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch {
      throw new InternalServerErrorException('Error al consultar las tareas');
    }
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['responsible', 'tags'],
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    if (!task.isPublic) {
      const owns = await this.isOwner(id, userId);
      if (!owns) throw new NotFoundException('Tarea no encontrada');
    }
    return task;
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['responsible', 'tags'],
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    if (!task.isPublic) {
      const owns = await this.isOwner(id, userId);
      if (!owns) throw new NotFoundException('Tarea no encontrada');
    }
    try {
      const { responsibleId, tagNames, ...data } = dto;

      Object.assign(task, data);

      if (typeof responsibleId !== 'undefined') {
        const user = await this.userRepository.findOne({
          where: { id: responsibleId },
        });
        if (!user)
          throw new BadRequestException(
            'El responsable especificado no existe',
          );
        task.responsible = user;
      }

      if (Array.isArray(tagNames)) {
        const normalized = Array.from(
          new Set(tagNames.map((n) => n.trim()).filter((n) => n.length)),
        );

        const existing = normalized.length
          ? await this.tagRepository.findBy({ name: In(normalized) })
          : [];

        const existingNames = new Set(existing.map((t) => t.name));
        const toCreate = normalized
          .filter((n) => !existingNames.has(n))
          .map((name) => this.tagRepository.create({ name }));

        let created: Tag[] = [];
        if (toCreate.length) {
          created = await this.tagRepository.save(toCreate);
        }

        task.tags = [...existing, ...created];
      }

      const saved = await this.taskRepository.save(task);
      await this.taskLogRepo.save(
        this.taskLogRepo.create({
          action: 'update',
          entity: 'task',
          entityId: saved.id,
          userId,
          description: 'Task updated',
        }),
      );
      return saved;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al actualizar la tarea');
    }
  }

  async remove(id: number, userId: number): Promise<{ deleted: boolean }> {
    const exists = await this.taskRepository.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Tarea no encontrada');
    if (!exists.isPublic) {
      const owns = await this.isOwner(id, userId);
      if (!owns) throw new NotFoundException('Tarea no encontrada');
    }

    try {
      await this.taskRepository.softDelete(id);
      await this.taskLogRepo.save(
        this.taskLogRepo.create({
          action: 'delete',
          entity: 'task',
          entityId: id,
          description: 'Task deleted',
          userId,
        }),
      );
      return { deleted: true };
    } catch {
      throw new InternalServerErrorException('Error al eliminar la tarea');
    }
  }
}
