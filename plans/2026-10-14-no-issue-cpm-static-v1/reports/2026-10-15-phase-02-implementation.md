# CPM — Phase 2 implementation

**Ngày:** 2026-10-15. Phạm vi: Astro scaffold, content/source/asset contracts và locale routes.
Owner đã xác nhận mock B champagne và exact technical contract; Phase 1 gate đã đóng.

## Implementation

- Pin Node 24.18.0, Astro 7.3.8, MDX 8.0.3, TypeScript 6.0.3 và các dependency trong package/lockfile.
  TypeScript 7 bị peer constraint của `@astrojs/check` từ chối; đã sửa version, không dùng force/legacy peer mode.
- Một schema pure tại `src/lib/content-contract.ts`, Astro đăng ký qua `src/content.config.ts`.
  Raw inventory chạy trước loader, reject ID/case/Unicode/reserved/nested/slug/cross-extension collision,
  non-regular source và content-directory junction. Loader chỉ nhận file-set đã chấp nhận và assert equality.
- Ngày calendar-valid date-only, UTC display, date giảm dần + ID ASCII tăng dần; future date không bị lọc.
  BCP-47 parse độc lập khả năng hỗ trợ của Intl, kể cả private-use/grandfathered tags; nhãn fallback về mã.
- Resolver chung kiểm tra lexical containment, lstat từng parent và realpath. Graph theo cover/gallery/poster/media,
  Markdown inline/reference links/images, MDX static imports/attributes, JS/TS static dependencies, CSS imports/URLs
  và SVG static references. Component MDX phải thuộc danh sách reviewed imports; chưa có component public giả.
- Action/body/embed dùng cùng URL parser; chặn schemes không cho phép, credentials, network-path và raw/decoded
  controls/backslash. Preflight kiểm tra internal route existence trong manifest; fragment DOM thuộc Phase 3.
- Reachable media manifest dùng ESM `?url` dưới `.astro/`, không copy cây assets/drafts vào `public/`.
  Build runner preflight trước cleanup; output tuyệt đối phải là thư mục `dist/` thuộc root hiện tại,
  không symlink/junction. Hook Astro và loader vẫn chạy preflight khi gọi Astro trực tiếp.
- Root redirect là HTML/anchor thật tới VI, noindex, canonical VI, zero alternates. Hai home semantic scaffold
  lấy từ locale registry, có self canonical và reciprocal alternates; production không có bài/list/detail giả.
- Markdown raw HTML đổi thành escaped text, fenced code được giữ; trusted MDX vẫn là code.
  Helper excerpt tối đa 160 code points từ prose, không lấy code/image/URL để điền nội dung giả.

API được đối chiếu từ [Astro content collections](https://docs.astro.build/en/guides/content-collections/),
[loader reference](https://docs.astro.build/en/reference/content-loader-reference/) và
[Astro 7 Unified processor migration](https://docs.astro.build/en/guides/upgrade-to/v7/).
Version dependency lấy từ npm khi thực thi, không sao chép version ở research cũ.

## Verification scope

- Unit fixtures nằm trong OS temp, không ghi bài mẫu vào production source hoặc `dist/`.
- Inventory và route matrix: 0/1/3/4/12/13/24/25 bài; literal expected route sets độc lập production registry.
  Locale thứ ba sinh home/list/detail/page 2 cùng registry; thiếu dictionary/default/collision bị từ chối.
- Build fixture thực: draft-only → Markdown + MDX → gỡ bài trên cùng workspace. Acceptance-only endpoint
  đọc `getCollection`; acceptance-only Astro page thực sự `render()` cả hai định dạng. Không có các route này
  trong source/output production. Tests kiểm tra nội dung/ngôn ngữ giữ nguyên và raw script/iframe/event HTML
  chỉ thành text; duplicate ID, invalid date và nested direct-Astro build phải fail.
- Kiểm thử Windows junction qua cover/gallery/poster/media/Markdown/MDX/CSS và junction tại thư mục bài đã chạy.
  File-symlink creation bị tài khoản Windows từ chối; case này skip có lý do, không ghi thành pass.
- Rà soát trực tiếp theo `ak-code-review`: bổ sung BCP-47 không phụ thuộc Intl, chặn raw controls trước bước
  trim URL và loại component module khỏi URL manifest. Không có independent reviewer trong lượt này.
- Assertion render ban đầu chỉ nhận `&lt;`; Astro xuất escape tương đương `&#x3C;`. Đã sửa assertion để nhận
  HTML entities tương đương, vẫn cấm active script/iframe/image và kiểm tra text giữ nguyên.

Kết quả cuối tại cùng source/lockfile:

| Lệnh/kiểm tra | Kết quả |
|---|---|
| `npm ci` | Pass; 0 vulnerabilities từ audit; npm cảnh báo esbuild install script chưa nằm trong allowScripts. Các build thực vẫn thành công |
| `npm run verify` | Exit 0: content preflight → Astro check → unit/temp-build fixtures → clean production build |
| Astro/TypeScript | 0 errors, 0 warnings, 0 hints |
| Vitest | 94 passed, 1 skipped; 4 test files passed |
| Production output | Đúng 3 file HTML: root + VI/EN home; không list/detail/source/draft/fixture |
| Independent HTML inspection | Root refresh/anchor/noindex/canonical VI/zero alternates; hai home có một h1, đúng document lang, self canonical và reciprocal alternates |
| Docs/source hygiene | 70 local links trên 7 owning docs pass tại lần kiểm trước final log; 25 source/config files không trailing whitespace; tracked diff check pass với cảnh báo LF/CRLF README |

Sau khi ghi execution log, plan checkboxes được đồng bộ qua `ak plan`; đây không phải nghiệm thu toàn v1.

## Boundaries and next step

- Chưa port giao diện B, list/detail/404 hoặc tối ưu hình ảnh; đó là Phase 3.
- Fragment/đích asset trong HTML emitted, exact production artifact oracle, responsive/no-JS browser acceptance
  và media emission/playback đầy đủ chưa được nghiệm thu; các phase sau sở hữu những kiểm tra này.
- Static graph không phải sandbox chống MDX code tùy ý. Owner vẫn phải review trusted MDX/components như code.
- Không start dev server, không thay provider, không publish, không commit/push. Chưa chứng minh HTTP 404/live lifecycle.
