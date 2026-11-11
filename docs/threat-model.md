# Threat model

## Trust boundaries

The pull request is untrusted input. The unprivileged verifier may inspect and execute PR-controlled tests, but it receives no repository secrets and has read-only permissions. Its output is a bounded JSON artifact.

The privileged publisher is trusted to write a PR comment, but it must treat downloaded artifacts as untrusted data. It validates the artifact against the schema, expected workflow, repository, PR number, head SHA, size limit, and allowed fields. It never checks out or executes PR content.

## Main risks and mitigations

- Test code can attempt network access, resource exhaustion, or filesystem access. Use ephemeral runners, timeouts, bounded output, minimal permissions, and platform-level isolation; residual risk remains runner-specific.
- A forged or stale artifact could cause an incorrect comment. Bind the artifact to the expected workflow run, repository, PR identity, and verified head SHA before publishing.
- Dependency installation can execute lifecycle scripts. Prefer lockfiles, explicit framework adapters, restricted network policy, and document that package installation is a residual risk.
- A failed test collection is not proof of a defect. Classify setup/import/collection failures as `ERROR` or `UNSUPPORTED`.

No workflow uses `pull_request_target` to execute PR code.
