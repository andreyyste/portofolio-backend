import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class GithubService implements OnModuleInit {
  private readonly logger = new Logger(GithubService.name);
  private readonly username: string;
  private readonly token: string | undefined;

  constructor(private readonly prisma: PrismaService) {
    this.username = process.env.GITHUB_USERNAME || 'andreyyste';
    this.token = process.env.GITHUB_TOKEN;
  }

  async onModuleInit() {
    this.logger.log('Initializing GitHub sync on application startup...');
    this.syncPortfolioRepos().catch((err) => {
      this.logger.error('Failed to run initial GitHub sync:', err);
    });
  }

  /**
   * Helper to make requests to the GitHub API with authentication headers and User-Agent
   */
  private async fetchGitHubApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('User-Agent', 'portfolio-backend');
    headers.set('Accept', 'application/vnd.github.v3+json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }

  /**
   * Cron job runs every 24 hours at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronSync() {
    this.logger.log('Triggering automated 24-hour GitHub sync cron...');
    await this.syncPortfolioRepos();
  }

  /**
   * Main synchronization logic
   */
  async syncPortfolioRepos(): Promise<{ success: boolean; synced: string[]; hidden: string[] }> {
    this.logger.log(`Starting GitHub sync for user: ${this.username}`);
    const syncedRepos: string[] = [];
    const hiddenRepos: string[] = [];

    try {
      // 1. Fetch public repos
      const reposRes = await this.fetchGitHubApi(`/users/${this.username}/repos?per_page=100`);
      if (!reposRes.ok) {
        throw new Error(`Failed to fetch repositories: ${reposRes.statusText}`);
      }

      const repos = (await reposRes.json()) as any[];
      const publicReposList = repos.filter((r) => !r.private);
      const githubReposSet = new Set<string>(publicReposList.map((r) => r.name));

      // 2. Iterate through public repos to find .portfolio.json
      for (const repo of publicReposList) {
        const repoName = repo.name;
        
        // Fetch .portfolio.json
        const fileRes = await this.fetchGitHubApi(`/repos/${this.username}/${repoName}/contents/.portfolio.json`);
        
        if (fileRes.status === 404) {
          // No .portfolio.json, hide if it was previously in DB
          await this.hideProjectIfExist(repoName);
          hiddenRepos.push(repoName);
          continue;
        }

        if (!fileRes.ok) {
          this.logger.warn(`Failed to fetch .portfolio.json for ${repoName}: ${fileRes.statusText}`);
          continue;
        }

        const fileData = (await fileRes.json()) as any;
        if (fileData.type !== 'file' || !fileData.content) {
          await this.hideProjectIfExist(repoName);
          hiddenRepos.push(repoName);
          continue;
        }

        // Decode base64 contents
        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
        let portfolioConfig: any;
        try {
          portfolioConfig = JSON.parse(decodedContent);
        } catch (e) {
          this.logger.error(`Failed to parse JSON .portfolio.json for ${repoName}`);
          continue;
        }

        if (portfolioConfig.include === true) {
          // Resolve coverImage URL
          let resolvedCover = portfolioConfig.coverImage || null;
          if (resolvedCover && !resolvedCover.startsWith('http')) {
            resolvedCover = `https://raw.githubusercontent.com/${this.username}/${repoName}/main/${resolvedCover}`;
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
          this.logger.log(`Cleaned up (hid) deleted repo: ${dbProj.githubRepo}`);
          hiddenRepos.push(dbProj.githubRepo);
        }
      }

      this.logger.log(`GitHub Sync completed successfully! Synced: ${syncedRepos.length}, Hidden: ${hiddenRepos.length}`);
      return { success: true, synced: syncedRepos, hidden: hiddenRepos };
    } catch (error) {
      this.logger.error('Error during GitHub sync:', error);
      throw error;
    }
  }

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
   * Retrieves all non-hidden Github projects
   */
  async getRepos() {
    return this.prisma.project.findMany({
      where: { source: 'GITHUB', hidden: false },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  /**
   * Proxies folder/directory tree queries
   */
  async getRepoTree(repoName: string, path: string) {
    const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
    const endpoint = `/repos/${this.username}/${repoName}/contents/${sanitizedPath}`;
    
    const res = await this.fetchGitHubApi(endpoint);
    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundException(`Path ${path} not found in repository ${repoName}`);
      }
      throw new Error(`GitHub API failed: ${res.statusText}`);
    }

    const items = (await res.json()) as any;
    if (!Array.isArray(items)) {
      // It's a file, not a directory
      throw new Error(`Requested path ${path} is a file, not a directory tree.`);
    }

    return items.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type, // 'file' or 'dir'
      size: item.size,
    }));
  }

  /**
   * Proxies file content queries and adds metadata
   */
  async getRepoFile(repoName: string, path: string) {
    const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
    const endpoint = `/repos/${this.username}/${repoName}/contents/${sanitizedPath}`;
    
    const res = await this.fetchGitHubApi(endpoint);
    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundException(`File ${path} not found in repository ${repoName}`);
      }
      throw new Error(`GitHub API failed: ${res.statusText}`);
    }

    const fileData = (await res.json()) as any;
    if (fileData.type !== 'file' || !fileData.content) {
      throw new Error(`Path ${path} is not a file.`);
    }

    const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    const lines = decodedContent.split('\n').length;
    const size = fileData.size;

    // Detect language from extension
    const ext = path.split('.').pop()?.toLowerCase() || '';
    let language = 'text';
    if (ext === 'ts' || ext === 'tsx') language = 'typescript';
    else if (ext === 'js' || ext === 'jsx') language = 'javascript';
    else if (ext === 'json') language = 'json';
    else if (ext === 'md') language = 'markdown';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'py') language = 'python';
    else if (ext === 'go') language = 'go';
    else if (ext === 'rs') language = 'rust';
    else if (ext === 'sh') language = 'bash';
    else if (ext === 'yml' || ext === 'yaml') language = 'yaml';

    return {
      content: decodedContent,
      size,
      language,
      lines,
    };
  }

  /**
   * Proxies README.md file queries
   */
  async getRepoReadme(repoName: string) {
    const endpoint = `/repos/${this.username}/${repoName}/readme`;
    const res = await this.fetchGitHubApi(endpoint);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundException(`README.md not found in repository ${repoName}`);
      }
      throw new Error(`GitHub API failed: ${res.statusText}`);
    }

    const fileData = (await res.json()) as any;
    const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    return {
      content: decodedContent,
    };
  }
}
