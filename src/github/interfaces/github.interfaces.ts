export interface GithubRepoInfo {
  private: boolean;
  name: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  subscribers_count?: number;
  watchers_count: number;
  topics?: string[];
}

export interface GithubFileResponse {
  type: string;
  content?: string;
  size: number;
  name: string;
  path: string;
}

export interface PortfolioConfig {
  include?: boolean;
  title?: string;
  brief?: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
  order?: number;
  featured?: boolean;
  hasSourceCode?: boolean;
  liveUrl?: string;
}

export interface GithubRelease {
  tag_name: string;
  name: string;
  body: string | null;
  published_at: string;
}

export interface GithubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GithubContributorStats {
  total: number;
}

export interface GithubIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  user: {
    login: string;
  } | null;
  comments: number;
  pull_request?: Record<string, unknown> | null;
}

export interface GithubPullRequest {
  number: number;
  title: string;
  state: string;
  created_at: string;
  user: {
    login: string;
  } | null;
  merged_at: string | null;
}

export interface GithubWorkflowRun {
  name: string;
  status: string;
  conclusion: string | null;
  head_branch: string;
  head_commit: {
    message: string;
    id: string;
  } | null;
  triggering_actor: {
    login: string;
  } | null;
  created_at: string;
}

export interface GithubWorkflowRunsResponse {
  workflow_runs: GithubWorkflowRun[];
}

// Proxied output interfaces
export interface ProxiedRepoItem {
  name: string;
  path: string;
  type: string;
  size: number;
}

export interface ProxiedFileContent {
  content: string;
  size: number;
  language: string;
  lines: number;
}

export interface ProxiedReadme {
  content: string;
}

export interface ProxiedRelease {
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
}

export interface ProxiedContributor {
  username: string;
  avatarUrl: string;
  contributions: number;
}

export interface ProxiedCommit {
  sha: string;
  message: string;
  authorName: string;
  authorLogin: string;
  avatarUrl: string;
  date: string;
}

export interface ProxiedIssue {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  userLogin: string;
  comments: number;
}

export interface ProxiedPullRequest {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  userLogin: string;
  mergedAt: string | null;
}

export interface ProxiedWorkflowRun {
  name: string;
  status: string;
  conclusion: string | null;
  branch: string;
  commitMessage: string;
  commitSha: string;
  actorLogin: string;
  createdAt: string;
}

export interface ProxiedRepoMetadata {
  description: string;
  homepage: string;
  stars: number;
  forks: number;
  watchers: number;
  topics: string[];
  releases: ProxiedRelease[];
  contributors: ProxiedContributor[];
  totalCommits: number;
  commits: ProxiedCommit[];
  issues: ProxiedIssue[];
  pulls: ProxiedPullRequest[];
  workflowRuns: ProxiedWorkflowRun[];
}

export interface IGithubApiService {
  readonly username: string;
  fetchRaw(endpoint: string, options?: RequestInit): Promise<Response>;
  fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T>;
}
