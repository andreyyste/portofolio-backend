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
import { ExperiencesService } from './experiences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/portfolio.dto';

@Controller('portfolio/experiences')
export class ExperiencesController {
  constructor(
    private readonly experiencesService: ExperiencesService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager.Cache,
  ) {}

  @Get()
  async getExperiences() {
    const cacheKey = 'portfolio:experiences';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.experiencesService.getExperiences();
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createExperience(@Body() data: CreateExperienceDto) {
    const result = await this.experiencesService.createExperience(data);
    await this.cacheManager.del('portfolio:experiences');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateExperience(
    @Param('id') id: string,
    @Body() data: UpdateExperienceDto,
  ) {
    const result = await this.experiencesService.updateExperience(+id, data);
    await this.cacheManager.del('portfolio:experiences');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteExperience(@Param('id') id: string) {
    const result = await this.experiencesService.deleteExperience(+id);
    await this.cacheManager.del('portfolio:experiences');
    return result;
  }
}
