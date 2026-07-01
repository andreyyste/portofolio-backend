import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/portfolio.dto';

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(error: unknown, resourceName: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`${resourceName} not found`);
      }
    }
    throw error;
  }

  async getExperiences() {
    return this.prisma.experience.findMany({
      include: { skills: true },
      orderBy: { order: 'asc' },
    });
  }

  async createExperience(data: CreateExperienceDto) {
    const { skills, ...rest } = data;
    return this.prisma.experience.create({
      data: {
        ...rest,
        skills: skills
          ? { create: skills.map((s: string) => ({ name: s })) }
          : undefined,
      },
      include: { skills: true },
    });
  }

  async updateExperience(id: number, data: UpdateExperienceDto) {
    try {
      const { skills, ...rest } = data;
      return await this.prisma.$transaction(async (tx) => {
        if (skills) {
          await tx.experienceSkill.deleteMany({ where: { experienceId: id } });
        }
        return await tx.experience.update({
          where: { id },
          data: {
            ...rest,
            ...(skills
              ? { skills: { create: skills.map((s: string) => ({ name: s })) } }
              : {}),
          },
          include: { skills: true },
        });
      });
    } catch (error) {
      this.handlePrismaError(error, 'Experience');
    }
  }

  async deleteExperience(id: number) {
    try {
      return await this.prisma.experience.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Experience');
    }
  }
}
