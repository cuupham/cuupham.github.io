# CPM v1 — Artifact Phase 1 và kiểm tra mock

**Ngày:** 2026-10-15. **Trạng thái:** artifact sẵn sàng review; chưa có owner approval, chưa bắt đầu Phase 2.

## Kết quả và phạm vi

Đã dựng [list](../../../mockups/cpm-portfolio/content-list.html),
[list trang hai](../../../mockups/cpm-portfolio/content-list-page-2.html),
[detail đủ field](../../../mockups/cpm-portfolio/content-detail.html),
[detail tối thiểu](../../../mockups/cpm-portfolio/content-detail-sample-2.html),
[bài EN](../../../mockups/cpm-portfolio/content-detail-sample-3.html),
[home responsive](../../../mockups/cpm-portfolio/home-mobile.html) và counterpart EN.

13 entry minh họa cho trạng thái 3 latest, 12 bài ở trang đầu, 1 ở trang hai; 2 bài EN để review content-language.
Các detail còn lại là variant tối thiểu, có tiêu đề/link riêng. Tổng 32 HTML được sinh bằng
`mockups/cpm-portfolio/generate-review.py`; chỉ dùng standard library và không cần chạy để xem mock.
`review.css`/`review.js` chỉ sở hữu review pages. Giữ nguyên `index.html`, shared tokens/components/locales và artwork.
Không đưa sample vào production content; chưa commit/push/chuyển branch hoặc thay provider.

[Technical contract](../../../docs/cpm-v1-technical-contract.md) cụ thể hóa routes, source/schema, date/order,
URL/asset boundaries, language, SEO và acceptance flow. Nó phân biệt quyết định đã duyệt với proposal.

## Kiểm tra đã chạy

| Kiểm tra | Kết quả |
|---|---|
| Mở HTML trực tiếp qua BrowserOS neo | Home/list/detail và trang hai mở qua `file://`, không server |
| Viewport VI + EN | Home/list/detail × 375×812, 768×1024, 1440×900, 812×375, 1024×768, 900×1440: 36 tổ hợp không tràn ngang |
| Visual | Đã xem screenshot desktop home/list, tablet detail và mobile home: desktop đủ chân, mobile rõ hai mặt, không artwork che copy/CTA ở các view đã xem |
| Ảnh | Không broken image ở 18 tổ hợp VI đã kiểm tra DOM; nguồn ảnh local dùng ba artwork đã có |
| Pagination/context | Chọn EN ở trang hai vẫn còn một bài đúng tiêu đề; mở sample-13, đổi UI và quay lại đúng list trang hai |
| Tắt JavaScript | Disable script thực trong tab QA, reload; fallback anchor đổi EN → VI vẫn giữ sample-13; back link về đúng trang hai; full detail vẫn có body/video controls/source link, select và nút embed phụ thuộc JS được ẩn |
| Keyboard | Tab lần lượt qua skip, locale anchor, brand, nav, native select và card links; các điểm đã đi qua có focus outline solid |
| Reduced motion | Emulate `prefers-reduced-motion: reduce`: media query match, scroll `auto`, CTA transition `0s` |
| Embed | Trước click có 0 iframe, video `preload=none`, không autoplay; click tải tạo đúng 1 iframe `youtube-nocookie.com` và status readback |
| HTML/reference check | Standard-library parser: 32 pages, 618 local `href`/`src`/`data-href` tồn tại, fragment đúng ID, không ID trùng, 1 h1/page, noindex, không iframe khởi tạo sẵn |
| Data counts | Home có đúng 3 card; list trang một đúng 12, trang hai đúng 1 ở VI và EN |
| Generator | Regenerate cùng input tạo đúng cùng bytes trên 32 trang |
| JavaScript syntax | `node --check mockups/cpm-portfolio/review.js` pass |
| Docs và plan | 80 local Markdown references trong 14 documents hợp lệ; `ak plan validate` valid; index nhận 4 phase, 3/18 checklist items và 0/4 phase hoàn tất |
| Source hygiene | Python AST parse và whitespace của owned files pass; `git diff --check` pass cho tracked diff, có cảnh báo LF/CRLF của README đã dirty trước lượt này |

Các lệnh browser chạy qua MCP BrowserOS neo, không dùng Playwright hoặc Chrome DevTools MCP.
Viewport/reduced-motion/no-JS được thiết lập qua API của chính browser này. Không có server/background process được start.
Các screenshot được inspect trực tiếp trong phiên; không lưu file screenshot lâu dài trong repo.

## Những lỗi đã sửa trong lượt này

- Artwork home tràn 9–20 px ở một số desktop/tablet viewport: đưa female asset về trong art stage,
  không che overflow toàn trang. Chạy lại ma trận, không còn tràn.
- Hash-only article variants có thể mất context khi đi tới skip/back-to-top: chuyển thành counterpart HTML riêng,
  sinh từ cùng generator. Links khi không JS vẫn giữ được bài và trang list.
- Static check phát hiện duplicate `top` giữa body và hero: sửa ID của body review home; fragment vẫn có đích rõ.
- Khi tự review, giữ nguyên caption nội dung và media title của bài VI ở EN wrapper; chỉ các nhãn UI đổi ngôn ngữ.

## Giới hạn và phần chưa chạy

- Không có Astro/package/schema executable, unit/artifact suite hoặc deploy pipeline. Không chạy hoặc claim production build/test pass.
- HTML parser/reference checks ở đây kiểm tra mock, không chứng minh production ID/URL/draft/HTML escaping enforcement.
- Viewport emulation không thay real-device testing. Chưa kiểm browser engine không hỗ trợ `base-select`; shared CSS có native fallback,
  nhưng chưa gọi đó là cross-browser runtime pass.
- Chưa benchmark hiệu năng, tối ưu PNG nguồn, đo LCP hoặc chứng nhận toàn bộ contrast/accessibility.
- Video dùng MDN sample HTTPS và embed dùng nguồn ngoài thật, không phải local-media emission production.
  Đã kiểm tra defer/controls/source link và iframe creation; **chưa xác nhận playback của cả hai player** trong file-origin browser.
- Chưa kiểm live Pages settings/HTTP/404, thêm-gỡ nội dung thật, approval enforcement, deploy order hoặc rollback.
- Đây là review trực tiếp bởi controller bằng skill `ak-code-review`, không phải review độc lập của subagent.

## Gate còn chờ owner

1. Duyệt hoặc sửa hướng list/detail/mobile trên artifact cụ thể.
2. Duyệt hợp đồng kỹ thuật, gồm proposal strict `YYYY-MM-DD`, compare/format UTC, ASCII ID tăng dần khi cùng ngày;
   SEO excerpt tối đa 160 Unicode code points từ prose thật, fallback title nếu không có prose.

Các policy đã chốt về prefix VI/EN, 3/12, language independence, nháp/URL/MDX và SEO wrappers giữ nguyên.
Không tự đóng gate từ việc tạo đủ file. Tiếp tục Phase 2 sau câu trả lời review; Phase 3/4 vẫn chưa thực hiện.
