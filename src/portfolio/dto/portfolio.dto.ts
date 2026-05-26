import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  link!: string;

  @IsString()
  @IsNotEmpty()
  imageSrc!: string;

  @IsString()
  @IsNotEmpty()
  imageAlt!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
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

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  imageSrc?: string;

  @IsString()
  @IsOptional()
  imageAlt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
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

  @IsString()
  @IsNotEmpty()
  delay!: string;

  @IsString()
  @IsNotEmpty()
  dur!: string;

  @IsString()
  @IsNotEmpty()
  rotate!: string;

  @IsString()
  @IsOptional()
  mt?: string;
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

  @IsString()
  @IsOptional()
  delay?: string;

  @IsString()
  @IsOptional()
  dur?: string;

  @IsString()
  @IsOptional()
  rotate?: string;

  @IsString()
  @IsOptional()
  mt?: string;
}
