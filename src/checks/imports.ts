import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CheckResult, VerificationContext } from "../core/types.js";
import { runCommand } from "../core/process.js";

export async function verifyImports(context: VerificationContext): Promise<CheckResult> {
  const files = context.changedFiles.filter((file) => /\.(py|mjs|cjs|js|jsx|ts|tsx)$/.test(file.path) && !context.policy.exclude.some((pattern) => file.path.startsWith(pattern))).map((file) => file.path);
  if (!files.length) return { kind: "imports", status: "SKIPPED", summary: "No supported source files changed.", details: [] };
  const findings: string[] = [];
  for (const file of files.slice(0, 200)) { const source = await readFile(join(context.repositoryRoot, file), "utf8"); if (file.endsWith(".py")) findings.push(...await pythonFindings(context.repositoryRoot, file, source)); else findings.push(...javascriptFindings(file, source)); }
  return findings.length ? { kind: "imports", status: "FAIL", summary: `${findings.length} unresolved or suspicious import reference(s) found.`, details: findings.slice(0, 100), files } : { kind: "imports", status: "PASS", summary: "Static import checks found no unresolved references.", details: ["Third-party package availability is only checked when statically resolvable."], files };
}

async function pythonFindings(root: string, file: string, source: string): Promise<string[]> {
  const findings: string[] = []; const imports = [...source.matchAll(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm)];
  for (const match of imports) { const name = match[1] ?? match[2]; if (!name || name.startsWith(".")) continue; const probe = await runCommand("python3", ["-c", "import importlib.util,sys; sys.exit(0 if importlib.util.find_spec(sys.argv[1]) else 1)", name], { cwd: root, timeoutMs: 5_000, maxOutputBytes: 2_000, env: { PATH: process.env.PATH } }); if (probe.code !== 0 && !(await isLocalPython(root, name))) findings.push(`${file}: unresolved Python import '${name}' (registry availability is not treated as malicious)`); }
  return findings;
}
function javascriptFindings(file: string, source: string): string[] { const findings: string[] = []; for (const match of source.matchAll(/(?:import\s+(?:[^"']+from\s+)?|require\()\s*["']([^"']+)["']/g)) { const name = match[1]; if (name && !name.startsWith(".") && !name.startsWith("node:")) findings.push(`${file}: third-party import '${name}' requires package-lock/package.json verification`); } return findings; }
async function isLocalPython(root: string, name: string): Promise<boolean> { const first = name.split(".")[0] ?? name; try { await access(join(root, `${first}.py`)); return true; } catch { try { await access(join(root, first)); return true; } catch { return false; } } }
