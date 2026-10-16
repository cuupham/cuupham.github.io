# CPM — Mock trung tính và champagne

**Ngày:** 2026-10-15. **Trạng thái:** owner đã chọn B champagne sau khi được đề xuất; hợp đồng kỹ thuật còn chờ xác nhận.

## Artifact

| Trạng thái | A — Trung tính | B — Champagne |
|---|---|---|
| Home có bài | [A](../../../mockups/cpm-portfolio/home-mobile.html) | [B](../../../mockups/cpm-portfolio/champagne/home-mobile.html) |
| Home chưa có bài | [A](../../../mockups/cpm-portfolio/home-empty.html) | [B](../../../mockups/cpm-portfolio/champagne/home-empty.html) |
| Danh sách | [A](../../../mockups/cpm-portfolio/content-list.html) | [B](../../../mockups/cpm-portfolio/champagne/content-list.html) |
| Detail đầy đủ | [A](../../../mockups/cpm-portfolio/content-detail.html) | [B](../../../mockups/cpm-portfolio/champagne/content-detail.html) |
| Detail tối thiểu | [A](../../../mockups/cpm-portfolio/content-detail-sample-2.html) | [B](../../../mockups/cpm-portfolio/champagne/content-detail-sample-2.html) |

Khi tạo hai bản, user cho phép sửa mock theo nghiên cứu để so sánh, chưa duyệt palette ở thời điểm đó.
Owner sau đó chọn B như ghi ở cuối báo cáo. Technical contract vẫn chưa được xác nhận; Phase 2 chưa bắt đầu.

## Thay đổi

- Cùng một layout/template, sample data, typography và ba artwork đã có. Không thêm logo hình học.
- A dùng ivory `#f1eee7` trên navy than `#11131a`; B thêm champagne `#c8ad7f` ở nút chính,
  eyebrow, indicator và chi tiết nhỏ. Heading/body vẫn trung tính. Hover/focus giữ phản hồi rõ.
- Giảm phân tầng chữ hero: wordmark CPM thẳng, Creative Signal thành nhãn nhỏ, descriptor xuất hiện trong hero.
- Home có bài: hero → đúng 3 bài mới → section cream gộp giới thiệu/collection → footer.
  Home chưa có bài: bỏ latest/card/link list khỏi product UI; CTA dẫn tới giới thiệu thật.
- List dùng heading “Góc chia sẻ”, intro ngắn, hàng bài viết không dành ô thumbnail khi thiếu ảnh.
- Detail bỏ aside “Trong bài viết” chưa có mục lục, giữ prose tối đa 680 px và artwork rộng tối đa 960 px.
  Action thật chuyển vào nội dung; bài tối thiểu không có action/cover/gallery rỗng.
- Review toolbar có counterpart A/B cùng trang và lựa chọn trạng thái home. Locale links vẫn giữ trang/bài/page number.
- Generator tạo 68 HTML: 17 trang × 2 locale × 2 palette. B dùng chung stylesheet/JS/artwork với A,
  chỉ thay data-theme và đường dẫn tài nguyên cần thiết. Home tham chiếu `index.html` vẫn giữ bố cục cũ.

## Kết quả đã kiểm tra

| Kiểm tra | Evidence / kết quả |
|---|---|
| Syntax/generation | Python generator chạy thành công; `node --check review.js` pass |
| Static HTML | 68 pages; 1.508 local `href/src/data-href` tồn tại; ID không trùng; 1 h1/page; noindex; không iframe dựng sẵn |
| A/B equivalence | 34 cặp main HTML giống nhau sau chuẩn hóa prefix asset; không đổi nội dung khi đổi palette |
| Data và zero state | 3 card trên home có bài, 12 ở list đầu, 1 ở trang hai; home-empty không card và không có link list |
| Generator determinism | Regenerate cùng input cho cùng bytes trên cả 68 HTML |
| Browser viewport VI | 2 palette × 4 loại trang (home, empty home, list, full detail) × 6 viewport = 48 tổ hợp; không overflow, 1 h1, không broken image phát hiện trong lần kiểm |
| Browser viewport EN | 2 palette × cùng 4 loại trang × 375×812, 768×1024, 1440×900 = 24 tổ hợp; không overflow, 1 h1 |
| Native locale select | B list trang hai → EN vẫn ở B/trang hai, một card đúng tiêu đề VI |
| No-JS context | B/EN/sample-13 → tắt JS/reload → A/EN/sample-13 → VI/sample-13 → back đúng list trang hai. Select phụ thuộc JS được ẩn; counterpart anchors thật vẫn hoạt động |
| Desktop visual | Đã inspect screenshot A và B ở 1440×1000: hai nhân vật đủ chân, copy/CTA không bị art che; cùng bố cục, màu nút/nhấn khác nhau |
| Reading/layout measurements | 1440 px: prose 680 px, ảnh 960 px, body 18 px; intro list giảm từ snapshot 448 px xuống 240 px |
| Keyboard/reduced motion | 14 điểm Tab trên list có outline; reduced motion cho scroll auto, CTA transition 0s |
| Docs/plan | Python AST, 69 local doc links và owned-file whitespace pass; plan format valid, reindex nhận 4 phase; tracked diff check pass với cảnh báo LF/CRLF README |

Sáu viewport VI: 375×812, 768×1024, 1440×900, 812×375, 1024×768, 900×1440.
Các thao tác browser qua BrowserOS neo; không dùng Playwright/Chrome DevTools MCP và không start server.

Trong mock 375×812, `#latest` bắt đầu tại **855 px** ở cả A và B, so với **2.249 px** trong snapshot trước.
Cả hai số gồm review toolbar/header; là vị trí section, không phải card đầu tiên hoặc chỉ số engagement.

## Giới hạn

- Capture screenshot ở tab cũ có lượt không hoàn tất; đã thay tab nghiên cứu cũ bằng tab B mới để có screenshot desktop.
- Screenshot mobile 375×1000 trả `CDP request timed out: Page.captureScreenshot`.
  Responsive mobile đã kiểm bằng DOM/geometry, chưa ghi thành visual mobile pass của revision này.
- Chưa user test, real-device check, cross-engine fallback check hoặc benchmark/tối ưu PNG.
- Không chạy application build/test/deploy: scope hiện tại vẫn là mock; chưa có Astro implementation.
- Media source và logic deferred iframe giữ từ lượt trước; không ghi lại thành playback pass mới.
- Lượt này không đổi provider, tạo nội dung public hoặc commit/push.

## Review tiếp theo

Owner đã trả lời “ok theo đề xuất” sau đề xuất chọn B: champagne ở nút chính/chi tiết nhỏ, heading/body ivory.
Không thay đổi HTML/CSS trong lượt ghi nhận lựa chọn này; evidence kiểm tra phía trên áp dụng cho mock đã chọn.
Chỉ sau khi technical contract được xác nhận mới đóng gate Phase 1.
Các quyết định 3/12, hai nhân vật, ngôn ngữ bài độc lập UI và zero-content vẫn giữ nguyên.
