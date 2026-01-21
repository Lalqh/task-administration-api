import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix login bug', description: 'Short, descriptive task title', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @ApiPropertyOptional({ example: 'Investigate and resolve the login issue' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiProperty({
    example: '2026-01-31T00:00:00.000Z',
    description: 'ISO-8601 date string',
  })
  @IsISO8601()
  dueDate: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' || value === '1' : Boolean(value)))
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' || value === '1' : Boolean(value)))
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'Needs review by PO' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  comments?: string;

  @ApiPropertyOptional({ example: 42, description: 'Responsible user id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  responsibleId?: number;

  @ApiPropertyOptional({ type: [String], example: ['backend', 'priority'], description: 'Tag names to upsert' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v.trim() : v)) : value,
  )
  tagNames?: string[];
}