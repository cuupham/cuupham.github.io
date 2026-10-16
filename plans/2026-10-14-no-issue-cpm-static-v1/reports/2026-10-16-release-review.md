# CPM PR #1 — independent release review

## Scope and verdict

- Reviewed `origin/main...64e2bbf0d8911266ad992127e2509387fc74cb65` and the subsequent narrow working-tree remediation in `scripts/check-artifact.mjs`, `tests/artifact/site-artifact.test.ts`, and `src/content/posts/gioi-thieu-cpm.md`, focusing on first migration/rollback, `GITHUB_TOKEN` API permissions, owner environment/artifact approval, source-to-artifact integrity, and draft/fixture exclusion.
- Source review found no privilege escalation in the PR workflow and no path that deploys an unaccepted PR artifact. The release workflow is manual, checks out the approved immutable SHA without persisted credentials, and limits Pages/OIDC write permission to the environment-gated deploy job.
- **Verdict: DONE_WITH_CONCERNS.** The artifact-inventory mismatch is resolved by the narrow working-tree remediation reviewed below. The controller reports that the rollback ref and owner-only environment controls have been configured and verified; Pages remains legacy until review and test gates are green. Provider switch must still precede merging the app onto legacy-published `main`.
- This reviewer did not run tests or builds; execution belongs to the tester. The controller reports that the pre-fix mutation test failed as expected and the targeted green run is in progress. `git diff --check` was clean for the reviewed remediation, apart from Git's informational LF-to-CRLF working-copy warnings.

## Finding history and remediation

### [High — resolved in working tree] Release receipt could inventory files that the Pages upload silently omits

**Original evidence:** `scripts/release-manifest.mjs:14-25` inventories every file under `dist/`, including dotfiles and files below dot-directories. `.github/workflows/deploy.yml:89-98` then uploads `dist/` with `actions/upload-pages-artifact` without `include-hidden-files`. The action's documented default is `false`, and its archive step excludes hidden files; it always excludes `.git` and `.github`. Before remediation, no artifact gate proved that the archive file set equaled the receipt's `files` list.

**Original impact:** An owner could approve a receipt that listed a hidden output absent from the exact artifact Pages deployed. That broke the stated source/artifact inventory contract and could cause silent production differences. The remediation below now fails the artifact before receipt creation.

**Fix:** Make the two file sets equal by construction and test it. The safer narrow change is to reject every hidden path segment in `checkArtifact`/`release-manifest` while leaving the upload action's default exclusion in place, including explicit rejection of `.git` and `.github`. If hidden production files are intentionally supported, set `include-hidden-files: true`, explicitly reject sensitive VCS/config paths, and verify the packaged tar inventory against the receipt before exposing it for owner approval. Add an artifact/workflow test with a hidden `dist` file so a future action/config change cannot restore the mismatch.

Official action contract: <https://github.com/actions/upload-pages-artifact/blob/main/README.md#inputs->

**Remediation verdict:** Accepted. `scripts/check-artifact.mjs:49-59` now rejects any directory entry whose name starts with `.` before it can be traversed or added to the file inventory. Because `release-manifest.mjs:7` must pass `checkArtifact` before inventorying `dist`, every accepted receipt file is also eligible for the upload action's default archive. The chosen policy intentionally rejects hidden public paths; the current public contract does not promise `.nojekyll`, `.well-known`, or other hidden assets, and GitHub Pages Actions does not require `.nojekyll`.

`tests/artifact/site-artifact.test.ts:116-129` covers a top-level hidden file, nested hidden file, action-always-excluded `.github` directory, and `.well-known` directory. Each mutation must fail with `Hidden artifact path`, then is removed so the existing canonical/fragment/stale/fixture checks continue in the same built artifact. This is meaningful negative-path coverage of both dotfiles and dot-directories.

