import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  // ---- PROJECTS ----
  async getProjects() {
    return this.prisma.project.findMany({ include: { tags: true } });
  }
  async createProject(data: any) {
    const { tags, ...rest } = data;
    return this.prisma.project.create({
      data: {
        ...rest,
        tags: tags ? { create: tags.map((t: string) => ({ name: t })) } : undefined,
      },
      include: { tags: true },
    });
  }
  async updateProject(id: number, data: any) {
    const { tags, ...rest } = data;
    // We do a simple approach: if tags are provided, delete old ones and recreate
    if (tags) {
      await this.prisma.projectTag.deleteMany({ where: { projectId: id } });
    }
    return this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(tags ? { tags: { create: tags.map((t: string) => ({ name: t })) } } : {}),
      },
      include: { tags: true },
    });
  }
  async deleteProject(id: number) {
    return this.prisma.project.delete({ where: { id } });
  }

  // ---- EXPERIENCES ----
  async getExperiences() {
    return this.prisma.experience.findMany({ include: { skills: true } });
  }
  async createExperience(data: any) {
    const { skills, ...rest } = data;
    return this.prisma.experience.create({
      data: {
        ...rest,
        skills: skills ? { create: skills.map((s: string) => ({ name: s })) } : undefined,
      },
      include: { skills: true },
    });
  }
  async updateExperience(id: number, data: any) {
    const { skills, ...rest } = data;
    if (skills) {
      await this.prisma.experienceSkill.deleteMany({ where: { experienceId: id } });
    }
    return this.prisma.experience.update({
      where: { id },
      data: {
        ...rest,
        ...(skills ? { skills: { create: skills.map((s: string) => ({ name: s })) } } : {}),
      },
      include: { skills: true },
    });
  }
  async deleteExperience(id: number) {
    return this.prisma.experience.delete({ where: { id } });
  }

  // ---- SKILLS ----
  async getSkills() {
    return this.prisma.skill.findMany();
  }
  async createSkill(data: any) {
    return this.prisma.skill.create({ data });
  }
  async updateSkill(id: number, data: any) {
    return this.prisma.skill.update({ where: { id }, data });
  }
  async deleteSkill(id: number) {
    return this.prisma.skill.delete({ where: { id } });
  }
}
