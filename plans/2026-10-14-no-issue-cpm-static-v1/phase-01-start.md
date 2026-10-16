---
phase: 1
title: "Chốt hợp đồng và mock review"
status: completed
priority: P2
effort: 5h
dependencies: []
---

# Phase 1: Chốt hợp đồng và mock review

## Mục tiêu và gate

Viết hợp đồng kỹ thuật đề xuất, dựng HTML mock list/detail/mobile kế thừa home đã duyệt, rồi lấy owner review hình ảnh và các chi tiết kỹ thuật trước production UI. Các policy review đã duyệt là đầu vào; exact field/routes vẫn cần thể hiện trong contract cụ thể (`docs/prd.md:219`, `docs/prd.md:301`).

## Context

- [PRD hiện hành](../../docs/prd.md)
- [Mock README](../../mockups/cpm-portfolio/README.md)
- [Mock B đã chọn](../../mockups/cpm-portfolio/champagne/home-mobile.html)
- [Research direction](./research/repository-and-official-docs.md)
- [Hợp đồng cụ thể để review](../../docs/cpm-v1-technical-contract.md)
- [Artifact và kết quả kiểm tra Phase 1](./reports/phase-01-mock-verification.md)

## Files to create / modify

- Create `D:/repo-cuu/cuupham.github.io/docs/cpm-v1-technical-contract.md` — proposal routes, schema, date, SEO, validation và ownership.
- Create `D:/repo-cuu/cuupham.github.io/mockups/cpm-portfolio/content-list.html` — list/pagination review-only.
- Create `D:/repo-cuu/cuupham.github.io/mockups/cpm-portfolio/content-detail.html` — article/media/action review-only.
- Create `D:/repo-cuu/cuupham.github.io/mockups/cpm-portfolio/home-mobile.html` — explicit mobile/tablet home crop review with existing hero artwork/copy.
- Create `D:/repo-cuu/cuupham.github.io/mockups/cpm-portfolio/review.css` — list/detail + 375/768/1440/landscape states.
- Modify `D:/repo-cuu/cuupham.github.io/mockups/cpm-portfolio/README.md` — label fixtures non-production và review instructions.
- Reuse unchanged `D:/repo-cuu/cuupham.github.io/mockups/cpm-portfolio/shared/tokens.css`, `D:/repo-cuu/cuupham.github.io/mockups/cpm-portfolio/shared/components.css` và ba artwork sources; mock đã có native select styling fallback và SSOT, nhưng chưa chứng minh no-JS route navigation (`mockups/cpm-portfolio/README.md:4`, `mockups/cpm-portfolio/README.md:13`).

Các file review đi kèm đã tạo: `review.js`, `generate-review.py`, `content-list-page-2.html`,
`content-detail-sample-2.html` đến `content-detail-sample-13.html` và counterpart HTML dưới `en/`.
Chúng giúp kiểm tra links/context bằng HTML thật khi tắt JS; tất cả là review-only, không thêm input production.
Generator là nguồn chung cho 32 trang, không cần chạy để mở mock. Home gốc và shared files không bị sửa.

## Quyết định đã được owner xác nhận

- Home hiển thị tối đa 3 bài mới nhất.
- Danh sách có 12 bài/trang và phân trang static.
- Validation log phải giữ nguyên câu hỏi: “Trong plan, mình đề xuất home hiện tối đa 3 bài mới và danh sách có 12 bài/trang với phân trang static. Bạn muốn dùng cách nào?”
  - Lựa chọn 1: “Giữ 3 bài mới và 12 bài/trang (đề xuất)”.
  - Lựa chọn 2: “Home hiện 1 bài mới; danh sách hiển thị tất cả, không phân trang”.
  - Owner trả lời: “Giữ 3 bài mới và 12 bài/trang (đề xuất)”.

## Hợp đồng chi tiết và trạng thái duyệt

1. **Routes — owner đã chốt tại validation 2026-10-15:** prefix cả VI và EN. Home `/vi/`, `/en/`; list `/<locale>/content/`; detail `/<locale>/content/<id>/`; page 2+ `/<locale>/content/page/<n>/`. Reserve ID `page`; không emit page-1 alias hoặc root `/content/*`. `/` chỉ là HTML redirect về `/vi/` với anchor thật khi không dùng JS. Trên Pages root này trả HTTP 200, không claim 301/302; root `noindex`, canonical `/vi/`, không locale alternates. Hai locale home vẫn indexable.
2. **Stable ID/date:** filename stem theo ASCII `^[a-z0-9]+(?:-[a-z0-9]+)*$`, không silent lowercase/Unicode normalization, unique trên raw md/mdx; reject symlink/non-regular file và frontmatter `slug`. Strict calendar-valid `YYYY-MM-DD`; dùng UTC cho compare/format để ngày không shift; date giảm dần rồi ASCII ID tăng dần. Future date vẫn hiện sau deploy, không scheduler.
3. **Schema:** required `language`, non-empty `title`, `publishedAt`, non-empty body; ID lấy từ filename. Optional `description`, `updatedAt`, `cover`, `gallery[]`, `media[]`, `actions[]`, `platform`, `version`.
   - `cover` và phần tử `gallery[]` dùng chung shape `{ image: local image, alt: non-empty string, caption?: string }`; ảnh nội dung có alt do tác giả cung cấp, artwork trang trí dùng alt rỗng rõ chủ ý.
   - `media[]`: local `{ kind: video|audio, src, title, poster?, caption? }` hoặc external `{ kind: embed, url: HTTPS, title }`. Đường dẫn source tương đối với file bài, resolve trong `src/assets/`; resolver chung sinh ESM asset imports cho Vite, không render source path thô. Poster đi qua image pipeline. Embed chỉ tải sau thao tác người đọc và có link nguồn khi chưa tải.
   - `actions[]`: `{ kind?: experience|download, label: non-empty, href: HTTPS-or-root-relative }`; chỉ label/href bắt buộc, thiếu kind vẫn là link có nhãn thật; không tự download.
