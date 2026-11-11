import type { CheckResult } from "../core/types.js";
import type { Policy } from "../core/policy.js";
export interface IssueLike {
    number: number;
    labels: string[];
    assigneeLogin?: string;
    state: "open" | "closed";
}
export declare function verifyLinkedIssues(policy: Policy, issues: IssueLike[]): CheckResult;
