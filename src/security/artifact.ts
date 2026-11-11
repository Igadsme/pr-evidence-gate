import { evidenceJsonSize, parseEvidence, type Evidence } from "../core/schema.js";

export interface ArtifactExpectation { repository: string; headSha: string; baseSha: string; pullRequestNumber?: number; maxBytes: number; }
export function validateArtifact(raw: string, expected: ArtifactExpectation): Evidence {
  if (Buffer.byteLength(raw, "utf8") > expected.maxBytes) throw new Error("Evidence artifact exceeds configured size limit");
  let parsed: unknown; try { parsed = JSON.parse(raw); } catch { throw new Error("Evidence artifact is not valid JSON"); }
  const evidence = parseEvidence(parsed);
  if (evidence.repository !== expected.repository || evidence.headSha !== expected.headSha || evidence.baseSha !== expected.baseSha) throw new Error("Evidence identity does not match the expected repository or commit");
  if (expected.pullRequestNumber !== undefined && evidence.pullRequestNumber !== expected.pullRequestNumber) throw new Error("Evidence PR number does not match workflow context");
  if (evidenceJsonSize(evidence) > expected.maxBytes) throw new Error("Normalized evidence artifact exceeds configured size limit");
  return evidence;
}
