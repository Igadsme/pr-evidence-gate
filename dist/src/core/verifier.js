import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parsePolicyDocument } from "./policy.js";
import { parseEvidence } from "./schema.js";
import { verifyImports } from "../checks/imports.js";
import { verifyRegression } from "../checks/regression.js";
export async function loadPolicy(root, path = ".github/contrib-policy.yml") { try {
    return parsePolicyDocument(await readFile(join(root, path), "utf8"));
}
catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
        return parsePolicyDocument("");
    throw new Error(`Invalid policy at ${path}: ${error instanceof Error ? error.message : String(error)}`);
} }
export async function verifyRepository(input) {
    const policy = input.policy ?? await loadPolicy(input.repositoryRoot);
    const context = { ...input, policy };
    const checks = [];
    if (policy.requiredChecks.includes("regression"))
        checks.push(await verifyRegression(context));
    if (policy.requiredChecks.includes("imports"))
        checks.push(await verifyImports(context));
    if (policy.requiredChecks.includes("linked-issue"))
        checks.push({ kind: "linked-issue", status: "SKIPPED", summary: "Linked-issue verification requires GitHub context.", details: ["Run the publisher workflow for issue metadata checks."] });
    const policyStatus = { kind: "policy", status: "PASS", summary: `Policy loaded in ${policy.mode} mode.`, details: [`Required checks: ${policy.requiredChecks.join(", ") || "none"}`] };
    checks.push(policyStatus);
    return parseEvidence({ schemaVersion: 1, generatedAt: new Date().toISOString(), repository: input.repository, pullRequestNumber: input.pullRequestNumber, baseSha: input.baseSha, headSha: input.headSha, verifier: { name: "pr-evidence-gate", version: "0.2.0" }, checks, limitations: ["Static checks cannot prove dynamically resolved imports or full behavioral correctness.", "Regression execution depends on repository dependencies and runner isolation."] });
}
//# sourceMappingURL=verifier.js.map