import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { CreateProjectDto, UpdateProjectDto } from './dto/portfolio.dto';

@Controller('portfolio/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager.Cache,
  ) {}

  @Get()
  async getProjects() {
    const cacheKey = 'portfolio:projects';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.projectsService.getProjects();
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProject(@Body() data: CreateProjectDto) {
    const result = await this.projectsService.createProject(data);
    await this.cacheManager.del('portfolio:projects');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateProject(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    const result = await this.projectsService.updateProject(+id, data);
    await this.cacheManager.del('portfolio:projects');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    const result = await this.projectsService.deleteProject(+id);
    await this.cacheManager.del('portfolio:projects');
    return result;
  }
}
