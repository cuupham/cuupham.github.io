# CPM v1 — Hợp đồng kỹ thuật

**Ngày:** 2026-10-15. **Trạng thái:** Đã duyệt technical contract và hướng giao diện B champagne.

[PRD](prd.md) là nguồn yêu cầu sản phẩm. Source, scripts, workflows và release runbook là nguồn thực thi.
Tài liệu này cụ thể hóa các quyết định đã duyệt; việc duyệt hợp đồng không thay thế build, test hoặc deploy evidence.

## 1. Trạng thái quyết định

| Nội dung | Trạng thái |
|---|---|
| VI/EN cùng tập bài; ngôn ngữ bài độc lập UI | Đã duyệt |
| Prefix `/vi/`, `/en/`; home 3 bài mới, list 12 bài/trang | Đã duyệt |
| Quy tắc nháp, URL, MDX, raw HTML, SEO wrappers và source/artifact approval | Đã duyệt trong hợp đồng này và runbook |
| Tên field, đường dẫn nguồn và exact shape dưới đây | Đã duyệt ngày 2026-10-15 |
| Ngày chỉ nhận `YYYY-MM-DD`, UTC để so sánh/format, ID ASCII tăng dần khi cùng ngày | Đã duyệt ngày 2026-10-15 |
| SEO excerpt tối đa 160 Unicode code points từ prose thật, fallback title khi không có prose | Đã duyệt ngày 2026-10-15 |
| Hướng giao diện B champagne | Owner chọn ngày 2026-10-15; không thay thế nghiệm thu responsive production |
| Lab performance budget | Same-origin decoded ≤300,000 bytes và median lab LCP ≤2,500 ms dưới profile runbook; không phải field/Core Web Vitals p75 |

## 2. URL và context

Site đích `https://cuupham.github.io`, Astro static, `base: '/'`; không thêm tên repository vào base.
Locale registry có đúng một default `vi`; tất cả locale đều có prefix. Không tự đoán ngôn ngữ browser.

| Loại trang | VI | EN |
|---|---|---|
| Home | `/vi/` | `/en/` |
| List trang 1 | `/vi/content/` | `/en/content/` |
| List trang 2+ | `/vi/content/page/2/` | `/en/content/page/2/` |
| Detail có ID `example-entry` | `/vi/content/example-entry/` | `/en/content/example-entry/` |

- `/` là HTML redirect về `/vi/`, có anchor thật; HTTP 200 trên Pages, không gọi là 301/302.
- Không có `/content/*` ở root, không tạo `/content/page/1/` ở bất kỳ locale nào.
- Reserve ID `page`; manifest kiểm tra collision trước render. ID không đổi theo tiêu đề hoặc locale.
- Zero-content hoặc draft-only: chỉ home, root redirect, 404 và assets dùng thật; không list/detail.
- 13 bài: 12 ở trang đầu, 1 ở trang hai. Page vượt số trang hoặc không tồn tại phải trả 404.
- Chuyển UI giữ page kind, ID, số trang; fragment được giữ nếu tồn tại trên counterpart. Không về home thay cho context.
- Select native chỉ enhance điều hướng. Khi không có JS, anchor tới counterpart thật vẫn hoạt động.
- Production dùng các URL detail riêng ở trên; route pages và locale registry là source of truth.

## 3. Nguồn và schema

| Nguồn | Vai trò |
|---|---|
| `src/content/posts/<id>.md` hoặc `.mdx` | File bài thuộc website; flat inventory |
| `src/assets/` | Asset của bài đã đưa lên website và asset dùng chung |
| `drafts/posts/`, `drafts/assets/` | Nằm ngoài loader và public dependency roots |
| `public/` | Pass-through, luôn public; không chứa asset nháp |
| `content-templates/post.md` | Mẫu điền dữ liệu, không phải bài của website |
| `mockups/`, `tests/`, `plans/`, `docs/` | Không phải input nội dung hoặc upload artifact |

ID lấy từ filename stem, theo `^[a-z0-9]+(?:-[a-z0-9]+)*$`; không silent lowercase/Unicode normalization.
Không chấp nhận frontmatter `slug`; hai extension cùng stem là collision. Reject nested article,
symlink/junction/reparse hoặc file không regular. Inventory recursive nhưng không follow symlink;
loader phải dùng chính accepted inventory hoặc chứng minh exact file-set equality.

