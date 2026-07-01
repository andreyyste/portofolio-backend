import {
  IsString,
  IsArray,
  IsOptional,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ProjectSource } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  brief!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  hasSourceCode?: boolean;

  @IsString()
  @IsOptional()
  liveUrl?: string;

  @IsEnum(ProjectSource)
  @IsOptional()
  source?: ProjectSource;

  @IsString()
  @IsOptional()
  githubRepo?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  brief?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  hasSourceCode?: boolean;

  @IsString()
  @IsOptional()
  liveUrl?: string;

  @IsEnum(ProjectSource)
  @IsOptional()
  source?: ProjectSource;

  @IsString()
  @IsOptional()
  githubRepo?: string;
}

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  period!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsInt()
  @IsOptional()
  order?: number;
}

export class UpdateExperienceDto {
  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  period?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  color!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class UpdateSkillDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  text?: string;
}
