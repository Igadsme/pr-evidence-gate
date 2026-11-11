# PR Evidence Gate

Verify the code. Not the contributor.

PR Evidence Gate is an open-source GitHub Action for deterministic evidence checks around pull requests. It verifies regression-test behavior, static imports, policy rules, and linked-issue evidence without requiring an AI service or SaaS backend.

## Local verification

```sh
npm ci
npm run typecheck
npm test
npm run build
node dist/src/cli.js verify --base <base-sha> --head <head-sha> --output .tmp/evidence.json --repository owner/name
```

The artifact is bounded and records the verified base/head SHAs. `VERIFIED` regression evidence means the selected test failed on base and passed on head. A test that passes on both revisions is `INCONCLUSIVE`; a collection/setup failure is `ERROR`, not proof of a defect.

## Policy

Copy `.github/contrib-policy.yml` into a consuming repository and adjust required checks, frameworks, issue rules, exclusions, and execution limits. Install the two example workflows: the `pull_request` verifier has no secrets and uploads a bounded artifact; the `workflow_run` publisher validates that artifact before updating one persistent comment.

## Security

PR code never receives publishing credentials. The publisher validates repository, PR identity, base/head SHA, schema, and size before updating a comment. See `docs/architecture.md` and `docs/threat-model.md`.

## Limitations

Dynamic imports, environment-specific dependencies, flaky tests, network-dependent tests, and malicious test code cannot be made fully safe by a read-only token. Use hardened runners and network controls for hostile repositories. The report is evidence, not certification of correctness.
