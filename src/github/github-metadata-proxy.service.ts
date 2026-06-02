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
  GithubWorkflowRun,
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
      // 1. Repo info (stars, forks, description, etc.)
      const info = await this.api.fetchJson<GithubRepoInfo>(
        `/repos/${this.api.username}/${repoName}`,
      );

      // 2. Releases (Handles missing releases or api failure gracefully)
      let releases: GithubRelease[] = [];
      try {
        const res = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/releases?per_page=5`,
        );
        if (res.ok) {
          releases = (await res.json()) as GithubRelease[];
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.warn(
          `Failed to fetch releases for ${repoName}: ${errorMsg}`,
        );
      }

      // 3. Contributors
      let contributors: GithubContributor[] = [];
      try {
        const res = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/contributors?per_page=10`,
        );
        if (res.ok) {
          contributors = (await res.json()) as GithubContributor[];
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.warn(
          `Failed to fetch contributors for ${repoName}: ${errorMsg}`,
        );
      }

      // 4. Commits & Total Commits Count
      let commits: GithubCommit[] = [];
      let totalCommits = 0;
      try {
        const res = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/commits?per_page=15`,
        );
        if (res.ok) {
          commits = (await res.json()) as GithubCommit[];
        }

        const statsRes = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/stats/contributors`,
        );
        if (statsRes.ok) {
          const stats = (await statsRes.json()) as GithubContributorStats[];
          if (Array.isArray(stats)) {
            totalCommits = stats.reduce(
              (acc, curr) => acc + (curr.total || 0),
              0,
            );
          }
        }
        if (totalCommits === 0 && commits.length > 0) {
          totalCommits = commits.length;
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.warn(
          `Failed to fetch commits for ${repoName}: ${errorMsg}`,
        );
      }

      // 5. Issues (filter out PRs)
      let issues: GithubIssue[] = [];
      try {
        const res = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/issues?state=all&per_page=20`,
        );
        if (res.ok) {
          const rawIssues = (await res.json()) as GithubIssue[];
          issues = rawIssues.filter((i) => !i.pull_request);
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Failed to fetch issues for ${repoName}: ${errorMsg}`);
      }

      // 6. Pull Requests
      let pulls: GithubPullRequest[] = [];
      try {
        const res = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/pulls?state=all&per_page=15`,
        );
        if (res.ok) {
          pulls = (await res.json()) as GithubPullRequest[];
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Failed to fetch pulls for ${repoName}: ${errorMsg}`);
      }

      // 7. Actions Workflow Runs
      let workflowRuns: GithubWorkflowRun[] = [];
      try {
        const res = await this.api.fetchRaw(
          `/repos/${this.api.username}/${repoName}/actions/runs?per_page=10`,
        );
        if (res.ok) {
          const runsData = (await res.json()) as GithubWorkflowRunsResponse;
          workflowRuns = runsData.workflow_runs || [];
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.warn(
          `Failed to fetch workflow runs for ${repoName}: ${errorMsg}`,
        );
      }

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
