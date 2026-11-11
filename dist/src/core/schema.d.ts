import { type CheckResult } from "./types.js";
export interface Evidence {
    schemaVersion: 1;
    generatedAt: string;
    repository: string;
    pullRequestNumber?: number;
    baseSha: string;
    headSha: string;
    verifier: {
        name: "pr-evidence-gate";
        version: string;
    };
    checks: CheckResult[];
    limitations: string[];
}
export declare function parseEvidence(input: unknown): Evidence;
export declare function evidenceJsonSize(evidence: Evidence): number;
