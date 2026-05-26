import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches a configuration by key and parses its JSON string value.
   * Throws a NotFoundException if the key does not exist.
   * Why: Configs are stored as JSON strings to allow flexible schemaless data for various site settings.
   */
  async getConfig(key: string) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });
    
    if (!config) {
      throw new NotFoundException(`Config key ${key} not found`);
    }

    return JSON.parse(config.value);
  }

  /**
   * Upserts (creates or updates) a configuration key with the provided JSON object.
   * We stringify the payload before storing it in the database.
   */
  async updateConfig(key: string, value: Record<string, any>) {
    const config = await this.prisma.siteConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
    return JSON.parse(config.value);
  }
}
