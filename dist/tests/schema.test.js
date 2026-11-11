import { describe, expect, it } from "vitest";
import { parseEvidence } from "../src/core/schema.js";
import { parsePolicyDocument } from "../src/core/policy.js";
import { createInitialEvidence } from "../src/cli.js";
describe("evidence schema", () => {
    it("creates a bounded, parseable initial artifact", () => {
        const evidence = createInitialEvidence({ base: "a".repeat(40), head: "b".repeat(40), repository: "owner/repo" });
        expect(parseEvidence(evidence).schemaVersion).toBe(1);
    });
    it("rejects a repository without owner/name", () => {
        expect(() => parseEvidence({ schemaVersion: 1, generatedAt: new Date().toISOString(), repository: "bad", baseSha: "a".repeat(40), headSha: "b".repeat(40), verifier: { name: "pr-evidence-gate", version: "0.1.0" }, checks: [], limitations: [] })).toThrow();
    });
});
describe("policy", () => {
    it("applies safe defaults", () => {
        const policy = parsePolicyDocument("mode: advisory\n");
        expect(policy.requiredChecks).toContain("imports");
        expect(policy.limits.timeoutSeconds).toBe(600);
    });
    it("rejects invalid enforcement policy values", () => {
        expect(() => parsePolicyDocument("mode: unsafe\n")).toThrow();
    });
});
//# sourceMappingURL=schema.test.js.map