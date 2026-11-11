export function parseRepository(value) { const match = /^([^/]+)\/([^/]+)$/.exec(value); if (!match?.[1] || !match[2])
    throw new Error("GITHUB_REPOSITORY must be owner/name"); return { owner: match[1], repo: match[2] }; }
//# sourceMappingURL=octokit.js.map