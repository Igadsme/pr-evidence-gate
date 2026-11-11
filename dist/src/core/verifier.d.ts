import { type Policy } from "./policy.js";
import { type Evidence } from "./schema.js";
import type { ChangedFile } from "./types.js";
export declare function loadPolicy(root: string, path?: string): Promise<Policy>;
export declare function verifyRepository(input: {
    repositoryRoot: string;
    baseSha: string;
    headSha: string;
    repository: string;
    pullRequestNumber?: number;
    changedFiles: ChangedFile[];
    policy?: Policy;
}): Promise<Evidence>;
