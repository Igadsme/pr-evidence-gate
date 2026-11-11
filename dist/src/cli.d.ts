#!/usr/bin/env node
import { type Evidence } from "./core/schema.js";
interface CliArgs {
    base: string;
    head: string;
    output: string;
    repository: string;
}
export declare function createInitialEvidence(input: Pick<CliArgs, "base" | "head" | "repository">): Evidence;
export {};
