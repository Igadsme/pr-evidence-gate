# Regression fixtures

Fixtures should contain a base revision where the regression test fails and a head revision where it passes, plus a false-evidence case where the test passes on both revisions. Benchmark claims must be generated from committed fixtures or external PRs with reproducible provenance; never hand-write outcome metrics.