The new `src/content/posts/gioi-thieu-cpm.md` is compatible with the published-content contract: its filename provides a stable lowercase ID, frontmatter supplies valid language/title/calendar date/description, the body is non-empty, and it contains no asset or URL edge. Its statements match implemented behavior: locale switches retain article language/content, home shows up to three posts, lists paginate by twelve, and the site is an Astro/GitHub Pages static repository workflow. It is genuine descriptive content rather than an acceptance fixture.

## Release gate state

The checked-in runbook snapshot predates live setup. The controller supplied newer read-only evidence during this review; these controls must not be weakened during remediation:

1. `docs/publishing-and-rollback.md:12-19,91-92` records the earlier state: no verified rollback branch or required reviewer. The controller now reports live verification of `pages-legacy-safe` at `65d7a15fbf756be6260d4a0363d0955b5bf0ef99` with a README-only tree, `github-pages` with sole reviewer `cuupham`, `prevent_self_review=false`, and a main-only custom policy. Pages intentionally remains legacy. Keep the source-switch-before-merge sequence in lines 51-63; refresh and retain the provider receipts immediately before mutation.
2. The current deploy workflow intentionally fails closed: `.github/workflows/deploy.yml:21` requires the release flag; lines 45-59 require a main ancestor/current SHA and exactly one owner user reviewer; lines 131-136 put the privileged job behind `github-pages` with non-cancelling serialization. The `actions: read` permission used by environment, workflow-run, and artifact reads matches GitHub's documented API permission; the deploy job's `pages: write` covers the Pages-site read and deployment action. No additional token scope is warranted.

## Verified boundaries

- `.github/workflows/check.yml:2-7,16-31`: only pull-request/main-push verification, `contents: read`, no `pull_request_target`, credentials not persisted, and no deploy permission.
- `.github/workflows/deploy.yml:29-33,71-93`: checkout is pinned to the authorized SHA; persisted credentials are disabled; the checkout SHA and clean Git state are checked before the receipt is written.
- `.github/workflows/deploy.yml:123-182`: deploy does not checkout or execute repository source, revalidates same-run artifact ID/digest, Pages Actions source, release main SHA, and latest dispatch intent before `deploy-pages`.
- `src/lib/content-source.ts:6-39` and `src/content.config.ts:9-29`: production loading is restricted to flat `.md`/`.mdx` files under `src/content/posts`; `drafts/` is outside the loader.
- `src/lib/asset-graph.ts:22-53,75-166`: referenced local assets are constrained to approved roots with symlink/realpath checks; draft paths cannot enter through content edges.
- `scripts/check-artifact.mjs:44-77`: artifact traversal rejects symlinks, forbidden source directories/extensions, fixture IDs/markers in production HTML, draft sentinel content, unexpected HTML routes, and stale/missing routes. `scripts/release-manifest.mjs:7-12` independently refuses fixture workspaces, dirty release checkouts, and SHA/run-ID mismatches.
- `docs/publishing-and-rollback.md:67-90`: release and rollback both rebuild an accepted target, require owner approval of the new artifact, share serialized non-cancelling deployment intent, and recheck live intent after approval.

## Review limits

- This reviewer did not independently inspect the live GitHub environment, Pages source, rollback branch, Actions variable, pending approval, or deployed artifact. The controller's live evidence above closes the rollback/environment setup gap for coordination purposes, but provider receipts still require refresh immediately before mutation.
- No workflow dispatch or controlled rollback/concurrency rehearsal was performed. Static review cannot prove environment approval behavior, queue behavior, or live Pages HTTP results.
- Revision `64e2bbf` contains no posts; the reviewed working tree adds one genuine introductory post. This reviewer did not build it. The real publish/remove lifecycle and performance budget remain pending by the accepted owner decision; fixture evidence must not be promoted as live content evidence.

## Unresolved questions

- Does the tester's targeted artifact run, followed by the required full `npm run verify`, pass on the exact remediated tree?
- Will the release operator preserve evidence of the already verified rollback ref/tree, Pages legacy state, environment reviewer/self-review policy, and main-only branch policy in the first-migration receipt before changing Pages source?
