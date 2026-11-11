import { spawn } from "node:child_process";
export function runCommand(command, args, options) {
    return new Promise((resolve, reject) => {
        const started = Date.now();
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        const child = spawn(command, args, { cwd: options.cwd, env: options.env, shell: false, stdio: ["ignore", "pipe", "pipe"] });
        const collect = (target) => (chunk) => { const value = chunk.toString("utf8"); if ((target === "stdout" ? stdout : stderr).length < options.maxOutputBytes) {
            const bounded = value.slice(0, options.maxOutputBytes - (target === "stdout" ? stdout : stderr).length);
            if (target === "stdout")
                stdout += bounded;
            else
                stderr += bounded;
        } };
        child.stdout.on("data", collect("stdout"));
        child.stderr.on("data", collect("stderr"));
        const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, options.timeoutMs);
        child.on("error", reject);
        child.on("close", (code, signal) => { clearTimeout(timer); resolve({ code, signal, stdout, stderr, timedOut, durationMs: Date.now() - started }); });
    });
}
//# sourceMappingURL=process.js.map