import type { CheckResult, VerificationContext } from "../core/types.js";
export type RegressionClassification = "VERIFIED" | "INCONCLUSIVE" | "REGRESSION" | "UNSUPPORTED" | "ERROR";
export declare function verifyRegression(context: VerificationContext): Promise<CheckResult>;
