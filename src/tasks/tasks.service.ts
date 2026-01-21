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

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    try {
      const { responsibleId, tagNames, ...data } = dto;

      const task = this.taskRepo.create(data);

      if (responsibleId) {
        const user = await this.userRepo.findOne({
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

        const existing = await this.tagRepo.findBy({ name: In(normalized) });
        const existingNames = new Set(existing.map((t) => t.name));
        const toCreate = normalized
          .filter((n) => !existingNames.has(n))
          .map((name) => this.tagRepo.create({ name }));

        let created: Tag[] = [];
        if (toCreate.length) {
          created = await this.tagRepo.save(toCreate);
        }

        task.tags = [...existing, ...created];
      }

      return await this.taskRepo.save(task);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al crear la tarea');
    }
  }

  async findAll(query: QueryTasksDto): Promise<{
    items: Task[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      isCompleted,
      isPublic,
      responsibleId,
      search,
    } = query;

    const qb = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.responsible', 'responsible')
      .leftJoinAndSelect('task.tags', 'tags');

    if (typeof isCompleted === 'boolean') {
      qb.andWhere('task.isCompleted = :isCompleted', { isCompleted });
    }

    if (typeof isPublic === 'boolean') {
      qb.andWhere('task.isPublic = :isPublic', { isPublic });
    }

    if (responsibleId) {
      qb.andWhere('responsible.id = :responsibleId', { responsibleId });
    }

    if (search?.trim()) {
      const s = search.trim().toLowerCase();
      qb.andWhere(
        '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
        {
          search: `%${s}%`,
        },
      );
    }

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

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['responsible', 'tags'],
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['responsible', 'tags'],
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    try {
      const { responsibleId, tagNames, ...data } = dto;

      Object.assign(task, data);

      if (typeof responsibleId !== 'undefined') {
        const user = await this.userRepo.findOne({
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
          ? await this.tagRepo.findBy({ name: In(normalized) })
          : [];

        const existingNames = new Set(existing.map((t) => t.name));
        const toCreate = normalized
          .filter((n) => !existingNames.has(n))
          .map((name) => this.tagRepo.create({ name }));

        let created: Tag[] = [];
        if (toCreate.length) {
          created = await this.tagRepo.save(toCreate);
        }

        task.tags = [...existing, ...created];
      }

      return await this.taskRepo.save(task);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al actualizar la tarea');
    }
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const exists = await this.taskRepo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Tarea no encontrada');

    try {
      await this.taskRepo.delete(id);
      return { deleted: true };
    } catch {
      throw new InternalServerErrorException('Error al eliminar la tarea');
    }
  }
}
