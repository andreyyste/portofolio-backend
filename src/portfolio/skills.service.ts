import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSkillDto, UpdateSkillDto } from './dto/portfolio.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(error: unknown, resourceName: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`${resourceName} not found`);
      }
    }
    throw error;
  }

  async getSkills() {
    return this.prisma.skill.findMany();
  }

  async createSkill(data: CreateSkillDto) {
    return this.prisma.skill.create({
      data,
    });
  }

  async updateSkill(id: number, data: UpdateSkillDto) {
    try {
      return await this.prisma.skill.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error, 'Skill');
    }
  }

  async deleteSkill(id: number) {
    try {
      return await this.prisma.skill.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Skill');
    }
  }
}
