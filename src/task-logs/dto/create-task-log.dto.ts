import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateTaskLogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  action: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  entity: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  entityId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}