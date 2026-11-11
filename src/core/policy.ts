export interface Policy {
  version: 1;
  mode: "advisory" | "enforcement";
  requiredChecks: Array<"regression" | "imports" | "linked-issue">;
  testFrameworks: Array<"pytest" | "vitest" | "jest">;
  linkedIssue: { required: boolean; acceptedLabels: string[]; requireMaintainerAssignment: boolean };
  documentationOnlyExempt: boolean;
  aiDisclosure: { required: boolean };
  exclude: string[];
  limits: { timeoutSeconds: number; maxOutputBytes: number };
}

const defaults: Policy = { version: 1, mode: "advisory", requiredChecks: ["imports"], testFrameworks: ["pytest", "vitest", "jest"], linkedIssue: { required: false, acceptedLabels: [], requireMaintainerAssignment: false }, documentationOnlyExempt: true, aiDisclosure: { required: false }, exclude: [], limits: { timeoutSeconds: 600, maxOutputBytes: 1_000_000 } };

export function parsePolicyDocument(document: string): Policy {
  const result: Record<string, unknown> = {};
  let section = "";
  for (const raw of document.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "");
    if (!line.trim()) continue;
    const item = /^\s*-\s*(.+)$/.exec(line);
    if (item && section) { const current = result[section]; if (Array.isArray(current)) current.push(scalar(item[1] ?? "")); else result[section] = [scalar(item[1] ?? "")]; continue; }
    const match = /^(\s*)([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!match) continue;
    const indent = match[1]?.length ?? 0; const key = match[2] ?? ""; const rawValue = match[3] ?? "";
    if (indent === 0) { section = key; result[key] = rawValue ? scalar(rawValue) : {}; }
    else if (section && typeof result[section] === "object" && result[section] !== null) (result[section] as Record<string, unknown>)[key] = scalar(rawValue);
  }
  const policy: Policy = { ...defaults, ...result, linkedIssue: { ...defaults.linkedIssue, ...(isRecord(result.linkedIssue) ? result.linkedIssue : {}) }, aiDisclosure: { ...defaults.aiDisclosure, ...(isRecord(result.aiDisclosure) ? result.aiDisclosure : {}) }, limits: { ...defaults.limits, ...(isRecord(result.limits) ? result.limits : {}) } } as Policy;
  if (policy.version !== 1 || !["advisory", "enforcement"].includes(policy.mode) || !Number.isInteger(policy.limits.timeoutSeconds) || policy.limits.timeoutSeconds < 1 || policy.limits.timeoutSeconds > 3600 || !Number.isInteger(policy.limits.maxOutputBytes) || policy.limits.maxOutputBytes < 1) throw new Error("Invalid contrib-policy.yml: check version, mode, and limits");
  return policy;
}

function scalar(value: string): unknown { const v = value.trim(); if (v === "true") return true; if (v === "false") return false; if (/^\d+$/.test(v)) return Number(v); if (v.startsWith("[") && v.endsWith("]")) return v.slice(1, -1).split(",").map((x) => x.trim()).filter(Boolean); return v.replace(/^['"]|['"]$/g, ""); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
