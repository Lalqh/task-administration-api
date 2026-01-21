import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBody,
  getSchemaPath,
  ApiExtraModels,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ApiAuthHeader,
  ApiIdParam,
  ApiNotFound,
  ApiValidationError,
} from 'src/common/decorators/swagger.decorators';
import { UserId } from 'src/common/decorators/user-id.decorator';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-task.dto';
import { HeaderUserGuard } from 'src/common/guards/header-user.guard';
import { Task } from './entities/task.entity';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('tasks')
@UseGuards(HeaderUserGuard)
@ApiTags('tasks')
@ApiExtraModels(CreateTaskDto, UpdateTaskDto)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiAuthHeader()
  @ApiBody({
    description: 'Task payload',
    schema: {
      $ref: getSchemaPath(CreateTaskDto),
      example: {
        title: 'Fix login bug',
        description: 'Investigate and resolve the login issue',
        status: 'pending',
        dueDate: '2026-01-31T00:00:00.000Z',
        tagNames: ['backend', 'priority'],
        priority: 'high',
      },
    },
  })
  @ApiCreatedResponse({ description: 'Task created', type: Task })
  @ApiValidationError()
  create(@Body() dto: CreateTaskDto, @UserId() userId: number) {
    return this.tasksService.create(dto, userId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List tasks' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Page size (max 100)',
    example: 10,
  })
  @ApiAuthHeader()
  @ApiOkResponse({ description: 'Tasks fetched', type: Task, isArray: true })
  findAll(@Query() query: QueryTasksDto, @UserId() userId?: number) {
    return this.tasksService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  @ApiIdParam()
  @ApiAuthHeader()
  @Public()
  @ApiOkResponse({ description: 'Task found', type: Task })
  @ApiNotFound('Task not found')
  findOne(@Param('id', ParseIntPipe) id: number, @UserId() userId: number) {
    return this.tasksService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiIdParam()
  @ApiAuthHeader()
  @Public()
  @ApiBody({
    description: 'Task payload',
    schema: {
      $ref: getSchemaPath(CreateTaskDto),
      example: {
        title: 'Fix login bug',
        description: 'Investigate and resolve the login issue',
        status: 'pending',
        dueDate: '2026-01-31T00:00:00.000Z',
        tagNames: ['backend', 'priority'],
        priority: 'high',
      },
    },
  })
  @ApiOkResponse({ description: 'Task updated', type: Task })
  @ApiValidationError()
  @ApiAuthHeader()
  @ApiNotFound('Task not found')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @UserId() userId: number,
  ) {
    return this.tasksService.update(id, dto, userId);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete a task' })
  @ApiIdParam()
  @ApiNoContentResponse({ description: 'Task deleted' })
  @ApiNotFound('Task not found')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @UserId() userId: number) {
    return this.tasksService.remove(id, userId);
  }
}
