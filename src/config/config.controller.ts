import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller for managing global site configuration stored as key-value pairs.
 */
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Retrieves a configuration object by its unique key.
   */
  @Get(':key')
  getConfig(@Param('key') key: string) {
    return this.configService.getConfig(key);
  }

  /**
   * Updates or creates a configuration value for a given key.
   * Expects a JSON payload. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':key')
  @UsePipes(new ValidationPipe({ whitelist: false }))
  updateConfig(
    @Param('key') key: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.configService.updateConfig(key, body);
  }
}
