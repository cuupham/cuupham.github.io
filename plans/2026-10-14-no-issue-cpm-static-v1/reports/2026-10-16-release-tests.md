# Release verification report — 2026-10-16

## Outcome

**PASS** for merged `main` commit `57db88e69b68315763e54bcf663cfc051be86f31`.
GitHub Actions run [38832348016](https://github.com/cuupham/cuupham.github.io/actions/runs/38832348016) checked the exact post-merge commit and completed successfully. The `verify` job ran for 54 seconds on Ubuntu with Node `24.18.0` and repository token permission `contents: read` only. Pre-merge run [38832186907](https://github.com/cuupham/cuupham.github.io/actions/runs/38832186907) also passed on the exact head of [PR #1](https://github.com/cuupham/cuupham.github.io/pull/1).

This result verifies source and a freshly built CI artifact. It does not approve a Pages release artifact. Release approval still requires the separate manual workflow to record and present the exact source SHA, run ID, artifact ID, inventory hash, and uploaded artifact digest for owner review.

## Source boundaries

- Initial local snapshot at `2026-10-16T07:48:48.6752199+07:00`: HEAD `64e2bbf0d8911266ad992127e2509387fc74cb65`; working tree clean.
- The initial local `npm run verify` exited `0` after `219.080s`, but concurrent edits appeared before it finished. It is preliminary evidence rather than proof for one immutable tree.
- Pre-merge CI run `38832186907`: event `pull_request`, branch `codex/anime-portfolio-concept`, head `e92549c2badce50e7fc2f51c25c548449c6bf0c7`, success.
- Final authority is post-merge CI run `38832348016`: event `push`, branch `main`, head `57db88e69b68315763e54bcf663cfc051be86f31`, success.
- CI checkout disabled persisted credentials, and the explicit authentication check passed before dependency installation.

## Final test results

The CI gate executed the repository-defined sequence unchanged:

```text
npm run check && npm run test:unit && npm run test:artifact && npm run build
```

| Gate | Result | Evidence |
|---|---:|---|
| Content validation | PASS | 1 production post, 6 locale routes, 0 reachable assets |
| Astro diagnostics | PASS | 48 files; 0 errors, 0 warnings, 0 hints |
| Unit tests | PASS | 3/3 files; 94/94 tests passed; 0 failed; 0 skipped; 895ms |
| Artifact tests | PASS | 2/2 files; 4/4 tests passed; 0 failed; 0 skipped; 26.46s |
| Production build | PASS | 8 pages and 20 files; Astro build 908ms |

Total test cases: **98 passed, 0 failed, 0 skipped**.

The artifact suite includes the release failure-propagation contract and the independent artifact oracle. The final logs show the negative oracle covering stale routes, hidden paths, missing fragments, fixture leakage, and incorrect canonical metadata.

## Production artifact

The final build emitted these eight HTML routes:

```text
/404.html
/index.html
/vi/index.html
/en/index.html
/vi/content/index.html
/en/content/index.html
/vi/content/gioi-thieu-cpm/index.html
/en/content/gioi-thieu-cpm/index.html
```

The build reported `Artifact valid: 8 pages, 20 files`. The source validation found one genuine production post. No public fixture was used to populate production content.

## Warnings and skipped validation

- `npm ci` installed 413 packages, audited 414 packages, and reported 0 vulnerabilities. It also warned that `esbuild@0.28.2` has a postinstall script not covered by npm `allowScripts`; installation, verification, and production build still completed successfully.
- GitHub annotated that `ubuntu-latest` will begin migrating to Ubuntu 26 on 2026-10-19. This did not affect the completed run.
- Coverage was not measured because it is not part of `npm run verify`.
- No browser, live Pages, deployment, rollback, or exact uploaded-artifact approval was performed by this test task.

## Preliminary local evidence

Before the final content and hidden-path changes, the local gate produced 93 passed and 1 platform-dependent skipped unit test, 4 passed artifact tests, and a 4-page/16-file zero-content build. The skipped Windows case required file-symlink creation privilege; the final Ubuntu CI run executed the same case, resulting in 94/94 unit tests passed with no skip.

## Remaining release gate

The owner must review the receipt and exact uploaded artifact produced by the manual `Release CPM Pages` workflow before approving its protected `github-pages` job. A green PR check alone is not artifact approval and does not authorize deployment.

## Unresolved questions

None for source verification. Exact artifact approval and post-deployment HTTP checks remain release operations.
