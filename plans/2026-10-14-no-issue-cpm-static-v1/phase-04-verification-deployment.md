---
phase: 4
title: "Nghiệm thu và chuyển Pages sang Actions"
status: in-progress
priority: P2
effort: 10h
dependencies: [3]
---

# Phase 4: Nghiệm thu và chuyển Pages sang Actions

## Mục tiêu

Chứng minh acceptance matrix local và trong PR job không đặc quyền, xin owner duyệt provider/source change, migrate legacy branch Pages sang Actions không pass-through leak, rồi verify live routes/rollback. Snapshot ngày 2026-10-14 ghi Pages legacy `main` root và chưa có custom 404; phải refresh trước mutation ([research](./research/repository-and-official-docs.md)).

## Context

- [PRD hiện hành](../../docs/prd.md)
- [Research repository và official docs](./research/repository-and-official-docs.md)
- [Red-team decisions](../reports/2026-10-14-prd-validation-red-team.md)

## Files to create / modify

- Create `D:/repo-cuu/cuupham.github.io/.github/workflows/check.yml` — untrusted PR/push build on GitHub-hosted runner, read-only.
- Create `D:/repo-cuu/cuupham.github.io/.github/workflows/deploy.yml` — accepted-main-only Pages build/upload/deploy with split privilege.
- Create `D:/repo-cuu/cuupham.github.io/tests/acceptance/acceptance-matrix.md` — verified/pending evidence, commands, live URLs.
- Create `D:/repo-cuu/cuupham.github.io/tests/acceptance/browserclaw-checklist.md` — keyboard/no-JS/responsive/accessibility/performance record.
- Create `D:/repo-cuu/cuupham.github.io/docs/publishing-and-rollback.md` — owner workflow, source migration, snapshot, rollback.
- Create `D:/repo-cuu/cuupham.github.io/scripts/preview-acceptance.mjs`; modify `D:/repo-cuu/cuupham.github.io/package.json` — `preview:acceptance` chỉ serve temp artifact đã validate, ghi PID/port/root và không có SPA fallback trả 200 cho missing route.
- Modify `D:/repo-cuu/cuupham.github.io/README.md` only to link final verified authoring/check/publishing docs.

## Ordered migration và security design

