import type { ChangedFile } from "../core/types.js";
export declare function discoverRegressionTests(root: string, changedFiles: ChangedFile[]): Promise<string[]>;
export declare function readPackageScripts(root: string): Promise<Record<string, string>>;
