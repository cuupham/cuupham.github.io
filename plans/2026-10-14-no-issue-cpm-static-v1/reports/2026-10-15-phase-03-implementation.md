# CPM — Phase 3 và phần local Phase 4

Ngày 2026-10-15; branch `codex/anime-portfolio-concept`. Đây là bằng chứng local, chưa phải release/v1 acceptance.
Owner đã duyệt B champagne và technical contract; production source không có bài thật.

## Kết quả triển khai

- Port home/list/detail/mobile B: wordmark chữ, navy/ivory và champagne; hai nhân vật, responsive images,
  latest 3, list 12/page, conditional gallery/media/actions và đọc bài Markdown/MDX thật.
- Registry sinh VI/EN và locale bổ sung, giữ ID/order/body/ngôn ngữ bài; select native và no-JS anchors giữ route context.
  Shared canonical bài VI, reciprocal hreflang, root HTML redirect và useful noindex 404.
- Asset graph/manifests chỉ emit reachable assets; image dimensions/srcset, lazy below fold;
  Markdown raw HTML escaped, trusted MDX được review như code. Embed chỉ tạo iframe sau click.
- Build luôn preflight → clean output → Astro → artifact gate. Gate kiểm route/SEO/links/fragments,
  forbidden source/draft/fixture output và optional media semantics, kể cả khi gọi Astro trực tiếp.
- CI read-only checks; manual release workflow tách build/deploy privilege, ràng buộc SHA/run/artifact receipt,
  owner environment review và serialize release/rollback. Chưa chạy workflow này trên GitHub.

## Kiểm chứng đã chạy

`npm ci` exit 0, audit 0 vulnerabilities. Có npm warning esbuild postinstall chưa được allowScripts phê duyệt;
các build thực tế vẫn chạy thành công. Final `npm run verify` exit 0 lúc 16:26 giờ địa phương:

| Gate | Kết quả |
|---|---|
| Content + Astro check | 0 errors, 0 warnings, 0 hints |
| Unit | 93 passed, 1 skipped; file-symlink Windows thiếu privilege, parent junction cases đã chạy |
| Artifact/workflow | 4 passed; clean 0/draft-only/1/13/remove-last, locale FR, MD/MDX, negative build/mutation, unit-fail propagation |
| Production build | 4 HTML (root, VI, EN, 404), 16 files, 9 optimized artwork variants; không bài/fixture |
| Workflow lint | actionlint 1.7.12 exit 0 trên revision cuối; shellcheck/pyflakes không chạy |
| Script syntax | 10 Bash run steps và 3 embedded Python snippets parse pass |

BrowserOS neo: 36 tổ hợp home/list/detail VI/EN × 6 viewport; screenshot desktop/mobile kiểm đủ chân desktop,
cả hai mặt mobile và CTA. Native select/no-JS/keyboard/reduced motion, deferred embed và metadata/HTTP preview
được kiểm. Recheck revision cuối: 12 tổ hợp list VI/EN pass; thêm 12 tổ hợp zero-content home pass.
Xem [chi tiết browser](../../../tests/acceptance/browserclaw-checklist.md).

Mẫu local 375×812, CPU 4×, 150 ms/200 KB/s: 293.241 bytes nội bộ kể cả HTML, LCP 1.540 ms;
font cache ấm, một mẫu localhost, không phải Pages/cold-font/Lighthouse. Owner chọn **chờ Pages live mới chốt budget**.

## Review và giới hạn

Đã self-review public contracts, artifact boundaries, workflow permissions và fail paths bằng source/tests;
không có independent reviewer mới trong lượt triển khai này. Không coi static workflow tests là bằng chứng quyền CI thật.
Không có audio/video playback trên thiết bị thật, cross-engine/screen-reader/full WCAG audit hoặc live add/remove proof.

Read-only GitHub snapshot: Pages vẫn legacy main/root; main và latest successful legacy build cùng SHA
`65d7a15fbf756be6260d4a0363d0955b5bf0ef99`, remote tree chỉ README. Secrets API 403 nên boundary chưa chứng minh;
github-pages environment chưa required reviewer. Chưa có exact remote rollback branch được verify.
Xem [runbook](../../../docs/publishing-and-rollback.md) và [acceptance matrix](../../../tests/acceptance/acceptance-matrix.md).

Chưa commit/push/PR, bật release flag, sửa environment/Pages source hoặc deploy. Phase 4 giữ pending;
không merge app/drafts/mock/docs vào legacy main root trước source switch đã được owner duyệt.

## Resource record

Preview chạy tại `127.0.0.1:4321` từ repo `D:/repo-cuu/cuupham.github.io`, chỉ serve OS-temp artifact:
`node --import tsx scripts/preview-acceptance.mjs --root <exact-root>`.
Các PID đã dùng: 27956 (fixture cũ), 33672 (`cpm-contract-yD0gyN`, 13 bài), 6116 (`cpm-contract-QkcMf1`, 0 bài).
Đã gửi Ctrl-C để dừng từng server do lượt này tạo; kiểm tra port và cleanup temp được hoàn tất trước handoff.
Temp fixture có node_modules junction; cleanup unlink junction trước khi xóa đúng root đã tạo, không đụng dependency repo.
