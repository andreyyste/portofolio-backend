import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProjectDto, UpdateProjectDto } from './dto/portfolio.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(error: unknown, resourceName: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`${resourceName} not found`);
      }
    }
    throw error;
  }

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
}
