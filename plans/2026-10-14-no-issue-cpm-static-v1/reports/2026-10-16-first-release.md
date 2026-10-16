# CPM — First release receipt

Stateful evidence on 2026-10-16 (Asia/Bangkok). The exact first-release artifact was owner-approved and deployed successfully. Overall v1 acceptance remains pending until the authorized article removal is deployed and verified.

## Source and migration

- Owner requested completion and delegated genuine content handling. Added the factual CPM introduction in `2bd9384`, with no public fixture or invented personal claims; its publish/remove lifecycle is authorized but has not run.
- Independent review discovered hidden output could be listed in the receipt but omitted by Pages upload. Regression failed before the fix; `8b37a6c` rejects every hidden path segment. Targeted regression passed afterward. See [review](2026-10-16-release-review.md).
- Re-GET verified `pages-legacy-safe` at `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`, with a tree containing only README. Owner has administration rights.
- `github-pages` has exactly one required reviewer (the owner), `prevent_self_review=false` for the single-owner repository, and one custom deployment policy for branch `main`. Repository and environment secrets were both zero at preparation.
- Pages `build_type=workflow` was confirmed before [PR #1](https://github.com/cuupham/cuupham.github.io/pull/1) was marked ready and squash merged. Main is `57db88e69b68315763e54bcf663cfc051be86f31`; its tree is identical to reviewed head `e92549c` (`git diff --exit-code HEAD origin/main` passed).
- [PR CI](https://github.com/cuupham/cuupham.github.io/actions/runs/38832186907) and [post-merge CI](https://github.com/cuupham/cuupham.github.io/actions/runs/38832348016) passed. Post-merge CI passed 98 tests with zero skips. See [test report](2026-10-16-release-tests.md).
- `CPM_PAGES_RELEASE_ENABLED=true` was set, then release was dispatched on trusted main with the exact SHA and `mode=release`. Auto-deploy remains disabled.

## Exact uploaded artifact

[Release run 38832467016](https://github.com/cuupham/cuupham.github.io/actions/runs/38832467016) has successful authorize/build jobs and a successful protected deploy job.

| Receipt field | Verified value |
|---|---|
| Source SHA | `57db88e69b68315763e54bcf663cfc051be86f31` |
| Pages artifact ID | `12017767426` |
| Pages artifact digest | `sha256:0d2bbc63402dab68d76b914443fca73e4ddc25e614e607e4a65e076fbdf4bcd7` |
| Inventory SHA-256 | `441e51fbc2c7a3cd2918796656313667ab5f0fd12dbdf5e7a7ac341513a6f028` |
| Receipt artifact ID | `12018330830` |
| Inventory | 20 files, 8 HTML, 1,254,122 uncompressed bytes |

Downloaded the receipt and exact Pages upload. Compared the tar inventory with the receipt, rejected unsafe paths or special entries before extraction, and checked every extracted file's length and SHA-256. All matched. The reviewer-facing screenshot was rendered from this downloaded artifact, not from a rebuilt working tree.

The protected environment reported `current_user_can_approve=true` for the owner. The owner explicitly approved the exact SHA/artifact/digest, and protected deployment succeeded as deployment `7108166463` at `01:04:05Z`.

Live acceptance evidence for the deployed site is recorded in [live-acceptance](./2026-10-16-live-acceptance.md).

## Remaining acceptance

- Complete the authorized real article removal in a separate reviewed source change and exact-artifact release, then verify former list/detail routes return 404.
- The first live root/VI/EN/list/detail/404/SEO, responsive/keyboard/no-JS, language-preservation and performance observations are recorded in [live-acceptance](./2026-10-16-live-acceptance.md).
- User delegated the numeric choice to best practice 2026; the accepted lab budget and method are recorded in [live-acceptance](./2026-10-16-live-acceptance.md). This remains a lab budget, not a field/Core Web Vitals claim.
- Keep overall v1 in progress until the required live evidence exists.

## Temporary process

The exact downloaded artifact was previewed with `python -u -m http.server 4321 --bind 127.0.0.1 --directory <OS-temp release root>/site`, exec session `24008`, listener PID `37164`, outside the repository worktree. The server was stopped and port release was verified. No dev server was started from a second checkout.
