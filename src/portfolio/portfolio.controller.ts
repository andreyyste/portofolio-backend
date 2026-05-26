import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  constructor(private readonly portfolioService: PortfolioService) {}

  // ---- PROJECTS ----

  /**
   * Retrieves all projects along with their associated tags.
   */
  @Get('projects')
  getProjects() {
    return this.portfolioService.getProjects();
  }

  /**
   * Creates a new project. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post('projects')
  createProject(@Body() data: CreateProjectDto) {
    return this.portfolioService.createProject(data);
  }

  /**
   * Updates an existing project by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.portfolioService.updateProject(+id, data);
  }

  /**
   * Deletes a project by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.portfolioService.deleteProject(+id);
  }

  // ---- EXPERIENCES ----

  /**
   * Retrieves all work/educational experiences and their associated skills.
   */
  @Get('experiences')
  getExperiences() {
    return this.portfolioService.getExperiences();
  }

  /**
   * Creates a new experience entry. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post('experiences')
  createExperience(@Body() data: CreateExperienceDto) {
    return this.portfolioService.createExperience(data);
  }

  /**
   * Updates an existing experience by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('experiences/:id')
  updateExperience(@Param('id') id: string, @Body() data: UpdateExperienceDto) {
    return this.portfolioService.updateExperience(+id, data);
  }

  /**
   * Deletes an experience by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('experiences/:id')
  deleteExperience(@Param('id') id: string) {
    return this.portfolioService.deleteExperience(+id);
  }

  // ---- SKILLS ----

  /**
   * Retrieves all skills.
   */
  @Get('skills')
  getSkills() {
    return this.portfolioService.getSkills();
  }

  /**
   * Creates a new skill entry. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post('skills')
  createSkill(@Body() data: CreateSkillDto) {
    return this.portfolioService.createSkill(data);
  }

  /**
   * Updates an existing skill by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('skills/:id')
  updateSkill(@Param('id') id: string, @Body() data: UpdateSkillDto) {
    return this.portfolioService.updateSkill(+id, data);
  }

  /**
   * Deletes a skill by ID. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string) {
    return this.portfolioService.deleteSkill(+id);
  }
}
