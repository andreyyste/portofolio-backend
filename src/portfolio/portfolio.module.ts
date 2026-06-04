import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProjectsController,
    ExperiencesController,
    SkillsController,
  ],
  providers: [
    ProjectsService,
    ExperiencesService,
    SkillsService,
  ],
})
export class PortfolioModule {}
