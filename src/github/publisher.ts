import { renderEvidenceCard } from "../core/report.js";
import { validateArtifact, type ArtifactExpectation } from "../security/artifact.js";

export const evidenceMarker = "<!-- pr-evidence-gate -->";
export function findExistingComment(comments: Array<{ id: number; body?: string }>): number | undefined { return comments.find((comment) => comment.body?.includes(evidenceMarker))?.id; }
export function prepareComment(raw: string, expected: ArtifactExpectation): { body: string; evidence: ReturnType<typeof validateArtifact> } { const evidence = validateArtifact(raw, expected); return { body: renderEvidenceCard(evidence), evidence }; }
