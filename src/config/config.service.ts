import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(key: string) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });
    
    if (!config) {
      throw new NotFoundException(`Config key ${key} not found`);
    }

    return JSON.parse(config.value);
  }

  async updateConfig(key: string, value: any) {
    const config = await this.prisma.siteConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
    return JSON.parse(config.value);
  }
}
