import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import type { CheckResult, VerificationContext } from "../core/types.js";
import { runCommand } from "../core/process.js";
import { discoverRegressionTests, readPackageScripts } from "./discovery.js";

export type RegressionClassification = "VERIFIED" | "INCONCLUSIVE" | "REGRESSION" | "UNSUPPORTED" | "ERROR";

export async function verifyRegression(context: VerificationContext): Promise<CheckResult> {
  const tests = await discoverRegressionTests(context.repositoryRoot, context.changedFiles);
  if (!tests.length) return { kind: "regression", status: "SKIPPED", summary: "No regression tests were discovered.", details: ["Supported patterns include pytest, Vitest, and Jest test paths."], files: [] };
  const scripts = await readPackageScripts(context.repositoryRoot); const command = chooseCommand(context, tests, scripts);
  if (!command) return { kind: "regression", status: "SKIPPED", summary: "Discovered tests use an unsupported framework.", details: tests.slice(0, 20), files: tests.slice(0, 100) };
  const tempRoot = join(context.repositoryRoot, ".tmp"); await mkdir(tempRoot, { recursive: true });
  const baseDir = await mkdtemp(join(tempRoot, "pr-eg-base-")); const headDir = await mkdtemp(join(tempRoot, "pr-eg-head-"));
  try {
    const base = await runGitArchive(context.baseSha, baseDir, context.repositoryRoot); const head = await runGitArchive(context.headSha, headDir, context.repositoryRoot);
    if (base.code !== 0 || head.code !== 0) return { kind: "regression", status: "ERROR", summary: "Unable to materialize base or head revision.", details: [base.stderr, head.stderr].filter(Boolean) };
    const baseResult = await runCommand(command.command, command.args, { cwd: baseDir, timeoutMs: context.policy.limits.timeoutSeconds * 1000, maxOutputBytes: context.policy.limits.maxOutputBytes, env: safeEnv() });
    const headResult = await runCommand(command.command, command.args, { cwd: headDir, timeoutMs: context.policy.limits.timeoutSeconds * 1000, maxOutputBytes: context.policy.limits.maxOutputBytes, env: safeEnv() });
    const classification: RegressionClassification = baseResult.timedOut || headResult.timedOut ? "ERROR" : baseResult.code === 0 && headResult.code === 0 ? "INCONCLUSIVE" : baseResult.code !== 0 && headResult.code === 0 ? "VERIFIED" : headResult.code !== 0 ? "REGRESSION" : "ERROR";
    const status = classification === "VERIFIED" ? "PASS" : classification === "INCONCLUSIVE" ? "INCONCLUSIVE" : classification === "REGRESSION" ? "FAIL" : "ERROR";
    return { kind: "regression", status, summary: `${classification}: ${tests.length} test file(s) evaluated.`, details: [`base exit=${baseResult.code}`, `head exit=${headResult.code}`, ...truncate(baseResult.stderr, headResult.stderr)], files: tests.slice(0, 100), durationMs: baseResult.durationMs + headResult.durationMs };
  } finally { await rm(baseDir, { recursive: true, force: true }).catch(() => undefined); await rm(headDir, { recursive: true, force: true }).catch(() => undefined); }
}

function chooseCommand(context: VerificationContext, tests: string[], scripts: Record<string, string>): { command: string; args: string[] } | undefined {
  const py = tests.filter((file) => file.endsWith(".py")); if (py.length && context.policy.testFrameworks.includes("pytest")) return { command: "python3", args: ["-m", "pytest", "-q", ...py] };
  if (context.policy.testFrameworks.includes("vitest") && scripts.test?.includes("vitest")) return { command: "npm", args: ["test", "--", "--run", ...tests] };
  if (context.policy.testFrameworks.includes("jest") && scripts.test?.includes("jest")) return { command: "npm", args: ["test", "--", "--runInBand", ...tests] };
  return undefined;
}
async function runGitArchive(sha: string, destination: string, root: string) { return runCommand("git", ["archive", sha, "-o", join(destination, "revision.tar")], { cwd: root, timeoutMs: 120_000, maxOutputBytes: 200_000, env: safeEnv() }).then(async (result) => { if (result.code === 0) { const extract = await runCommand("tar", ["-xf", join(destination, "revision.tar"), "-C", destination], { cwd: root, timeoutMs: 120_000, maxOutputBytes: 200_000, env: safeEnv() }); return extract.code === 0 ? result : extract; } return result; }); }
function safeEnv(): NodeJS.ProcessEnv { return { PATH: process.env.PATH, HOME: process.env.HOME, CI: "1", NO_COLOR: "1", npm_config_cache: join(process.cwd(), ".npm-cache"), npm_config_ignore_scripts: "true" }; }
function truncate(...values: string[]): string[] { return values.filter(Boolean).flatMap((v) => v.split(/\r?\n/).filter(Boolean).slice(0, 10)); }
