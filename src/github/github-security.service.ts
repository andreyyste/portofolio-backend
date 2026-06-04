import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class GithubSecurityService {
  private readonly logger = new Logger(GithubSecurityService.name);

  /**
   * Security Helper: Validates that the requested path is safe and does not contain path traversal elements.
   * Throws BadRequestException if path traversal is detected.
   */
  validatePath(rawPath: string): string {
    if (!rawPath || rawPath.trim() === '' || rawPath === '/') {
      return '';
    }

    let decoded = rawPath;
    let previous = '';
    let iterations = 0;
    try {
      while (decoded !== previous && iterations < 3) {
        previous = decoded;
        decoded = decodeURIComponent(decoded);
        iterations++;
      }
    } catch {
      throw new BadRequestException('Invalid URL encoding in path.');
    }

    // Check for null bytes
    if (decoded.includes('\0')) {
      this.logger.warn(`Null byte detected in path! Raw: "${rawPath}"`);
      throw new BadRequestException('Path traversal is not allowed.');
    }

    const unified = decoded.replace(/\\/g, '/');
    const normalized = path.posix.normalize(unified);

    // Remove leading slash to inspect relative structure
    let clean = normalized;
    if (clean.startsWith('/')) {
      clean = clean.slice(1);
    }

    // Check if the path escapes the virtual root
    if (
      clean === '..' ||
      clean.startsWith('../') ||
      clean.split('/').includes('..')
    ) {
      this.logger.warn(
        `Potential path traversal attack detected! Raw: "${rawPath}", Decoded: "${decoded}", Normalized: "${normalized}"`,
      );
      throw new BadRequestException('Path traversal is not allowed.');
    }

    return clean;
  }
}
