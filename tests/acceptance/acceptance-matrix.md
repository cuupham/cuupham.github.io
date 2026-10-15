# CPM v1 — Acceptance matrix

Ngày 2026-10-15. Đây là evidence record, không phải lời khẳng định toàn v1 đã nghiệm thu.
Hướng giao diện B và technical contract đã được owner duyệt. Production không có bài thật.

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
| PR job thực | **Pending** — chưa push/PR; secrets API HTTP 403, chưa chứng minh repository/org-secret boundary |
| Browser local | Xem [BrowserOS checklist](browserclaw-checklist.md); không thay live HTTP/real-device proof |
| Performance budget | Owner chọn **chờ Pages live rồi chốt**; số đo local không có pass budget |
| Provider/source migration | **Pending approval** — vẫn legacy main/root; chưa merge app vào main |
| Exact remote rollback branch/enforcement | **Pending** — safe commit tree đã đọc; branch riêng, rights, protected environment chưa thiết lập/verify |
| Accepted-main SHA/artifact approval/deploy | **Pending** — source đang local dirty/untracked; không có immutable accepted release SHA hay run receipt thật |
| Live routes/404/refresh | **Pending** — chưa có CPM release trên Pages |
| Live thêm/gỡ bài thật | **Pending** — cần bài thật và owner cho phép publish/gỡ; không dùng fixture công khai thay thế |

Các lệnh chạy local: `npm ci`, `npm run check`, `npm run test:unit`, `npm run test:artifact`,
`npm run build`; chuỗi cuối `npm run verify` bao gồm toàn bộ gate và build production cuối.
Chuỗi cuối `npm run verify` exit 0: check 0 errors/warnings/hints, unit 93 pass/1 privilege skip,
artifact/workflow 4 pass; production artifact 4 HTML/16 files. Actionlint trên workflow cuối exit 0.
Xem [báo cáo triển khai](../../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-15-phase-03-implementation.md).

Không đổi provider, enable flag/environment, commit/push hoặc tạo deployment trong lượt local này.
[Runbook](../../docs/publishing-and-rollback.md) ghi sequence có approval và rollback boundary.
