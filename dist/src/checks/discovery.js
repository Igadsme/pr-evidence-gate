import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const testPatterns = [/^(test|tests|spec|specs)\//i, /(^|\.)test\.[cm]?[jt]sx?$/i, /(^|_)test\.py$/i, /^test_.*\.py$/i];
export async function discoverRegressionTests(root, changedFiles) {
    const candidates = changedFiles.filter((file) => file.status !== "deleted" && testPatterns.some((pattern) => pattern.test(file.path))).map((file) => file.path);
    if (candidates.length)
        return candidates;
    const result = [];
    async function walk(relative) {
        for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
            if (entry.name === "node_modules" || entry.name === ".git" || entry.name.startsWith("."))
                continue;
            const next = join(relative, entry.name);
            const normalized = next.replaceAll("\\", "/");
            if (entry.isDirectory())
                await walk(next);
            else if (testPatterns.some((pattern) => pattern.test(normalized)))
                result.push(normalized);
            if (result.length >= 200)
                return;
        }
    }
    await walk("");
    return result;
}
export async function readPackageScripts(root) {
    try {
        const parsed = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
        const scripts = typeof parsed === "object" && parsed !== null ? parsed.scripts : undefined;
        return typeof scripts === "object" && scripts !== null ? scripts : {};
    }
    catch {
        return {};
    }
}
//# sourceMappingURL=discovery.js.map