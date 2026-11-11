export interface PullRequestContext { owner: string; repo: string; number: number; baseSha: string; headSha: string; }
export function parseRepository(value: string): { owner: string; repo: string } { const match = /^([^/]+)\/([^/]+)$/.exec(value); if (!match?.[1] || !match[2]) throw new Error("GITHUB_REPOSITORY must be owner/name"); return { owner: match[1], repo: match[2] }; }
