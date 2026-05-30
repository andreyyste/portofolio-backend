import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GithubController } from './github.controller';
import { GithubApiService } from './github-api.service';
import { GithubSyncService } from './github-sync.service';
import { GithubProxyService } from './github-proxy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 3600000, // Default TTL is 1 hour in milliseconds
      max: 100,     // Max items in memory
    }),
  ],
  controllers: [GithubController],
  providers: [GithubApiService, GithubSyncService, GithubProxyService],
  exports: [GithubSyncService, GithubProxyService],
})
export class GithubModule {}