1. **Preflight/snapshot:** refresh Pages config, rules, workflows, deployment history và branch state. Record exact live SHA/source/path/URLs và artifact nếu lấy được. Resolve hoặc chuẩn bị một **exact rollback ref** trỏ tree tốt đã biết, kiểm tra tree không có app/drafts/mock/docs pass-through; ref phải tồn tại remote và operator có quyền khôi phục trước source switch. Nếu chưa có rollback target được verify, không switch. Việc tạo remote rollback ref cần nằm trong publish scope owner đã duyệt.
2. **Keep pass-through off legacy main:** while Pages source is legacy main root, do not merge Astro app, `drafts/`, mock, plans or docs that could become public. Owner reviews source-change sequence and first release artifact.
3. **PR validation only:** `pull_request` trên GitHub-hosted runner, job `permissions: { contents: read }`, checkout `persist-credentials: false`; không secrets/Pages/OIDC/deploy environment hoặc token truyền vào scripts. Trước chạy contributor code xác nhận Git config không lưu auth header/helper. `npm ci` → `npm run verify` (check + unit + isolated artifact tests + clean production build). Không `pull_request_target`, không privileged `workflow_run` chạy/deploy PR source hoặc PR artifact. Nếu repo/org secrets có thể truy cập từ unaccepted PR, dừng publish setup để owner xử lý boundary; không tự đổi provider.
4. **Owner-approved switch và first release:** owner review source SHA/artifact inventory/rollback target trước switch. Workflow initial state **chỉ `workflow_dispatch`**, không push deploy trigger; guard workflow ref `refs/heads/main`, input approved SHA được resolve immutable và verify thuộc accepted main. Checkout/build đúng SHA đó, ghi run ID + SHA + artifact inventory/digest để owner approve chính artifact sẽ deploy. Confirm Pages Actions rồi mới merge workflow/site; merge không được tự deploy. Push auto-deploy chỉ bật bằng thay đổi owner duyệt riêng sau khi required PR/check protection hoặc owner-only environment approval được chứng minh. Không có enforcement thì giữ manual owner-approved release; không tự đổi provider controls.
5. **Deploy privilege split/order:** read-only build chạy `npm ci` + `npm run verify` trên intended SHA; upload đúng production `dist/` cùng run. Deploy job `needs` verified build, chỉ job này có `pages: write`, `id-token: write`, `github-pages` environment. Chỉ stale **check/build** có thể cancel. Privileged Pages deploy group chung serialize với `cancel-in-progress: false`; rollback vào cùng group, không hủy deployment đang chạy. Không giả FIFO pending jobs: revalidate approved intent + SHA + artifact khi job được chạy; ordinary stale release bị skip. Khi rollback, tạm ngừng auto promotion theo runbook owner đã duyệt, ghi target rollback SHA riêng và kiểm tra live deployment trước resume. Hậu kiểm deployment SHA/artifact khớp accepted run; không báo cancelled/superseded run thành công. Pin reviewed action SHAs; không dùng runner/artifact đã chạy untrusted PR source để deploy privileged.
6. **Live acceptance:** root trả 200 HTML redirect + anchor `/vi/`; `/vi/` và `/en/` mở trực tiếp/refresh đúng UI. List/detail/pagination đều có prefix; root `/content/*` không tồn tại. Real lifecycle chỉ với nội dung thật owner cho phép: thêm → deploy accepted → verify hai locale wrappers/list/detail → gỡ → clean deploy → detail cũ và, khi gỡ bài cuối, hai locale list trả 404. Mở external actions kiểm tra đích thật.
7. **Rollback:** first release có workflow parse/build/upload/deploy failure hoặc smoke failure thì không retry mutation mù; giữ site cũ nếu chưa thay deployment, hoặc dùng exact safe legacy ref đã chuẩn bị ở bước 1 để restore source sau owner approval. Runbook ghi lệnh với SHA/ref đã resolve, trigger và operator; không dùng placeholder làm bằng chứng recoverable. Với các Actions release sau, workflow từ trusted `main` có thể build một known-good reviewed SHA được owner chọn, vẫn verify artifact và chỉ nhận deploy approval từ main workflow. Rollback là thao tác có chủ đích, ghi override intended SHA để không bị nhầm là deploy run cũ ngoài thứ tự. Không trỏ legacy Pages vào main đã chứa drafts/app.

## Acceptance matrix

| Layer | Required evidence |
|---|---|
| Unit/content | invalid/valid matrices, collision-before-loader, date/order, 3/12 pagination, locale parity, URL and asset graph |
| Artifact | zero/draft-only/1/13/remove-last clean builds; route/SEO/404/draft-asset assertions |
| BrowserClaw | home/list/detail at 375/768/1440 + landscape; keyboard/focus/native select; JS disabled; reduced motion; two hero faces/desktop feet |
| Accessibility | headings/landmarks/names/focus; text 4.5:1, large text 3:1; method and failures recorded |
| Performance | actual page/image bytes, timings and LCP candidate with viewport/device/network/tool; no invented pass budget |
| PR security | fork/untrusted-equivalent job has no secret/deploy write; no privileged follow-up executes source |
| Live | provider says Actions; fresh accepted-main deploy; refresh/404/status/SEO; authorized real add/remove or explicit pending |

After baseline, propose bytes/LCP budget to owner. It becomes blocking only after owner agreement; until then report measurement/regression, not a fabricated pass.

## Tasks