| Field | Shape và validation |
|---|---|
| `language` | Required, mã BCP-47 hợp lệ; không yêu cầu thuộc UI registry |
| `title` | Required, string không rỗng sau trim |
| `publishedAt` | Required, ngày calendar-valid; date-only theo mục 4 |
| Body | Required, Markdown/MDX không rỗng sau trim |
| `description` | Optional string mô tả thật; không có thì card không tạo paragraph rỗng |
| `updatedAt` | Optional, cùng quy tắc ngày với `publishedAt` |
| `cover` | Optional image shape dưới đây |
| `gallery` | Optional array image shape |
| `media` | Optional array video/audio/embed shape |
| `actions` | Optional array action shape |
| `platform`, `version` | Optional string; thiếu thì không tạo nhãn hoặc giá trị mặc định |

Image shape: `{ image: local-image-path, alt: non-empty-string, caption?: string }`.
Ảnh mang nội dung cần alt do tác giả cung cấp. Artwork trang trí trong layout dùng `alt=""` rõ chủ ý.

Media shape:

- Local: `{ kind: 'video' | 'audio', src: local-path, title: non-empty-string, poster?: local-image-path, caption?: string }`.
- Embed: `{ kind: 'embed', url: https-url, title: non-empty-string }`.
- Source path tương đối file bài; resolve trong `src/assets/`. ESM imports do manifest reachable tạo,
  Astro/Vite sở hữu emission; không xuất filesystem URL. Poster qua image pipeline.
- Có controls cho media, không tự phát. Embed chỉ dựng iframe sau thao tác người đọc, luôn có link nguồn.
  Khi JS tắt, link nguồn vẫn dùng được. Không thêm provider allowlist hoặc component khi chưa có nhu cầu thật.

Action shape: `{ label: non-empty-string, href: https-or-root-relative-url, kind?: 'experience' | 'download' }`.
`kind` chỉ là tùy chọn trình bày; không tự khởi động download hoặc tự gán version/platform.
Link external mở tab mới với `rel="noopener noreferrer"`.

Mẫu cấu trúc, chỉ là ví dụ trong tài liệu, không phải nội dung được phép đưa lên website:

```yaml
language: vi
title: Một tiêu đề do chủ sở hữu viết
publishedAt: '2026-10-15'
# description, cover, gallery, media, actions, platform, version đều có thể bỏ
```

Schema dùng chung được định nghĩa trong `src/lib/content-contract.ts`, đăng ký Astro tại `src/content.config.ts`;
raw preflight và Astro cùng gọi schema này. Helpers thuần chịu trách nhiệm ngày, ID, URL,
source boundary và order; không tạo schema riêng cho list/detail/SEO. Thiếu optional block thì không render.

## 4. Ngày và sắp xếp

- Nhận strict calendar-valid `YYYY-MM-DD`; không timestamp hoặc date parsing tùy ý.
- So sánh bằng ngày UTC và format ngày với timezone UTC để `2026-10-15` không lệch sang 14 hoặc 16.
  Đây là ngày lịch, không phải thời điểm đăng bài trong timezone địa phương.
- Xếp `publishedAt` giảm dần, cùng ngày thì ASCII ID tăng dần. Không dùng locale-dependent collation cho ID.
- Ngày tương lai vẫn hiện sau deploy thành công. Không scheduler, không tự lọc theo đồng hồ.
- UI VI/EN được format khác nhau nhưng cùng ngày và cùng order. Đây là contract hiện hành.

## 5. URL, Markdown/MDX và asset graph

- Một parser/serializer chung cho external action, body link và embed/source URL: HTTPS,
  không userinfo, raw/decoded control hoặc backslash. Reject executable schemes và network-path `//`.
- Internal root-relative URL resolve với site origin, assert exact origin rồi emit normalized path/query/hash.
  Local source-relative media/image refs đi qua source resolver; không lẫn với route URL.
- Trước render kiểm tra source/reference/manifest; sau render kiểm tra đích file, route và fragment tồn tại.
  Syntax/route/asset lỗi chặn build; external outage không là dependency cứng của build.
- Một resolver trong `asset-graph.ts` cho cover/gallery/poster/media/Markdown/MDX static import/CSS edges:
  kiểm tra `lstat`, realpath containment trên file và parent chain. Reject draft/escaped/non-regular target
  và symlink/junction/reparse. Relative `..` hợp lệ nếu đích vẫn trong allowed roots.
