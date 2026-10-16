# CPM v1 — Acceptance matrix

Ngày 2026-10-16. Đây là evidence record, không phải lời khẳng định toàn v1 đã nghiệm thu.
Hướng giao diện B và technical contract đã được owner duyệt. First release đã deploy bài thật CPM; source change gỡ bài và deploy lần hai vẫn pending.

| Phạm vi | Trạng thái / bằng chứng |
|---|---|
| Schema/source/date/URL/asset/locale | Unit pass; Windows file-symlink case skip do thiếu privilege, junction cases đã chạy |
| Loader và Markdown/MDX thật | Build sandbox dùng cùng config/scripts; original body/language được giữ |
| 0/draft-only/1/13/remove-last | Artifact build matrices pass; expected route sets literal độc lập production registry |
| 3 latest / 12 per page | DOM artifact asserts đúng 3/12/1, cùng ID/order giữa VI/EN |
| Locale thứ ba, ngôn ngữ bài ngoài UI | Fixture thêm FR registry sinh home/list/detail/page 2; bài JA giữ nguyên trong wrappers |
| Draft và asset còn dùng | Draft preflight negatives, private marker không emit; remove-last mất tone.wav và routes cũ, hero shared còn |
| Fragment/canonical/alternate/404 | Artifact gate kiểm tra từng HTML/local target; negative mutation/build cases fail đúng nguyên nhân |
| Fixture isolation | OS-temp marker + paths; production checker/release manifest reject fixture; release checkout phải clean |
| Verify fail propagation | Sandbox cố tình có unit fail: verify exit 1, không chạy artifact suite/final build; dist sentinel còn nguyên |
| CI workflow syntax/security contract | actionlint 1.7.12 pass (không shellcheck/pyflakes); Bash syntax + embedded Python parse pass; job permissions/trigger contract tests pass |
| PR/post-merge job thực | **Pass** — [post-merge run 38832348016](https://github.com/cuupham/cuupham.github.io/actions/runs/38832348016), 98 tests, zero skips; token boundary and checkout auth assertions pass |
| Secrets boundary tại thời điểm kiểm | Owner API: repository/environment secrets = 0; personal owner không có org secrets kế thừa; không phải fork-run proof |
| BrowserOS live | **Pass within accepted scope** — [live acceptance receipt](../../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-live-acceptance.md); route/404/refresh, responsive, keyboard and no-JS evidence recorded |
| Performance budget | **Pass within accepted lab scope** — owner delegated budget choice; same-origin decoded ≤300,000 bytes and median lab LCP ≤2,500 ms under recorded profile. No field/Core Web Vitals claim |
| Provider/source migration | **Pass** — Actions source confirmed before merge; accepted main `57db88e69b68315763e54bcf663cfc051be86f31` |
| Exact remote rollback branch/enforcement | **Pass for first release** — safe ref/tree, owner-only reviewer and main-only policy verified |
| Accepted-main SHA/artifact approval/deploy | **Pass for first release** — run `38832467016`, artifact `12017767426`, deployment `7108166463`; exact receipt/digest matched |
| Live routes/404/refresh | **Pass for first release** — live route, SEO, 404 and no-store all-20-file receipt checks recorded |
| Live thêm/gỡ bài thật | **Pending** — first release added genuine CPM intro; authorized removal change needs second approved artifact/deploy and former-route 404 proof |

Historical local baseline (2026-10-15), commands: `npm ci`, `npm run check`, `npm run test:unit`, `npm run test:artifact`,
`npm run build`; chuỗi cuối `npm run verify` bao gồm toàn bộ gate và build production cuối.
Chuỗi cuối `npm run verify` exit 0: check 0 errors/warnings/hints, unit 93 pass/1 privilege skip,
artifact/workflow 4 pass; production artifact 4 HTML/16 files. Actionlint trên workflow cuối exit 0.
Xem [báo cáo triển khai](../../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-15-phase-03-implementation.md).

First release receipt, exact artifact approval/deployment and live observations are recorded in [first-release](../../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-first-release.md) and [live acceptance](../../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-live-acceptance.md).
[Runbook](../../docs/publishing-and-rollback.md) ghi sequence có approval và rollback boundary. Overall v1 remains pending until the authorized removal release is live and verified.
