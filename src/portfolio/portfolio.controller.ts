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

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // ---- PROJECTS ----
  @Get('projects')
  getProjects() {
    return this.portfolioService.getProjects();
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects')
  createProject(@Body() data: CreateProjectDto) {
    return this.portfolioService.createProject(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.portfolioService.updateProject(+id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.portfolioService.deleteProject(+id);
  }

  // ---- EXPERIENCES ----
  @Get('experiences')
  getExperiences() {
    return this.portfolioService.getExperiences();
  }

  @UseGuards(JwtAuthGuard)
  @Post('experiences')
  createExperience(@Body() data: CreateExperienceDto) {
    return this.portfolioService.createExperience(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('experiences/:id')
  updateExperience(@Param('id') id: string, @Body() data: UpdateExperienceDto) {
    return this.portfolioService.updateExperience(+id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('experiences/:id')
  deleteExperience(@Param('id') id: string) {
    return this.portfolioService.deleteExperience(+id);
  }

  // ---- SKILLS ----
  @Get('skills')
  getSkills() {
    return this.portfolioService.getSkills();
  }

  @UseGuards(JwtAuthGuard)
  @Post('skills')
  createSkill(@Body() data: CreateSkillDto) {
    return this.portfolioService.createSkill(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('skills/:id')
  updateSkill(@Param('id') id: string, @Body() data: UpdateSkillDto) {
    return this.portfolioService.updateSkill(+id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string) {
    return this.portfolioService.deleteSkill(+id);
  }
}
