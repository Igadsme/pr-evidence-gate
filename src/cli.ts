#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseEvidence, type Evidence } from "./core/schema.js";
import { runCommand } from "./core/process.js";
import { verifyRepository } from "./core/verifier.js";
import type { ChangedFile } from "./core/types.js";

interface CliArgs { base: string; head: string; output: string; repository: string; }

function args(argv: string[]): CliArgs {
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key?.startsWith("--")) {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
      values.set(key.slice(2), value);
      i += 1;
    }
  }
  const base = values.get("base");
  const head = values.get("head");
  const output = values.get("output");
  if (!base || !head || !output) throw new Error("Usage: pr-evidence verify --base <sha> --head <sha> --output <file> [--repository owner/name]");
  return { base, head, output, repository: values.get("repository") ?? "local/working-tree" };
}

export function createInitialEvidence(input: Pick<CliArgs, "base" | "head" | "repository">): Evidence {
  return parseEvidence({
    schemaVersion: 1, generatedAt: new Date().toISOString(), repository: input.repository,
    baseSha: input.base, headSha: input.head, verifier: { name: "pr-evidence-gate", version: "0.1.0" },
    checks: [], limitations: ["Milestone 1 CLI skeleton: verification adapters are not yet enabled."],
  });
}

async function changedFiles(root: string, base: string, head: string): Promise<ChangedFile[]> {
  const result = await runCommand("git", ["diff", "--name-status", `${base}...${head}`], { cwd: root, timeoutMs: 30_000, maxOutputBytes: 1_000_000, env: process.env });
  if (result.code !== 0) throw new Error(`Unable to inspect revisions: ${result.stderr}`);
  return result.stdout.split(/\r?\n/).filter(Boolean).map((line): ChangedFile => { const [status = "", ...paths] = line.split("\t"); const path = paths.at(-1) ?? ""; return { path, status: status.startsWith("A") ? "added" : status.startsWith("M") ? "modified" : status.startsWith("D") ? "deleted" : status.startsWith("R") ? "renamed" : "unknown" }; });
}

async function main(): Promise<void> {
  if (process.argv[2] !== "verify") throw new Error("Expected command: verify");
  const input = args(process.argv.slice(3));
  const root = process.cwd(); const evidence = await verifyRepository({ repositoryRoot: root, baseSha: input.base, headSha: input.head, repository: input.repository, changedFiles: await changedFiles(root, input.base, input.head) });
  await mkdir(dirname(resolve(input.output)), { recursive: true });
  await writeFile(input.output, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  process.stdout.write(`Wrote evidence artifact to ${input.output}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
}
