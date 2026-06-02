import { Injectable } from '@nestjs/common';
import { GithubFileProxyService } from './github-file-proxy.service';
import { GithubMetadataProxyService } from './github-metadata-proxy.service';
import {
  ProxiedRepoItem,
  ProxiedFileContent,
  ProxiedReadme,
  ProxiedRepoMetadata,
} from './interfaces/github.interfaces';

@Injectable()
export class GithubProxyService {
  constructor(
    private readonly fileProxyService: GithubFileProxyService,
    private readonly metadataProxyService: GithubMetadataProxyService,
  ) {}

  /**
   * Facade method delegating to GithubFileProxyService to fetch folder/directory tree structure.
   */
  async getRepoTree(
    repoName: string,
    rawPath: string,
  ): Promise<ProxiedRepoItem[]> {
    return this.fileProxyService.getRepoTree(repoName, rawPath);
  }

  /**
   * Facade method delegating to GithubFileProxyService to fetch file content and calculate metadata.
   */
  async getRepoFile(
    repoName: string,
    rawPath: string,
  ): Promise<ProxiedFileContent> {
    return this.fileProxyService.getRepoFile(repoName, rawPath);
  }

  /**
   * Facade method delegating to GithubFileProxyService to retrieve the repository README.md.
   */
  async getRepoReadme(repoName: string): Promise<ProxiedReadme> {
    return this.fileProxyService.getRepoReadme(repoName);
  }

  /**
   * Facade method delegating to GithubMetadataProxyService to compile comprehensive statistics.
   */
  async getRepoMetadata(repoName: string): Promise<ProxiedRepoMetadata> {
    return this.metadataProxyService.getRepoMetadata(repoName);
  }
}
