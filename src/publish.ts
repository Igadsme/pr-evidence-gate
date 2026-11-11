import { readFile } from "node:fs/promises";
import { prepareComment, findExistingComment } from "./github/publisher.js";
import { parseRepository } from "./github/octokit.js";

export async function publish(): Promise<void> {
  const token = process.env.GITHUB_TOKEN; const repository = process.env.GITHUB_REPOSITORY; const number = Number(process.env.PR_NUMBER); const artifact = process.env.PR_EVIDENCE_ARTIFACT ?? ".tmp/evidence.json";
  if (!token || !repository || !Number.isInteger(number) || number < 1) throw new Error("Publisher requires GITHUB_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER");
  const { owner, repo } = parseRepository(repository); const pull = await githubJson<{ base: { sha: string }; head: { sha: string } }>(token, `/repos/${owner}/${repo}/pulls/${number}`);
  const raw = await readFile(artifact, "utf8"); const prepared = prepareComment(raw, { repository, baseSha: pull.base.sha, headSha: pull.head.sha, pullRequestNumber: number, maxBytes: 1_000_000 });
  const comments = await githubJson<Array<{ id: number; body?: string }>>(token, `/repos/${owner}/${repo}/issues/${number}/comments?per_page=100`); const existing = findExistingComment(comments);
  if (existing) await githubJson(token, `/repos/${owner}/${repo}/issues/comments/${existing}`, "PATCH", { body: prepared.body }); else await githubJson(token, `/repos/${owner}/${repo}/issues/${number}/comments`, "POST", { body: prepared.body });
}

async function githubJson<T = unknown>(token: string, path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, { method, headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28", ...(body ? { "content-type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) throw new Error(`GitHub API ${method} ${path} failed: ${response.status} ${await response.text()}`);
  return response.status === 204 ? undefined as T : await response.json() as T;
}