4. **Source boundary:** published `src/content/posts/<id>.md|mdx`; drafts `drafts/posts/`; draft-only assets `drafts/assets/`; published/shared assets dưới `src/assets/`; `public/` luôn public, không chứa draft.
5. **SEO — repair mới đã được owner duyệt:** home/list self-canonical và alternates tới route locale thật. Detail wrappers dùng shared canonical `/vi/content/<id>/` và reciprocal absolute `hreflang` cho mọi UI locale có wrapper thật, gồm chính trang hiện tại. Đây là localized UI wrappers, không phải bản dịch bài; article language/title/body giữ nguyên. Root redirect zero alternates; `404.html` noindex, zero canonical/alternate.
6. **No-JS locale:** native select điều hướng khi JS có; fallback anchors trỏ route thật, giữ ID/page context khi JS tắt.

## Chỉnh sửa review đã được owner duyệt

<!-- Updated: Validation Session 2 - approved review contracts -->

- Markdown raw HTML được escape thành text; fenced code vẫn là code. Rich HTML/component dùng MDX được owner review như code. Không xem MDX là sandbox.
- `language` là BCP-47 hợp lệ, độc lập UI registry; canonicalize khi có representation chuẩn. Label dùng display name theo UI locale, fallback mã đã validate nếu API không hỗ trợ; không loại mã hợp lệ chỉ vì `Intl` thiếu display name.
- UI registry có đúng một default, segment unique, không đụng `content`, `404` hoặc asset namespace; dictionaries đủ key. Thêm locale thứ ba phải sinh route qua cùng registry, không sửa từng template.
- Internal URL parse theo site origin; reject network-path, credential, raw/decoded backslash/control và assert exact origin trước emit path/query/hash. External action, body link và embed/source URL dùng cùng validator HTTPS, không userinfo/control/backslash và serialize từ kết quả parse; không có scheme-only check riêng cho embed.
- Indexable home/list/detail có một canonical phù hợp; custom 404 có zero canonical/alternate và `noindex`.
- Publish cần chứng minh owner đã chấp nhận source/artifact; push vào `main` đơn thuần không được coi là bằng chứng review. Provider settings chỉ thay khi owner cho phép riêng.

<!-- Updated: Validation Session 3 - user selected prefixes for both VI and EN -->

Route prefix `/vi/` + `/en/` và reciprocal detail UI-locale hreflang đã được chốt; không hỏi lại ở gate mock. Date-only vẫn là proposal khi chưa có câu trả lời validation ngày. Xem [review lượt mới](./reports/2026-10-15-validation-red-team.md) cho quyết định sáu repair mới.

Chi tiết quyết định và phạm vi áp dụng nằm trong [review log](./reports/plan-review.md). Gate visual/mock vẫn cần review trên artifact cụ thể của Phase 1.

## Data flow và mock states

Fixture được ghi rõ mock-only: một card/article đủ field cộng các variant thiếu field tùy chọn → list/detail chỉ render dữ liệu có thật → đổi UI locale chỉ đổi labels, không đổi article title/body → mobile chứng minh hai mặt hero và copy/CTA không che nhau. Fixture không vào `src/content/posts/` hay deploy artifact.

## Tasks

1. Document proposals, reserved pagination routes, action/media validation, local asset ownership và canonical examples.
2. Dùng 3 latest/12 per page đã chốt trong mock; không thêm search/filter.
3. Kế thừa navy/cream; owner yêu cầu bỏ cyan và badge ngũ giác bọc CPM. Dùng wordmark chữ; owner đã chọn B champagne với heading/body ivory. Không marketplace copy, fake release, giant GitHub banner hay placeholder.
4. Cover optional missing/present, long Vietnamese title, gallery/media/action, content-language label, focus/hover/reduced-motion và required viewports.
5. Mở static mocks bằng BrowserClaw; kiểm tra native select, keyboard và no-JS anchors.
6. Lấy explicit owner approval hoặc sửa; record accepted deltas. Không bắt đầu Phase 2 khi gate mở.

