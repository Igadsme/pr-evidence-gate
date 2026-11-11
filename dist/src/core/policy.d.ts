export interface Policy {
    version: 1;
    mode: "advisory" | "enforcement";
    requiredChecks: Array<"regression" | "imports" | "linked-issue">;
    testFrameworks: Array<"pytest" | "vitest" | "jest">;
    linkedIssue: {
        required: boolean;
        acceptedLabels: string[];
        requireMaintainerAssignment: boolean;
    };
    documentationOnlyExempt: boolean;
    aiDisclosure: {
        required: boolean;
    };
    exclude: string[];
    limits: {
        timeoutSeconds: number;
        maxOutputBytes: number;
    };
}
export declare function parsePolicyDocument(document: string): Policy;
