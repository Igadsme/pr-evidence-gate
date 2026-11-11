import { validateArtifact, type ArtifactExpectation } from "../security/artifact.js";
export declare const evidenceMarker = "<!-- pr-evidence-gate -->";
export declare function findExistingComment(comments: Array<{
    id: number;
    body?: string;
}>): number | undefined;
export declare function prepareComment(raw: string, expected: ArtifactExpectation): {
    body: string;
    evidence: ReturnType<typeof validateArtifact>;
};
