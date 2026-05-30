import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Query, 
  UseGuards, 
  Inject,
  Logger
} from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

@Controller('github')
export class GithubController {
  private readonly logger = new Logger(GithubController.name);

  constructor(
    private readonly githubService: GithubService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager.Cache
  ) {}

  /**
   * Manually triggers GitHub repository synchronization.
   * Admin only - protected by JWT Guard.
   */
  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncRepos() {
    this.logger.log('Admin triggered manual GitHub synchronization');
    return this.githubService.syncPortfolioRepos();
  }

  /**
   * Returns a list of repositories that contain .portfolio.json with include: true
   * (Fetched directly from DB to save GitHub API quota).
   */
  @Get('repos')
  async getRepos() {
    return this.githubService.getRepos();
  }

  /**
   * Proxies file tree requests. Cached for 1 hour.
   */
  @Get('repos/:repoName/tree')
  async getTree(
    @Param('repoName') repoName: string,
    @Query('path') path: string = ''
  ) {
    const cacheKey = `github:tree:${repoName}:${path}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for repository tree: ${cacheKey}`);
      return cached;
    }

    const data = await this.githubService.getRepoTree(repoName, path);
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  /**
   * Proxies file content requests. Decodes contents and returns lines/size metadata.
   * Cached for 1 hour.
   */
  @Get('repos/:repoName/file')
  async getFile(
    @Param('repoName') repoName: string,
    @Query('path') path: string
  ) {
    const cacheKey = `github:file:${repoName}:${path}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for repository file: ${cacheKey}`);
      return cached;
    }

    const data = await this.githubService.getRepoFile(repoName, path);
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }

  /**
   * Proxies README.md request. Cached for 1 hour.
   */
  @Get('repos/:repoName/readme')
  async getReadme(@Param('repoName') repoName: string) {
    const cacheKey = `github:readme:${repoName}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for repository readme: ${cacheKey}`);
      return cached;
    }

    const data = await this.githubService.getRepoReadme(repoName);
    await this.cacheManager.set(cacheKey, data, 3600000); // 1 hour
    return data;
  }
}
