import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

/**
 * Controller for managing global site configuration stored as key-value pairs.
 */
@Controller('config')
export class ConfigController {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager.Cache,
  ) {}

  /**
   * Retrieves a configuration object by its unique key.
   */
  @Get(':key')
  async getConfig(@Param('key') key: string) {
    const cacheKey = `config:${key}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.configService.getConfig(key);
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  /**
   * Updates or creates a configuration value for a given key.
   * Expects a JSON payload. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':key')
  @UsePipes(new ValidationPipe({ whitelist: false }))
  async updateConfig(
    @Param('key') key: string,
    @Body() body: Record<string, unknown>,
  ) {
    const result = await this.configService.updateConfig(key, body);
    await this.cacheManager.del(`config:${key}`);
    return result;
  }
}
