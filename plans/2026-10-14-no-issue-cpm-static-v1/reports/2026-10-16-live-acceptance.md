# CPM — Live acceptance ngày 2026-10-16

Đây là stateful evidence cho first release trên Pages, timezone Asia/Bangkok. First release đã deploy thành công; overall v1 vẫn `in-progress` vì lifecycle gỡ bài và deploy thứ hai chưa hoàn tất.

## Accepted source, artifact và deployment

- Pages source là GitHub Actions trước khi PR #1 được merge. Main accepted SHA là `57db88e69b68315763e54bcf663cfc051be86f31`; post-merge CI [run 38832348016](https://github.com/cuupham/cuupham.github.io/actions/runs/38832348016) pass 98 tests, zero skips.
- Release [run 38832467016](https://github.com/cuupham/cuupham.github.io/actions/runs/38832467016) build thành công archive 20 files, 8 HTML, 1,254,122 bytes.
- Exact Pages artifact ID `12017767426`, digest `sha256:0d2bbc63402dab68d76b914443fca73e4ddc25e614e607e4a65e076fbdf4bcd7`. Owner approved this exact artifact before protected deployment. Downloaded archive, receipt, inventory, per-file lengths and SHA-256 matched.
- Deployment `7108166463` succeeded at `01:04:05Z`. Environment remains owner-only with branch policy restricted to `main`; auto-deploy remains disabled.
- A no-store fetch of all 20 receipt paths from Pages returned HTTP 200 for each path; response bytes and SHA-256 matched the receipt for every file, with zero mismatches.

## Live routes and content behavior

BrowserOS live checks at `https://cuupham.github.io/` verified:

- `/` returns HTTP 200 HTML meta redirect with `/vi/` anchor, `noindex`, and canonical `/vi/`.
- VI/EN home, list, and detail routes return 200 with correct `htmlLang`, canonical, and reciprocal hreflang. The article keeps `lang=vi` and identical prose under EN UI.
- Native select preserves the real Unicode heading fragment. With JS disabled, reload/select and fallback EN→VI detail links preserve the real route context; JS was restored afterward.
- `/content/`, `/vi/content/page/1/`, `/missing-cpm-route/`, `/docs/prd.md`, and `/drafts/posts/private.md` return custom 404 responses with `noindex` and no canonical.
- Thirty-six viewport combinations across VI/EN home, list, and detail at 375×812, 768×1024, 1440×900, 812×375, 1024×768, and 900×1440 had one h1, no overflow, no broken images, and no pending images. Keyboard checks recorded 8 Tab stops with visible focus outlines.

## Performance evidence

The Pages mobile profile used 375×812, CPU 4× slowdown, 150 ms latency, 200000 B/s down, 75000 B/s up, cache disabled with the existing profile/font cache. Across three samples, LCP was 824/588/592 ms and navigation 2834/2891/2771 ms; same-origin decoded bytes were 224,914, transfer bytes 208,888, and 7 requests per sample. Google Fonts traffic was excluded.

These are repeatable lab observations, not field percentiles, Lighthouse results, cold-font results, or a device/accessibility certification. After the user delegated the budget choice to best practice 2026, the accepted lab budget is same-origin decoded bytes ≤300,000 and median lab LCP ≤2,500 ms under the same conditions. This does not claim a field/Core Web Vitals p75 budget.

## Remaining acceptance

- The authorized source change removing the genuine CPM introduction is staged on the lifecycle branch. A second exact-artifact approval/deploy is required before claiming removal live.
- After that deploy, verify former article list/detail routes return 404 and refresh the live route, then record the second deployment and post-removal checks.
- No true-device, screen-reader/full-WCAG, fork-run, concurrency rehearsal, or live rollback rehearsal evidence is claimed here.
- Overall plan and Phase 4 remain `in-progress`; v1 is not yet called accepted.

The earlier preparation snapshot is preserved in [release-preparation](./2026-10-16-release-preparation.md), and the full artifact receipt is in [first-release](./2026-10-16-first-release.md).
