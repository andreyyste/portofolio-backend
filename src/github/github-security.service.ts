import { Injectable, Logger, BadRequestException } from '@nestjs/common';

@Injectable()
export class GithubSecurityService {
  private readonly logger = new Logger(GithubSecurityService.name);

  /**
   * Security Helper: Validates that the requested path is safe and does not contain path traversal elements.
   * Throws BadRequestException if path traversal is detected.
   */
  validatePath(path: string): string {
    const normalized = path.replace(/\\/g, '/');
    const segments = normalized.split('/');

    for (const segment of segments) {
      if (segment === '..') {
        this.logger.warn(
          `Potential path traversal attack detected! Path: "${path}"`,
        );
        throw new BadRequestException('Path traversal is not allowed.');
      }
    }

    return normalized.startsWith('/') ? normalized.slice(1) : normalized;
  }
}
