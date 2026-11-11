export interface PullRequestContext {
    owner: string;
    repo: string;
    number: number;
    baseSha: string;
    headSha: string;
}
export declare function parseRepository(value: string): {
    owner: string;
    repo: string;
};
