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
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateExperienceDto,
  UpdateExperienceDto,
  CreateSkillDto,
  UpdateSkillDto,
} from './dto/portfolio.dto';

/**
 * Controller for managing portfolio content (projects, experiences, skills).
 * Public endpoints allow fetching data, while protected endpoints allow modification.
 */
@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager.Cache,
  ) {}

  // ---- PROJECTS ----

  /**
   * Retrieves all projects along with their associated tags.
   */
  @Get('projects')
  async getProjects() {
    const cacheKey = 'portfolio:projects';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.portfolioService.getProjects();
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  /**
   * Creates a new project. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post('projects')
  async createProject(@Body() data: CreateProjectDto) {
    const result = await this.portfolioService.createProject(data);
    await this.cacheManager.del('portfolio:projects');
    return result;
  }

  /**
   * Updates an existing project by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('projects/:id')
  async updateProject(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    const result = await this.portfolioService.updateProject(+id, data);
    await this.cacheManager.del('portfolio:projects');
    return result;
  }

  /**
   * Deletes a project by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    const result = await this.portfolioService.deleteProject(+id);
    await this.cacheManager.del('portfolio:projects');
    return result;
  }

  // ---- EXPERIENCES ----

  /**
   * Retrieves all work/educational experiences and their associated skills.
   */
  @Get('experiences')
  async getExperiences() {
    const cacheKey = 'portfolio:experiences';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.portfolioService.getExperiences();
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  /**
   * Creates a new experience entry. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post('experiences')
  async createExperience(@Body() data: CreateExperienceDto) {
    const result = await this.portfolioService.createExperience(data);
    await this.cacheManager.del('portfolio:experiences');
    return result;
  }

  /**
   * Updates an existing experience by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('experiences/:id')
  async updateExperience(@Param('id') id: string, @Body() data: UpdateExperienceDto) {
    const result = await this.portfolioService.updateExperience(+id, data);
    await this.cacheManager.del('portfolio:experiences');
    return result;
  }

  /**
   * Deletes an experience by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('experiences/:id')
  async deleteExperience(@Param('id') id: string) {
    const result = await this.portfolioService.deleteExperience(+id);
    await this.cacheManager.del('portfolio:experiences');
    return result;
  }

  // ---- SKILLS ----

  /**
   * Retrieves all skills.
   */
  @Get('skills')
  async getSkills() {
    const cacheKey = 'portfolio:skills';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.portfolioService.getSkills();
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  /**
   * Creates a new skill entry. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post('skills')
  async createSkill(@Body() data: CreateSkillDto) {
    const result = await this.portfolioService.createSkill(data);
    await this.cacheManager.del('portfolio:skills');
    return result;
  }

  /**
   * Updates an existing skill by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('skills/:id')
  async updateSkill(@Param('id') id: string, @Body() data: UpdateSkillDto) {
    const result = await this.portfolioService.updateSkill(+id, data);
    await this.cacheManager.del('portfolio:skills');
    return result;
  }

  /**
   * Deletes a skill by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('skills/:id')
  async deleteSkill(@Param('id') id: string) {
    const result = await this.portfolioService.deleteSkill(+id);
    await this.cacheManager.del('portfolio:skills');
    return result;
  }
}
