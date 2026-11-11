# Security policy

Please report vulnerabilities privately to the repository maintainers. Do not include secrets or exploit payloads in public issues.

## Deployment requirements

- Keep the verifier on `pull_request`, never `pull_request_target`.
- Do not grant secrets to PR verification.
- Keep publisher permissions limited to `actions: read`, `contents: read`, and `pull-requests: write`.
- Pin action dependencies to reviewed major versions or immutable SHAs according to your organization’s policy.
- Keep artifact retention short and validate repository, PR number, base SHA, head SHA, schema, and byte size before publishing.

The action does not provide sandboxing beyond the GitHub runner. Repositories with hostile or highly sensitive test suites should use a dedicated hardened runner and explicit network controls.