1. Write workflows/runbook; validate syntax, permissions and action SHAs against current official docs.
2. Run clean install + `verify`; release từ clean checkout của approved SHA, gồm đủ assets/source đã review. Không stage/deploy các dirty/untracked file không liên quan hoặc chưa review của user.
3. Dùng `npm run acceptance:fixture` cho BrowserClaw list/detail khi production zero-content; chỉ serve output temp có sentinel, không copy vào production dist. Sau browser review chạy lại `npm run verify`, upload path cố định production `dist/` và assert không fixture sentinel/ID.
4. Capture accessibility/performance baseline and request owner decision on numeric budget.
5. Run read-only PR workflow; inspect actual permissions/logs/artifact. Green proves only commands executed.
6. Ask owner separately for Pages source change/publication; follow ordered migration, never mutate provider during planning.
7. Run live acceptance. Without genuine content/authorization, mark lifecycle `PENDING — requires owner content/approval` and do not mark v1 accepted.

## Verification

- Commands to **create**: `npm ci`, `npm run build`, `npm run test:unit`, `npm run test:artifact`; choose workflow lint during implementation.
- Release-blocking local/PR/build command là `npm ci` rồi `npm run verify`; cố tình làm một unit test fail trong sandbox phải khiến required PR job fail dù build riêng vẫn pass. Workflow syntax/permissions/action SHA được kiểm tra bằng công cụ hiện có lúc implement.
- Initial workflow test: không có push-triggered deploy; dispatch ở ref khác main bị guard reject; checkout mismatch với approved SHA phải fail. Recorded SHA + production artifact digest/inventory được approve phải đúng artifact chuyển sang deploy, không rebuild/replace âm thầm sau approval.
- Concurrency/rollback test hoặc controlled workflow rehearsal: stale pre-deploy build có thể bị cancel; đang deploy/rollback không bị run mới cancel. Job queued phải kiểm tra intent mới, không dựa vào thứ tự queue. Provider rehearsal chỉ chạy trong publish scope owner duyệt; trước đó kiểm tra workflow contract, không giả đã live test.
- Browser acceptance uses MCP BrowserClaw only; no Playwright/Chrome DevTools.
- Trước start server kiểm tra port 4321 bằng `netstat -ano`, đối chiếu command/root của PID. Chỉ reuse process đúng project/run; không kill process khác hoặc tăng port để né collision. Tạo script `preview:acceptance` serve đúng temp fixture root đã validate, host `127.0.0.1`, port 4321; production dùng `npm run preview -- --host 127.0.0.1 --port 4321` sau khi stop fixture server. Ghi command/PID/port/worktree/session; terminate clean process mình start và verify port released khi xong.
- Nếu BrowserClaw chưa được expose, resolve live installed capability; không giả browser result hoặc tự đổi sang tool bị loại. Ghi phần browser còn pending nếu capability chưa dùng được.
- Verify live HTTP/source settings after propagation; do not infer 404 from preview.
- Failed build must retain previous site (PRD mục 9 và tiêu chí nghiệm thu mục 10); xác minh last-successful deployment, không suy từ job status đơn lẻ.

## Risks và rollback

- **High × high — legacy main publishes repo/mock/drafts:** block merge until owner-approved Actions source confirmed; never place them incrementally on legacy deployment branch.
- **High × high — untrusted PR gains deploy:** read-only GH-hosted PR, no secrets/Pages/OIDC, no pull_request_target/privileged workflow_run source execution.
- **High × medium — deletion claimed without real lifecycle:** require genuine owner-authorized content and two deploys; otherwise pending/no v1 acceptance.
- **Medium × high — switch strands site:** snapshot config/artifact/commit, manually review first artifact, preserve known-good deploy path.
- **Medium × medium — budget guessed:** measure first, owner approves threshold.
- Rollback uses step 7 design; document restored state and rerun live route/security checks.

## Success criteria

