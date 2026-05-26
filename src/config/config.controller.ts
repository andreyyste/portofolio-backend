import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get(':key')
  getConfig(@Param('key') key: string) {
    return this.configService.getConfig(key);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':key')
  updateConfig(@Param('key') key: string, @Body() body: any) {
    return this.configService.updateConfig(key, body);
  }
}
