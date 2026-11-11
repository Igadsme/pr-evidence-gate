import { checkStatuses, evidenceKinds, type CheckResult } from "./types.js";

export interface Evidence {
  schemaVersion: 1;
  generatedAt: string;
  repository: string;
  pullRequestNumber?: number;
  baseSha: string;
  headSha: string;
  verifier: { name: "pr-evidence-gate"; version: string };
  checks: CheckResult[];
  limitations: string[];
}

export function parseEvidence(input: unknown): Evidence {
  if (!isRecord(input)) throw new Error("Evidence must be an object");
  if (input.schemaVersion !== 1) throw new Error("Unsupported evidence schema version");
  for (const key of ["generatedAt", "repository", "baseSha", "headSha"]) if (typeof input[key] !== "string") throw new Error(`Missing evidence field: ${key}`);
  if (!/^[^/\s]+\/[^/\s]+$/.test(input.repository as string)) throw new Error("repository must be owner/name");
  if (!/^[0-9a-f]{7,64}$/i.test(input.baseSha as string) || !/^[0-9a-f]{7,64}$/i.test(input.headSha as string)) throw new Error("baseSha and headSha must be Git SHAs");
  const verifier = input.verifier;
  if (!isRecord(verifier) || verifier.name !== "pr-evidence-gate" || typeof verifier.version !== "string") throw new Error("Invalid verifier identity");
  if (!Array.isArray(input.checks) || input.checks.length > 20 || !input.checks.every(isCheckResult)) throw new Error("Invalid checks");
  if (!Array.isArray(input.limitations) || input.limitations.length > 50 || !input.limitations.every((v) => typeof v === "string")) throw new Error("Invalid limitations");
  if (input.pullRequestNumber !== undefined && (!Number.isInteger(input.pullRequestNumber) || input.pullRequestNumber < 1)) throw new Error("Invalid pullRequestNumber");
  return input as unknown as Evidence;
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function isCheckResult(value: unknown): value is CheckResult {
  if (!isRecord(value) || typeof value.kind !== "string" || !evidenceKinds.includes(value.kind as never) || typeof value.status !== "string" || !checkStatuses.includes(value.status as never) || typeof value.summary !== "string" || !Array.isArray(value.details) || !value.details.every((v) => typeof v === "string")) return false;
  return value.files === undefined || (Array.isArray(value.files) && value.files.every((v) => typeof v === "string"));
}

export function evidenceJsonSize(evidence: Evidence): number { return Buffer.byteLength(JSON.stringify(evidence), "utf8"); }
