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
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { CreateSkillDto, UpdateSkillDto } from './dto/portfolio.dto';

@Controller('portfolio/skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager.Cache,
  ) {}

  @Get()
  async getSkills() {
    const cacheKey = 'portfolio:skills';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.skillsService.getSkills();
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSkill(@Body() data: CreateSkillDto) {
    const result = await this.skillsService.createSkill(data);
    await this.cacheManager.del('portfolio:skills');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateSkill(@Param('id') id: string, @Body() data: UpdateSkillDto) {
    const result = await this.skillsService.updateSkill(+id, data);
    await this.cacheManager.del('portfolio:skills');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSkill(@Param('id') id: string) {
    const result = await this.skillsService.deleteSkill(+id);
    await this.cacheManager.del('portfolio:skills');
    return result;
  }
}
