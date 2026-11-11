# Architecture

The product has two trust zones:

1. `pull_request` runs `src/cli.ts` in the unprivileged verifier. It checks out the PR with read-only permissions, runs bounded local checks, and uploads only `.tmp/evidence.json`.
2. `workflow_run` runs the publisher. It downloads the named artifact from the exact completed verifier run, fetches the current PR base/head SHAs, validates artifact size/schema/identity, and then creates or updates the marked comment.

The verifier is intentionally independent of GitHub APIs. `src/core/verifier.ts` accepts a local repository root, SHAs, policy, and changed-file list. `src/checks/` contains independently testable adapters. `src/security/artifact.ts` is the publisher’s data boundary.

The verifier does not infer contributor identity, AI authorship, or maliciousness from unfamiliar dependencies. A dynamic import, registry outage, collection error, or environment mismatch is reported as uncertainty or error rather than proof.
