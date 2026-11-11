import { type Evidence } from "../core/schema.js";
export interface ArtifactExpectation {
    repository: string;
    headSha: string;
    baseSha: string;
    pullRequestNumber?: number;
    maxBytes: number;
}
export declare function validateArtifact(raw: string, expected: ArtifactExpectation): Evidence;
