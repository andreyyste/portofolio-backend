import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { GithubApiService } from './github-api.service';
import { GithubSecurityService } from './github-security.service';
import {
  GithubFileResponse,
  ProxiedRepoItem,
  ProxiedFileContent,
  ProxiedReadme,
} from './interfaces/github.interfaces';

@Injectable()
export class GithubFileProxyService {
  private readonly logger = new Logger(GithubFileProxyService.name);

  constructor(
    private readonly api: GithubApiService,
    private readonly security: GithubSecurityService,
  ) {}

  /**
   * Proxies folder/directory tree queries.
   */
  async getRepoTree(
    repoName: string,
    rawPath: string,
  ): Promise<ProxiedRepoItem[]> {
    const path = this.security.validatePath(rawPath);
    const endpoint = `/repos/${this.api.username}/${repoName}/contents/${path}`;

    const res = await this.api.fetchRaw(endpoint);
    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundException(
          `Path ${rawPath} not found in repository ${repoName}`,
        );
      }
      throw new Error(`GitHub API failed: ${res.statusText}`);
    }

    const items = (await res.json()) as unknown;
    if (!Array.isArray(items)) {
      throw new BadRequestException(
        `Requested path ${rawPath} is a file, not a directory tree.`,
      );
    }

    const typedItems = items as GithubFileResponse[];
    return typedItems.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type, // 'file' or 'dir'
      size: item.size,
    }));
  }

  /**
   * Proxies file content queries and adds metadata.
   */
  async getRepoFile(
    repoName: string,
    rawPath: string,
  ): Promise<ProxiedFileContent> {
    const path = this.security.validatePath(rawPath);
    const endpoint = `/repos/${this.api.username}/${repoName}/contents/${path}`;

    const res = await this.api.fetchRaw(endpoint);
    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundException(
          `File ${rawPath} not found in repository ${repoName}`,
        );
      }
      throw new Error(`GitHub API failed: ${res.statusText}`);
    }

    const fileData = (await res.json()) as GithubFileResponse;
    if (fileData.type !== 'file' || !fileData.content) {
      throw new BadRequestException(`Path ${rawPath} is not a file.`);
    }

    const decodedContent = Buffer.from(fileData.content, 'base64').toString(
      'utf8',
    );
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
   * Proxies README.md file queries.
   */
  async getRepoReadme(repoName: string): Promise<ProxiedReadme> {
    const endpoint = `/repos/${this.api.username}/${repoName}/readme`;
    const res = await this.api.fetchRaw(endpoint);

    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundException(
          `README.md not found in repository ${repoName}`,
        );
      }
      throw new Error(`GitHub API failed: ${res.statusText}`);
    }

    const fileData = (await res.json()) as GithubFileResponse;
    if (!fileData.content) {
      throw new Error('README.md content is empty or not readable.');
    }
    const decodedContent = Buffer.from(fileData.content, 'base64').toString(
      'utf8',
    );
    return {
      content: decodedContent,
    };
  }
}
