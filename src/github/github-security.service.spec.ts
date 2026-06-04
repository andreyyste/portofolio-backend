import { Test, TestingModule } from '@nestjs/testing';
import { GithubSecurityService } from './github-security.service';
import { BadRequestException } from '@nestjs/common';

describe('GithubSecurityService', () => {
  let service: GithubSecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubSecurityService],
    }).compile();

    service = module.get<GithubSecurityService>(GithubSecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePath', () => {
    it('should return empty string for empty/root paths', () => {
      expect(service.validatePath('')).toBe('');
      expect(service.validatePath('/')).toBe('');
      expect(service.validatePath('   ')).toBe('');
    });

    it('should allow normal file paths', () => {
      expect(service.validatePath('README.md')).toBe('README.md');
      expect(service.validatePath('src/main.ts')).toBe('src/main.ts');
      expect(service.validatePath('/src/main.ts')).toBe('src/main.ts');
    });

    it('should resolve safe relative navigation paths', () => {
      expect(service.validatePath('src/components/../main.ts')).toBe(
        'src/main.ts',
      );
    });

    it('should throw BadRequestException on simple path traversal', () => {
      expect(() => service.validatePath('..')).toThrow(BadRequestException);
      expect(() => service.validatePath('../')).toThrow(BadRequestException);
      expect(() => service.validatePath('../../etc/passwd')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on URL encoded path traversal', () => {
      expect(() => service.validatePath('%2e%2e%2f')).toThrow(
        BadRequestException,
      );
      expect(() => service.validatePath('foo/%2e%2e/%2e%2e/bar')).toThrow(
        BadRequestException,
      );
      expect(() => service.validatePath('%252e%252e%252f')).toThrow(
        BadRequestException,
      ); // double encoded
    });

    it('should throw BadRequestException on null bytes', () => {
      expect(() => service.validatePath('src/main.ts\0')).toThrow(
        BadRequestException,
      );
      expect(() => service.validatePath('src/%00main.ts')).toThrow(
        BadRequestException,
      );
    });
  });
});
