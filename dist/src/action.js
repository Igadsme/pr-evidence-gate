import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInitialEvidence } from "./cli.js";
export async function runAction() {
    if (process.env.PR_EVIDENCE_MODE === "publish") {
        const { publish } = await import("./publish.js");
        await publish();
        return;
    }
    const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
    const base = process.env.GITHUB_BASE_SHA ?? "0000000";
    const head = process.env.GITHUB_SHA ?? "0000000";
    const output = resolve(root, process.env.PR_EVIDENCE_OUTPUT ?? ".tmp/evidence.json");
    const evidence = createInitialEvidence({ base, head, repository: process.env.GITHUB_REPOSITORY ?? "unknown/unknown" });
    await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    await readFile(output, "utf8");
}
if (import.meta.url === `file://${process.argv[1]}`)
    runAction().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
//# sourceMappingURL=action.js.map