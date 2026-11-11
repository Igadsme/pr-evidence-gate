export interface ProcessResult {
    code: number | null;
    signal: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
    timedOut: boolean;
    durationMs: number;
}
export declare function runCommand(command: string, args: string[], options: {
    cwd: string;
    timeoutMs: number;
    env?: NodeJS.ProcessEnv;
    maxOutputBytes: number;
}): Promise<ProcessResult>;
