import { checkStatuses, evidenceKinds } from "./types.js";
export function parseEvidence(input) {
    if (!isRecord(input))
        throw new Error("Evidence must be an object");
    if (input.schemaVersion !== 1)
        throw new Error("Unsupported evidence schema version");
    for (const key of ["generatedAt", "repository", "baseSha", "headSha"])
        if (typeof input[key] !== "string")
            throw new Error(`Missing evidence field: ${key}`);
    if (!/^[^/\s]+\/[^/\s]+$/.test(input.repository))
        throw new Error("repository must be owner/name");
    if (!/^[0-9a-f]{7,64}$/i.test(input.baseSha) || !/^[0-9a-f]{7,64}$/i.test(input.headSha))
        throw new Error("baseSha and headSha must be Git SHAs");
    const verifier = input.verifier;
    if (!isRecord(verifier) || verifier.name !== "pr-evidence-gate" || typeof verifier.version !== "string")
        throw new Error("Invalid verifier identity");
    if (!Array.isArray(input.checks) || input.checks.length > 20 || !input.checks.every(isCheckResult))
        throw new Error("Invalid checks");
    if (!Array.isArray(input.limitations) || input.limitations.length > 50 || !input.limitations.every((v) => typeof v === "string"))
        throw new Error("Invalid limitations");
    if (input.pullRequestNumber !== undefined && (!Number.isInteger(input.pullRequestNumber) || input.pullRequestNumber < 1))
        throw new Error("Invalid pullRequestNumber");
    return input;
}
function isRecord(value) { return typeof value === "object" && value !== null && !Array.isArray(value); }
function isCheckResult(value) {
    if (!isRecord(value) || typeof value.kind !== "string" || !evidenceKinds.includes(value.kind) || typeof value.status !== "string" || !checkStatuses.includes(value.status) || typeof value.summary !== "string" || !Array.isArray(value.details) || !value.details.every((v) => typeof v === "string"))
        return false;
    return value.files === undefined || (Array.isArray(value.files) && value.files.every((v) => typeof v === "string"));
}
export function evidenceJsonSize(evidence) { return Buffer.byteLength(JSON.stringify(evidence), "utf8"); }
//# sourceMappingURL=schema.js.map