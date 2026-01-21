import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value === 'true' || value === '1';
    return Boolean(value);
  })
  isCompleted?: boolean;

  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value === 'true' || value === '1';
    return Boolean(value);
  })
  isPublic: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  responsibleId?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .map((v) => (typeof v === 'string' ? v.trim() : v))
          .filter((v) => typeof v === 'string' && v.length > 0)
      : value
  )
  tagNames?: string[];
}