## Verification

- Mock mở trực tiếp không server như contract hiện tại (`mockups/cpm-portfolio/README.md:1`).
- BrowserClaw ở 375/768/1440 và landscape; không Playwright/Chrome DevTools.
- Đối chiếu content/locale/SEO/assets với `docs/prd.md:76`, `docs/prd.md:160`, `docs/prd.md:169`, `docs/prd.md:288`.

## Risks và rollback

- **High × medium — production trước visual agreement:** hard-block Phase 2/3 UI đến khi owner duyệt.
- **Medium × high — proposal bị hiểu thành PRD approved:** label proposal, approval date/decision; PRD vẫn là product authority.
- **Medium × medium — mock fixture leak:** chỉ ở `mockups/`, label review-only, artifact check reject mock paths.
- Rollback: revert sáu Phase 1 files; chưa đổi production/provider/live site.

## Success criteria

- [x] Owner accepts list/detail/mobile visuals và exact technical contract.
- [x] 3 latest/12 per page xuất hiện đúng như quyết định owner; không có page-1 duplicate.
- [x] Route collision/canonical, nested shapes và asset rules được mô tả cụ thể trong technical contract; proposal ngày/excerpt vẫn chờ duyệt.
- [x] Không có public product/content claim mới.

## Current status — 2026-10-16

Phase 1 đã hoàn tất theo checklist và handoff: mock B và technical contract đã được owner chấp nhận, gate đã đóng. Các execution log bên dưới ghi lại trạng thái tại thời điểm từng lượt chạy.

## Execution log — 2026-10-15

User đã yêu cầu triển khai plan bằng `ak-cook`. Đã dựng artifact và thực hiện kiểm tra mock;
owner chưa review hình ảnh/hợp đồng cụ thể, nên gate vẫn mở và Phase 2 chưa bắt đầu.
Xem [báo cáo kiểm tra](./reports/phase-01-mock-verification.md) cho phạm vi đã chạy và phần chưa chứng minh.
Ngày date-only/UTC và quy tắc excerpt là proposal; không ghi thành quyết định owner từ yêu cầu triển khai chung.

Owner phản hồi cần chỉnh giao diện: “tôi không thích mày cyan, và hình ngũ giác bọc CPM hiện tại”.
Đã thay UI accent bằng lavender `#c8b5f5` để review và bỏ badge, giữ wordmark chữ.
Đồng bộ vào shared styles, home gốc, generator và các trang review; thay đổi này thay thế cam kết giữ nguyên các file đó
ở bước dựng mock ban đầu. Chưa ghi lavender là màu được owner duyệt; gate Phase 1 vẫn mở.

Theo yêu cầu tham khảo website rồi đối chiếu, đã lưu [nghiên cứu và đề xuất giao diện](./reports/2026-10-15-design-reference-comparison.md).
Các hướng palette/hierarchy/section order trong báo cáo là proposal, chưa sửa mock hoặc thay quyết định đã chốt từ lượt nghiên cứu này.

Owner đã yêu cầu: “ok sửa mock theo hướng đề xuất đi, làm 2 bản trung tính và nhấn champagne rồi mở browser neo cho tôi so sánh”.
Đã sửa generator/layout, thêm trạng thái home chưa có bài và tạo hai bản cùng nội dung/hình ảnh:
[A — Trung tính](../../mockups/cpm-portfolio/home-mobile.html), [B — Champagne](../../mockups/cpm-portfolio/champagne/home-mobile.html).
Latest chuyển ngay sau hero, phần giới thiệu gộp vào collection cream; list/detail gọn hơn.
Xem [báo cáo kiểm tra A/B](./reports/2026-10-15-neutral-champagne-mock-review.md).
Đây là quyền sửa mock để so sánh, không phải xác nhận palette/hình ảnh hoặc technical contract đã được duyệt; gate vẫn mở.

Sau đề xuất chọn B — nhấn champagne cho nút chính và chi tiết nhỏ, heading/body ivory — owner trả lời
“ok theo đề xuất”. Đã chốt hướng giao diện B ngày 2026-10-15. Giữ A để đối chiếu; không cần sửa lại
markup/CSS vì B đã thể hiện đúng đề xuất. Exact schema/source, date-only/UTC và excerpt còn chờ xác nhận;
checkbox tổng của gate Phase 1 vẫn mở, Phase 2 chưa bắt đầu.

Owner tiếp tục trả lời “Đồng ý hợp đồng đề xuất, tiếp tục Phase 2”, xác nhận schema/source/media/action,
date-only/UTC/tie-break và SEO excerpt 160 Unicode code points/fallback title. Gate Phase 1 đã đóng;
đã bắt đầu Phase 2. Các đoạn “chờ duyệt” ở execution log phía trên là lịch sử tại thời điểm ghi.
