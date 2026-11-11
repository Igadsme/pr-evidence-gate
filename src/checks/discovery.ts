import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ChangedFile } from "../core/types.js";

const testPatterns = [/^(test|tests|spec|specs)\//i, /(^|\.)test\.[cm]?[jt]sx?$/i, /(^|_)test\.py$/i, /^test_.*\.py$/i];
export async function discoverRegressionTests(root: string, changedFiles: ChangedFile[]): Promise<string[]> {
  const candidates = changedFiles.filter((file) => file.status !== "deleted" && testPatterns.some((pattern) => pattern.test(file.path))).map((file) => file.path);
  if (candidates.length) return candidates;
  const result: string[] = [];
  async function walk(relative: string): Promise<void> {
    for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name.startsWith(".")) continue;
      const next = join(relative, entry.name); const normalized = next.replaceAll("\\", "/");
      if (entry.isDirectory()) await walk(next); else if (testPatterns.some((pattern) => pattern.test(normalized))) result.push(normalized);
      if (result.length >= 200) return;
    }
  }
  await walk(""); return result;
}

export async function readPackageScripts(root: string): Promise<Record<string, string>> {
  try { const parsed: unknown = JSON.parse(await readFile(join(root, "package.json"), "utf8")); const scripts = typeof parsed === "object" && parsed !== null ? (parsed as { scripts?: unknown }).scripts : undefined; return typeof scripts === "object" && scripts !== null ? scripts as Record<string, string> : {}; } catch { return {}; }
}