- [x] Local and unprivileged PR gates pass through same non-bypassable build path.
- [x] Fixture artifact không thể vào upload; deploy ordering và intended/live SHA khớp; unit failure chặn required check.
- [x] Exact rollback ref/source đã verify trước first switch; first artifact approval và accepted-source enforcement có bằng chứng.
- [x] BrowserOS live route/keyboard/no-JS/responsive/performance evidence complete within accepted scope; lab budget được owner ủy quyền chọn, không suy ra field/Core Web Vitals pass.
- [x] Owner-approved Actions source + accepted-main deploy produce clean live artifact; previous state recoverable.
- [ ] Real add/remove lifecycle passes live, or stays explicitly pending and overall v1 is not called accepted.

## Current status — 2026-10-16

Latest: Pages đã chuyển sang Actions trước merge PR #1, post-merge CI trên main `57db88e` pass 98 tests/zero skips. Release run `38832467016` built artifact `12017767426`; owner duyệt đúng digest và deployment `7108166463` success. BrowserOS live acceptance và performance evidence đã ghi nhận; xem [first-release receipt](./reports/2026-10-16-first-release.md) và [live-acceptance receipt](./reports/2026-10-16-live-acceptance.md). Phần historical bên dưới là snapshot chuẩn bị trước source switch.

Phase 4 đang tiếp tục vì source change đã staging để gỡ bài thật và cần artifact approval/deploy/hậu kiểm lần hai. Rollback ref, owner-only environment, Actions source, accepted-main artifact approval, deployment and first live acceptance đã được xác minh. Xem [live-acceptance receipt](./reports/2026-10-16-live-acceptance.md) cho route/browser/performance evidence.

## Historical local progress — 2026-10-15

Snapshot lịch sử dưới đây được ghi nhận trước các thay đổi provider ngày 2026-10-16 và đã được supersede bởi [current status](#current-status--2026-10-16).

Đã viết check/deploy workflows, artifact receipt guard, acceptance scripts và
[publishing/rollback runbook](../../docs/publishing-and-rollback.md). `npm ci`, final `npm run verify`,
actionlint 1.7.12, Bash syntax và embedded Python parse đã pass. Browser evidence và một mẫu baseline local
được ghi tại [acceptance matrix](../../tests/acceptance/acceptance-matrix.md).
Owner trả lời **“Chờ số đo Pages live rồi mới chốt budget”**; không áp pass budget từ số local.

Read-only snapshot: Pages legacy main/root, live/main SHA `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`;
remote tree chỉ README. Secrets API 403; github-pages environment chưa có required reviewer.
Workflow mới fail closed khi thiếu owner enforcement. Chưa có remote rollback branch được verify,
chưa push/PR/chạy CI thật, chưa owner-approved source switch/deployment hoặc live lifecycle.
Vì các điều kiện trên, Phase 4 và overall v1 vẫn chưa nghiệm thu hoàn tất.

## PR verification — 2026-10-15

Owner đã cho phép commit/push nhánh và tạo PR. [PR #1](https://github.com/cuupham/cuupham.github.io/pull/1)
giữ draft, chưa merge. [Check CPM run 38713942819](https://github.com/cuupham/cuupham.github.io/actions/runs/38713942819)
trên commit `0d75b819cc7fcd9f1119ae199d8464a4f6ba1e18` pass: npm ci audit 0, check 0 diagnostics,
94 unit + 4 artifact/workflow tests pass, không skip; production artifact 4 HTML/16 files.
Ubuntu runner log xác nhận GITHUB_TOKEN chỉ Contents/Metadata read; checkout persisted-auth assertion pass.

Đọc API bằng owner credential xác nhận repository/environment secrets = 0; owner type User nên không có
organization secrets kế thừa. 403 cũ do account `gh` không có quyền repo. Account mặc định không bị đổi.
Đây là same-repository PR run, chưa phải fork execution rehearsal. Deploy ordering/provider/live lifecycle vẫn pending.