- Draft-only assets không được emit kể cả không có link HTML. Asset shared còn dùng bởi public page vẫn giữ.
  MDX được tin cậy sau review code; static graph không được quảng cáo như sandbox chống code tùy ý.
- Import component MDX dùng danh sách đường dẫn module đã review tại `src/lib/mdx-components.ts`, dưới
  `src/components/content/`; danh sách khởi đầu rỗng vì chưa có component nội dung thật. Import asset vẫn đi
  qua resolver `src/assets/`. Component đã duyệt và dependency tĩnh của nó cùng chịu source-boundary check.
- Markdown raw HTML escape thành text; fenced code vẫn là code. Component/import MDX được review trước sử dụng.

## 6. Ngôn ngữ và SEO

Registry UI và dictionaries dùng chung, default duy nhất, segment unique/reserved-safe, đủ key.
Thêm UI locale thứ ba không sửa từng template. Bài giữ nguyên ID/title/body/language ở mọi wrapper;
display-name dùng UI locale, fallback mã đã validate nếu runtime không hỗ trợ tên ngôn ngữ.
`html[lang]` theo UI; `article[lang]` theo nội dung, UI labels lồng trong article cần khai báo lang UI phù hợp.

| Page | Canonical | Alternates | Index |
|---|---|---|---|
| Home/list | Self, absolute | Reciprocal absolute URLs của UI wrappers có thật, gồm self | Có |
| Detail | Chung `/vi/content/<id>/`, absolute | Reciprocal VI/EN và locale wrapper thật, gồm self | Có |
| Root redirect | `/vi/`, absolute | Không | `noindex` |
| `404.html` | Không | Không | `noindex` |

Detail alternates chỉ diễn tả UI wrappers, không tuyên bố có bản dịch của bài.
Title/description của bài giữ ngôn ngữ thật. Description SEO dùng `description` hoặc đoạn trích văn bản
từ body qua một helper chung: bỏ markup/code/URL điều khiển, gộp whitespace, lấy tối đa 160 Unicode code points,
ưu tiên ranh giới từ; nếu không có prose thì dùng title thật. **Quy tắc trích đã được owner duyệt.**
Card không tự lấy SEO excerpt để điền mô tả optional còn thiếu.

## 7. Build và nghiệm thu đích

Production `verify` chạy: check → unit → isolated artifact scenarios → clean production build cuối.
Build luôn đi qua raw preflight → referenced-media manifest → clean đúng output đã validate → Astro → artifact check.
Fixture/browser output ở OS temp, có sentinel; không ghi vào production content hoặc production `dist/`.

Các matrix bắt buộc: 0/draft-only/1/3/4/12/13/24/25 bài; thiếu optional fields; locale thứ ba;
bài có ngôn ngữ ngoài UI registry; invalid data/collision/nested/symlink/URL/missing asset/fragment;
thêm rồi gỡ bài cuối trên cùng workspace để bắt stale files. Expected route sets phải độc lập production generator.

Browser acceptance kiểm tra 375/768/1440 và landscape, keyboard/focus/no-JS/reduced-motion/native select,
hero desktop đủ chân và mobile rõ hai mặt. Artifact không thay cho live HTTP 404 proof.
Performance ghi bytes/timing thực và môi trường; áp dụng budget và profile đo trong runbook phát hành.

Triển khai theo [runbook phát hành và rollback](publishing-and-rollback.md):
refresh provider state và exact rollback ref trước source switch; PR checks read-only; manual approved first release;
approved immutable SHA gắn artifact digest; deploy quyền riêng và concurrency không hủy run đang deploy.
Không coi branch push là bằng chứng review. Mọi release phải theo runbook.

## 8. Review artifact và gate

Hướng giao diện B champagne đã được owner chọn; production source of truth là
`src/styles/tokens.css`, `src/styles/home.css`, `src/components/hero-art.astro`, layouts và route pages.
Không coi design reference hoặc fixture là production evidence.

- `scripts/check-content.mjs`, `scripts/build.mjs`, `scripts/check-artifact.mjs` là các executable gate.
- `tests/unit/` và `tests/artifact/` giữ các negative/positive invariants; expected route sets không lấy lại từ production generator.
- Artifact approval phải gắn immutable source SHA, run, inventory và digest; live HTTP/404 checks vẫn cần sau deploy.
