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
  /**
   * Retrieves all projects that are not marked as hidden.
   * Results are ordered by:
   * 1. Featured status (featured first)
   * 2. Custom ordering index (ascending)
   * 3. Last updated timestamp (descending)
   * 
   * @returns Array of public projects
   */
  async getProjects() {
    return this.prisma.project.findMany({
      where: { hidden: false },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  /**
   * Creates a new project in the portfolio database.
   * 
   * @param data - The project transfer object containing details
   * @returns The created project object
   */
  async createProject(data: CreateProjectDto) {
    return this.prisma.project.create({
      data,
    });
  }

  /**
   * Updates an existing project metadata by its unique ID.
   * Catches database errors and throws structured NestJS NotFoundException if record not found.
   * 
   * @param id - The numeric ID of the project
   * @param data - DTO with properties to update
   * @returns The updated project object
   */
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

  /**
   * Permanently deletes a project from the database.
   * Catches database errors and throws structured NestJS NotFoundException if record not found.
   * 
   * @param id - The numeric ID of the project to delete
   * @returns The deleted project representation
   */
  async deleteProject(id: number) {
    try {
      return await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Project');
    }
  }

  // ---- EXPERIENCES ----
  /**
   * Retrieves all professional experience records.
   * Eagerly loads all related skills linked to each experience.
   * 
   * @returns Experience records with nested skills array
   */
  async getExperiences() {
    return this.prisma.experience.findMany({ include: { skills: true } });
  }

  /**
   * Creates a new professional experience record.
   * Automatically creates and maps associated skills via relation tables if provided.
   * 
   * @param data - The experience details with optional skills list
   * @returns The created experience object with mapped skills
   */
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
   * Catches database errors and throws structured NestJS NotFoundException if record not found.
   * 
   * @param id - The numeric ID of the experience to update
   * @param data - DTO with updated experience fields
   * @returns The updated experience with its skills
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

  /**
   * Deletes an experience record from the database.
   * Catches database errors and throws structured NestJS NotFoundException if record not found.
   * 
   * @param id - The numeric ID of the experience to delete
   * @returns The deleted experience record
   */
  async deleteExperience(id: number) {
    try {
      return await this.prisma.experience.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Experience');
    }
  }

  // ---- SKILLS ----
  /**
   * Retrieves all skills from the database.
   * 
   * @returns Array of skills
   */
  async getSkills() {
    return this.prisma.skill.findMany();
  }

  /**
   * Creates a new skill item.
   * Ensures default empty string value for `mt` if not present in the payload.
   * 
   * @param data - DTO with skill details
   * @returns The created skill
   */
  async createSkill(data: CreateSkillDto) {
    return this.prisma.skill.create({
      data: {
        ...data,
        mt: data.mt ?? '', // Provide default as it's required in schema but optional in DTO
      },
    });
  }

  /**
   * Updates an existing skill by ID.
   * Catches database errors and throws structured NestJS NotFoundException if record not found.
   * 
   * @param id - The numeric ID of the skill
   * @param data - The update payload
   * @returns The updated skill
   */
  async updateSkill(id: number, data: UpdateSkillDto) {
    try {
      return await this.prisma.skill.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error, 'Skill');
    }
  }

  /**
   * Deletes a skill by ID.
   * Catches database errors and throws structured NestJS NotFoundException if record not found.
   * 
   * @param id - The numeric ID of the skill to delete
   * @returns The deleted skill representation
   */
  async deleteSkill(id: number) {
    try {
      return await this.prisma.skill.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Skill');
    }
  }
}

