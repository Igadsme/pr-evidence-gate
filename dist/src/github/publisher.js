import { renderEvidenceCard } from "../core/report.js";
import { validateArtifact } from "../security/artifact.js";
export const evidenceMarker = "<!-- pr-evidence-gate -->";
export function findExistingComment(comments) { return comments.find((comment) => comment.body?.includes(evidenceMarker))?.id; }
export function prepareComment(raw, expected) { const evidence = validateArtifact(raw, expected); return { body: renderEvidenceCard(evidence), evidence }; }
//# sourceMappingURL=publisher.js.map