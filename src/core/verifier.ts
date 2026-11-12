import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parsePolicyDocument, type Policy } from "./policy.js";
import { parseEvidence, type Evidence } from "./schema.js";
import type { CheckResult, ChangedFile, VerificationContext } from "./types.js";
import { verifyImports } from "../checks/imports.js";
import { verifyRegression } from "../checks/regression.js";

export async function loadPolicy(root: string, path = ".github/contrib-policy.yml"): Promise<Policy> { try { return parsePolicyDocument(await readFile(join(root, path), "utf8")); } catch (error) { if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") return parsePolicyDocument(""); throw new Error(`Invalid policy at ${path}: ${error instanceof Error ? error.message : String(error)}`); } }

export async function verifyRepository(input: { repositoryRoot: string; baseSha: string; headSha: string; repository: string; pullRequestNumber?: number; changedFiles: ChangedFile[]; policy?: Policy }): Promise<Evidence> {
  const policy = input.policy ?? await loadPolicy(input.repositoryRoot); const context: VerificationContext = { ...input, policy };
  const checks: CheckResult[] = [];
  if (policy.requiredChecks.includes("regression")) checks.push(await verifyRegression(context));
  if (policy.requiredChecks.includes("imports")) checks.push(await verifyImports(context));
  if (policy.requiredChecks.includes("linked-issue")) checks.push({ kind: "linked-issue", status: "SKIPPED", summary: "Linked-issue verification requires GitHub context.", details: ["Run the publisher workflow for issue metadata checks."] });
  const policyStatus: CheckResult = { kind: "policy", status: "PASS", summary: `Policy loaded in ${policy.mode} mode.`, details: [`Required checks: ${policy.requiredChecks.join(", ") || "none"}`] };
  checks.push(policyStatus);
  return parseEvidence({ schemaVersion: 1, generatedAt: new Date().toISOString(), repository: input.repository, ...(input.pullRequestNumber === undefined ? {} : { pullRequestNumber: input.pullRequestNumber }), baseSha: input.baseSha, headSha: input.headSha, verifier: { name: "pr-evidence-gate", version: "0.2.0" }, checks, limitations: ["Static checks cannot prove dynamically resolved imports or full behavioral correctness.", "Regression execution depends on repository dependencies and runner isolation."] });
}
