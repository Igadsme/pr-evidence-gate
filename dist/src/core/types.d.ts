export declare const checkStatuses: readonly ["PASS", "FAIL", "INCONCLUSIVE", "SKIPPED", "ERROR"];
export type CheckStatus = (typeof checkStatuses)[number];
export declare const evidenceKinds: readonly ["regression", "imports", "linked-issue", "policy"];
export type EvidenceKind = (typeof evidenceKinds)[number];
export interface CheckResult {
    kind: EvidenceKind;
    status: CheckStatus;
    summary: string;
    details: string[];
    files?: string[];
    durationMs?: number;
}
export interface ChangedFile {
    path: string;
    status: "added" | "modified" | "deleted" | "renamed" | "unknown";
}
export interface VerificationContext {
    repositoryRoot: string;
    baseSha: string;
    headSha: string;
    policy: import("./policy.js").Policy;
    changedFiles: ChangedFile[];
}
