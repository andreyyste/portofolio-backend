import { Injectable, Logger } from '@nestjs/common';
import { IGithubApiService } from './interfaces/github.interfaces';

@Injectable()
export class GithubApiService implements IGithubApiService {
  private readonly logger = new Logger(GithubApiService.name);
  public readonly username: string;
  private readonly token: string | undefined;

  constructor() {
    this.username = process.env.GITHUB_USERNAME || 'andreyyste';
    this.token = process.env.GITHUB_TOKEN;
    if (!this.token) {
      this.logger.warn(
        'GITHUB_TOKEN environment variable is not defined. API rate limits will be highly restricted.',
      );
    }
  }

  /**
   * Performs a raw HTTP request to the GitHub API.
   * Exposes the raw Response object to allow inspecting status codes (e.g. 404).
   */
  async fetchRaw(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `https://api.github.com${endpoint}`;

    const headers = new Headers(options.headers || {});
    headers.set('User-Agent', 'portfolio-backend');
    headers.set('Accept', 'application/vnd.github.v3+json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Log rate limit warnings if we get close
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      if (rateLimitRemaining && parseInt(rateLimitRemaining, 10) < 10) {
        this.logger.warn(
          `GitHub API Rate Limit warning: only ${rateLimitRemaining} requests remaining.`,
        );
      }

      return response;
    } catch (error) {
      this.logger.error(
        `Network error requesting GitHub API endpoint ${endpoint}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Performs an HTTP request and parses the JSON response, throwing an error if the response is not OK.
   */
  async fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await this.fetchRaw(endpoint, options);
    if (!response.ok) {
      throw new Error(
        `GitHub API request failed for ${endpoint}: ${response.statusText} (${response.status})`,
      );
    }
    return response.json() as Promise<T>;
  }
}
