import { Injectable, Logger } from '@nestjs/common';
import { GithubApiService } from './github-api.service';
import {
  GithubRepoInfo,
  GithubRelease,
  GithubContributor,
  GithubCommit,
  GithubContributorStats,
  GithubIssue,
  GithubPullRequest,
  GithubWorkflowRunsResponse,
  ProxiedRepoMetadata,
} from './interfaces/github.interfaces';

@Injectable()
export class GithubMetadataProxyService {
  private readonly logger = new Logger(GithubMetadataProxyService.name);

  constructor(private readonly api: GithubApiService) {}

  /**
   * Fetches detailed repo metadata (stars, forks, subscribers/watchers, releases, contributors, commits, issues, PRs, actions).
   * Aggregates information from multiple GitHub API endpoints concurrently or sequentially with proper error boundary mapping.
   *
   * @param repoName - Name of the target repository
   * @returns Comprehensive aggregated repository metadata
   */
  async getRepoMetadata(repoName: string): Promise<ProxiedRepoMetadata> {
    try {
      const username = this.api.username;

      // Helper to fetch endpoints safely in parallel without one failing the entire batch
      const fetchSafely = async <T>(
        endpoint: string,
        defaultValue: T,
      ): Promise<T> => {
        try {
          const res = await this.api.fetchRaw(endpoint);
          if (res.ok) {
            return (await res.json()) as T;
          }
          this.logger.warn(
            `GitHub API returned non-OK status for ${endpoint}: ${res.statusText} (${res.status})`,
          );
        } catch (e: unknown) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          this.logger.warn(`Failed to fetch ${endpoint}: ${errorMsg}`);
        }
        return defaultValue;
      };

      // Execute all API requests in parallel to optimize latency and scale response performance
      const [
        info,
        releases,
        contributors,
        commits,
        stats,
        rawIssues,
        pulls,
        runsData,
      ] = await Promise.all([
        this.api.fetchJson<GithubRepoInfo>(`/repos/${username}/${repoName}`),
        fetchSafely<GithubRelease[]>(
          `/repos/${username}/${repoName}/releases?per_page=5`,
          [],
        ),
        fetchSafely<GithubContributor[]>(
          `/repos/${username}/${repoName}/contributors?per_page=10`,
          [],
        ),
        fetchSafely<GithubCommit[]>(
          `/repos/${username}/${repoName}/commits?per_page=15`,
          [],
        ),
        fetchSafely<GithubContributorStats[] | null>(
          `/repos/${username}/${repoName}/stats/contributors`,
          null,
        ),
        fetchSafely<GithubIssue[]>(
          `/repos/${username}/${repoName}/issues?state=all&per_page=20`,
          [],
        ),
        fetchSafely<GithubPullRequest[]>(
          `/repos/${username}/${repoName}/pulls?state=all&per_page=15`,
          [],
        ),
        fetchSafely<GithubWorkflowRunsResponse | null>(
          `/repos/${username}/${repoName}/actions/runs?per_page=10`,
          null,
        ),
      ]);

      // Calculate total commits count from stats if available
      let totalCommits = 0;
      if (stats && Array.isArray(stats)) {
        totalCommits = stats.reduce((acc, curr) => acc + (curr.total || 0), 0);
      }
      if (totalCommits === 0 && commits.length > 0) {
        totalCommits = commits.length;
      }

      // Filter out Pull Requests from raw issues list
      const issues = rawIssues.filter((i) => !i.pull_request);
      const workflowRuns = runsData?.workflow_runs || [];

      return {
        description: info.description || '',
        homepage: info.homepage || '',
        stars: info.stargazers_count,
        forks: info.forks_count,
        watchers: info.subscribers_count || info.watchers_count,
        topics: info.topics || [],
        releases: releases.map((r) => ({
          tagName: r.tag_name,
          name: r.name,
          body: r.body || '',
          publishedAt: r.published_at,
        })),
        contributors: contributors.map((c) => ({
          username: c.login,
          avatarUrl: c.avatar_url,
          contributions: c.contributions,
        })),
        totalCommits: totalCommits || 150,
        commits: commits.map((c) => ({
          sha: c.sha,
          message: c.commit?.message || '',
          authorName: c.commit?.author?.name || '',
          authorLogin: c.author?.login || c.commit?.author?.name || '',
          avatarUrl: c.author?.avatar_url || '',
          date: c.commit?.author?.date || '',
        })),
        issues: issues.map((i) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          createdAt: i.created_at,
          userLogin: i.user?.login || '',
          comments: i.comments || 0,
        })),
        pulls: pulls.map((p) => ({
          number: p.number,
          title: p.title,
          state: p.state,
          createdAt: p.created_at,
          userLogin: p.user?.login || '',
          mergedAt: p.merged_at || null,
        })),
        workflowRuns: workflowRuns.map((r) => ({
          name: r.name,
          status: r.status,
          conclusion: r.conclusion,
          branch: r.head_branch,
          commitMessage: r.head_commit?.message || '',
          commitSha: r.head_commit?.id || '',
          actorLogin: r.triggering_actor?.login || '',
          createdAt: r.created_at,
        })),
      };
    } catch (error) {
      this.logger.error(`Error fetching metadata for repo ${repoName}:`, error);
      throw error;
    }
  }
}
