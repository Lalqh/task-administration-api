import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { TaskLogsModule } from './task-logs/task-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    TasksModule,
    UsersModule,
    TaskLogsModule,
  ],
})
export class AppModule {}
