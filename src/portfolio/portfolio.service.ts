import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateExperienceDto,
  UpdateExperienceDto,
  CreateSkillDto,
  UpdateSkillDto,
} from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper method to handle common Prisma errors (like record not found).
   * @param error - The error thrown by Prisma
   * @param resourceName - Name of the resource being operated on
   */
  private handlePrismaError(error: unknown, resourceName: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: "An operation failed because it depends on one or more records that were required but not found."
      if (error.code === 'P2025') {
        throw new NotFoundException(`${resourceName} not found`);
      }
    }
    throw error;
  }

  // ---- PROJECTS ----
  async getProjects() {
    return this.prisma.project.findMany({
      where: { hidden: false },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async createProject(data: CreateProjectDto) {
    return this.prisma.project.create({
      data,
    });
  }

  async updateProject(id: number, data: UpdateProjectDto) {
    try {
      return await this.prisma.project.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error, 'Project');
    }
  }

  async deleteProject(id: number) {
    try {
      return await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Project');
    }
  }

  // ---- EXPERIENCES ----
  async getExperiences() {
    return this.prisma.experience.findMany({ include: { skills: true } });
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

  /**
   * Updates an experience.
   * If `skills` are provided, we use a destructive approach (delete all existing skills and recreate them).
   * Why: This avoids complex array diffing logic for a simple many-to-many relation, ensuring the DB matches the request payload exactly.
   */
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

  // ---- SKILLS ----
  async getSkills() {
    return this.prisma.skill.findMany();
  }

  async createSkill(data: CreateSkillDto) {
    return this.prisma.skill.create({
      data: {
        ...data,
        mt: data.mt ?? '', // Provide default as it's required in schema but optional in DTO
      },
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
