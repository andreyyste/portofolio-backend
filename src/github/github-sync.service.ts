import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GithubApiService } from './github-api.service';
import {
  GithubRepoInfo,
  GithubFileResponse,
  PortfolioConfig,
} from './interfaces/github.interfaces';

@Injectable()
export class GithubSyncService implements OnModuleInit {
  private readonly logger = new Logger(GithubSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly api: GithubApiService,
  ) {}

  /**
   * NestJS Lifecycle Hook.
   * Automatically executes an initial synchronization run on application startup in the background.
   */
  onModuleInit() {
    this.logger.log('Initializing GitHub sync on application startup...');
    this.syncPortfolioRepos().catch((err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to run initial GitHub sync: ${errorMsg}`);
    });
  }

  /**
   * Automated cron job executed every day at midnight (00:00).
   * Ensures the database remains synchronized with GitHub public metadata modifications.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronSync() {
    this.logger.log('Triggering automated 24-hour GitHub sync cron...');
    await this.syncPortfolioRepos();
  }

  /**
   * Main synchronization logic that maps public GitHub repositories to the portfolio database.
   * 
   * Process Flow:
   * 1. Fetches all public repositories for the configured GitHub username.
   * 2. Iterates over each repository to query for a `.portfolio.json` configuration file.
   * 3. If `.portfolio.json` exists and contains `include: true`:
   *    - Converts relative cover image paths to raw github user content links.
   *    - Upserts (creates or updates) the repository details in the Project database model.
   * 4. If the configuration does not include the project, soft-deletes (hides) it in the database.
   * 5. Performs cleanup for any projects in the database that are no longer present on GitHub.
   * 
   * @returns Synchronization report containing lists of synced and hidden repository names.
   */
  async syncPortfolioRepos(): Promise<{
    success: boolean;
    synced: string[];
    hidden: string[];
  }> {
    this.logger.log(`Starting GitHub sync for user: ${this.api.username}`);
    const syncedRepos: string[] = [];
    const hiddenRepos: string[] = [];

    try {
      // 1. Fetch public repos
      const reposRes = await this.api.fetchRaw(
        `/users/${this.api.username}/repos?per_page=100`,
      );
      if (!reposRes.ok) {
        throw new Error(`Failed to fetch repositories: ${reposRes.statusText}`);
      }

      const repos = (await reposRes.json()) as GithubRepoInfo[];
      const publicReposList = repos.filter((r) => !r.private);
      const githubReposSet = new Set<string>(
        publicReposList.map((r) => r.name),
      );

      // 2. Iterate through public repos to find .portfolio.json
      for (const repo of publicReposList) {
        const repoName = repo.name;

        // Fetch .portfolio.json
        const fileRes = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/contents/.portfolio.json`,
        );

        if (fileRes.status === 404) {
          // No .portfolio.json, hide if it was previously in DB
          await this.hideProjectIfExist(repoName);
          hiddenRepos.push(repoName);
          continue;
        }

        if (!fileRes.ok) {
          this.logger.warn(
            `Failed to fetch .portfolio.json for ${repoName}: ${fileRes.statusText}`,
          );
          continue;
        }

        const fileData = (await fileRes.json()) as GithubFileResponse;
        if (fileData.type !== 'file' || !fileData.content) {
          await this.hideProjectIfExist(repoName);
          hiddenRepos.push(repoName);
          continue;
        }

        // Decode base64 contents
        const decodedContent = Buffer.from(fileData.content, 'base64').toString(
          'utf8',
        );
        let portfolioConfig: PortfolioConfig;
        try {
          portfolioConfig = JSON.parse(decodedContent) as PortfolioConfig;
        } catch (e: unknown) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          this.logger.error(
            `Failed to parse JSON .portfolio.json for ${repoName}: ${errorMsg}`,
          );
          continue;
        }

        if (portfolioConfig.include === true) {
          // Resolve coverImage URL
          let resolvedCover = portfolioConfig.coverImage || null;
          if (resolvedCover && !resolvedCover.startsWith('http')) {
            resolvedCover = `https://raw.githubusercontent.com/${this.api.username}/${repoName}/main/${resolvedCover}`;
          }

          // Upsert to DB
          const existing = await this.prisma.project.findFirst({
            where: { githubRepo: repoName, source: 'GITHUB' },
          });

          const projectData = {
            title: portfolioConfig.title || repoName,
            brief: portfolioConfig.brief || '',
            description: portfolioConfig.description || '',
            tags: portfolioConfig.tags || [],
            coverImage: resolvedCover,
            order: portfolioConfig.order || 0,
            featured: portfolioConfig.featured || false,
            hasSourceCode: portfolioConfig.hasSourceCode || false,
            liveUrl: portfolioConfig.liveUrl || null,
            hidden: false,
          };

          if (existing) {
            await this.prisma.project.update({
              where: { id: existing.id },
              data: projectData,
            });
            this.logger.log(`Updated synced repo project: ${repoName}`);
          } else {
            await this.prisma.project.create({
              data: {
                ...projectData,
                source: 'GITHUB',
                githubRepo: repoName,
              },
            });
            this.logger.log(`Created synced repo project: ${repoName}`);
          }
          syncedRepos.push(repoName);
        } else {
          // include is false or not true, hide it
          await this.hideProjectIfExist(repoName);
          hiddenRepos.push(repoName);
        }
      }

      // 3. Cleanup: If a project exists as GITHUB in the DB but is no longer on GitHub, set hidden: true
      const allDbGithubProjects = await this.prisma.project.findMany({
        where: { source: 'GITHUB' },
      });

      for (const dbProj of allDbGithubProjects) {
        if (dbProj.githubRepo && !githubReposSet.has(dbProj.githubRepo)) {
          await this.prisma.project.update({
            where: { id: dbProj.id },
            data: { hidden: true },
          });
          this.logger.log(
            `Cleaned up (hid) deleted repo: ${dbProj.githubRepo}`,
          );
          hiddenRepos.push(dbProj.githubRepo);
        }
      }

      this.logger.log(
        `GitHub Sync completed successfully! Synced: ${syncedRepos.length}, Hidden: ${hiddenRepos.length}`,
      );
      return { success: true, synced: syncedRepos, hidden: hiddenRepos };
    } catch (error) {
      this.logger.error('Error during GitHub sync:', error);
      throw error;
    }
  }

  /**
   * Helper utility to hide a project in the database if it exists.
   * Performs soft deletion by updating the hidden flag to true.
   * 
   * @param repoName - Name of the repository to hide
   */
  private async hideProjectIfExist(repoName: string) {
    const existing = await this.prisma.project.findFirst({
      where: { githubRepo: repoName, source: 'GITHUB' },
    });
    if (existing && !existing.hidden) {
      await this.prisma.project.update({
        where: { id: existing.id },
        data: { hidden: true },
      });
      this.logger.log(`Soft deleted (hid) project for repo: ${repoName}`);
    }
  }

  /**
   * Retrieves all non-hidden Github synced projects.
   * Used by public portfolio endpoints to fetch projects sourced from GitHub.
   * 
   * @returns Array of public GitHub projects ordered by featured, order, and updated timestamp.
   */
  async getRepos() {
    return this.prisma.project.findMany({
      where: { source: 'GITHUB', hidden: false },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { updatedAt: 'desc' }],
    });
  }
}
