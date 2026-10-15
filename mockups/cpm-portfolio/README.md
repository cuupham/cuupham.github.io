# CPM mockup

Owner đã chọn [B — Champagne](champagne/home-mobile.html) ngày 2026-10-15; [A — Trung tính](home-mobile.html) giữ để đối chiếu.
Mở trực tiếp bằng trình duyệt, không cần server, build, module JavaScript hoặc fetch.
`index.html` giữ bố cục home tham chiếu trước lượt so sánh này; không phải entry của mock mới.

## Shared components / SSOT
- `shared/tokens.css`: baseline tokens cho mock tham chiếu; các palette A/B được định nghĩa chung tại `review.css` như mô tả bên dưới.
- `shared/components.css`: brand, button (`cta`, `cta--secondary`), native select (`lang`), labels (`eyebrow/kicker/code`), feature panel (`board overview`), artwork (`collection-art`) và link list (`footer-nav`). Tái sử dụng class + cấu trúc semantic trong HTML.
- `shared/components.js`: hành vi đổi ngôn ngữ cho các select `data-language`; text dùng `data-t`. Tự đồng bộ nếu thêm select ở vị trí khác.
- `shared/locales.js`: dictionary tiếng Anh. Tiếng Việt lấy từ HTML lúc khởi tạo, không có dictionary tiếng Việt trùng lặp. Nội dung vẫn hiện khi JavaScript tắt.
- `page.css`: bố cục riêng home tham chiếu `index.html`; trang review A/B dùng `review.css` và không nạp file này.

Thêm ngôn ngữ: thêm option vào select và dictionary tương ứng trong `locales.js`. Không liệt kê mã ngôn ngữ ở footer. Bản dịch chỉ chèn text, không chèn HTML.

Select giữ semantics và thao tác bàn phím native. Trình duyệt hỗ trợ `appearance: base-select` dùng menu navy tùy biến, mỗi lựa chọn cao tối thiểu 44px và lựa chọn hiện tại có dấu check/accent. Trình duyệt khác dùng menu native; khung select vẫn được style bằng cùng tokens. Không cần JavaScript để mở menu.

Ảnh `collection-observatory.png` là minh họa trang trí riêng cho collection, không phải sản phẩm đã phát hành.

## Review list/detail/mobile — 2026-10-15

Các trang sau là **mock để duyệt thiết kế**, không phải bài hoặc release đã công bố. Mở trực tiếp bằng `file://`,
không cần server. Lượt đầu giữ nguyên home/shared files; cập nhật feedback màu và wordmark bên dưới thay thế giới hạn đó.

- [Danh sách trang 1](content-list.html): 12 bài mẫu; một bài có ảnh/mô tả, các bài còn lại thể hiện dữ liệu optional vắng mặt.
- [Danh sách trang 2](content-list-page-2.html): bài thứ 13; link phân trang thật.
- [Detail đầy đủ](content-detail.html): tiêu đề dài, cover, gallery, video có controls, embed chỉ tải khi click và action GitHub thật.
- [Detail tối thiểu](content-detail-sample-2.html): chỉ ngày, ngôn ngữ, tiêu đề và body; không khung ảnh/mô tả/action trống.
- [Bài tiếng Anh](content-detail-sample-3.html): nội dung EN vẫn là EN khi đổi UI sang VI.
- [Home responsive](home-mobile.html): crop mobile/tablet được đề xuất và đúng 3 bài mẫu mới nhất.
- [Bản EN của danh sách](en/content-list.html): cùng thứ tự, ID và nội dung; UI labels đổi ngôn ngữ.

`review.css` chỉ áp dụng các trang review, không thay CSS của home đã duyệt. `review.js` chỉ điều hướng locale và tải
embed theo thao tác. Có counterpart HTML thật cho từng trang và từng bài mẫu để links, phân trang, skip link và đổi
ngôn ngữ hoạt động khi tắt JavaScript; select/button phụ thuộc JS được ẩn trong chế độ đó.

Danh sách mẫu có 13 ID, gồm hai bài EN. Các detail tối thiểu còn lại được sinh thành `content-detail-sample-N.html`
ở VI và `en/`; không phải các bài mới thuộc website. Không tạo chúng trong `src/content/posts/` hoặc upload production.
Để sửa nội dung/markup dùng chung rồi tái sinh toàn bộ 68 trang review:

```powershell
python mockups/cpm-portfolio/generate-review.py
```

Generator chỉ dùng Python standard library. Không cần chạy generator để mở mock. Chuỗi UI VI/EN và sample data
ở generator là nguồn của **mock**, không thay nguồn schema/locale Astro phải tạo ở Phase 2.
Home EN lấy các bản dịch đã có trong `shared/locales.js`; title/body bài mẫu không được dịch theo UI.

Video hoa dùng sample CC0 trên MDN, `preload="none"`; player YouTube cho Big Buck Bunny chỉ được tạo sau click.
Các nguồn ngoài cần mạng và có thể bị chặn khi mở file local; layout/link nguồn vẫn review được. Đây không phải
bằng chứng rằng media host hoặc local media emission của sản phẩm đã triển khai.

[Hợp đồng kỹ thuật để review](../../docs/cpm-v1-technical-contract.md) chứa route/schema/SEO/source boundary,
trạng thái duyệt từng nhóm quyết định, đề xuất ngày và quy tắc excerpt. Kết quả kiểm tra được ghi ở
[báo cáo Phase 1](../../plans/2026-10-14-no-issue-cpm-static-v1/reports/phase-01-mock-verification.md).

## Feedback màu và wordmark — 2026-10-15

Owner không thích cyan và badge ngũ giác bọc CPM. Đã bỏ badge, chỉ giữ wordmark chữ CPM;
đổi UI accent sang lavender dịu `#c8b5f5` trong token `--accent` để review. Đồng bộ home gốc,
list/detail/mobile và bản EN qua shared styles/generator. Màu lavender đang là đề xuất, chưa được duyệt.
Artwork giữ nguyên; cyan nằm trong hình minh họa không phải token accent UI.

## Hai bản trung tính/champagne — lượt review hiện hành

Owner đã yêu cầu sửa mock theo nghiên cứu và làm hai bản để so sánh. Lavender ở lượt trước đã được thay trong
các trang review bằng hai palette. Sau đề xuất dùng B với champagne cho nút chính/chi tiết nhỏ và chữ ivory,
owner trả lời “ok theo đề xuất”; B là hướng giao diện được chọn. Owner sau đó xác nhận hợp đồng kỹ thuật
và yêu cầu tiếp tục Phase 2 ngày 2026-10-15.

| Trang | A — Trung tính | B — Champagne |
|---|---|---|
| Home có bài | [Mở A](home-mobile.html) | [Mở B](champagne/home-mobile.html) |
| Home chưa có bài | [Mở A](home-empty.html) | [Mở B](champagne/home-empty.html) |
| Danh sách | [Mở A](content-list.html) | [Mở B](champagne/content-list.html) |
| Detail đầy đủ | [Mở A](content-detail.html) | [Mở B](champagne/content-detail.html) |
| Detail tối thiểu | [Mở A](content-detail-sample-2.html) | [Mở B](champagne/content-detail-sample-2.html) |

Mỗi trang có thanh review phía trên để đổi A/B, đổi VI/EN và mở trạng thái home có/chưa có bài.
Đổi palette giữ cùng trang/bài/số trang; đổi UI giữ nguyên title/body/ngôn ngữ bài. Những liên kết này là HTML thật,
không cần JavaScript để chuyển palette hoặc locale. Select điều hướng và embed button được enhance bằng `review.js`.

Hai bản dùng **một bố cục và cùng sample data/artwork**. A dùng UI ivory trên navy than.
B chỉ thêm champagne `#c8ad7f` ở nút chính, eyebrow, indicator/menu và chi tiết nhỏ; heading/body giữ trung tính.
Palette/layout mới tập trung tại `review.css`, chỉ áp dụng review pages. Shared styles và `page.css` vẫn phục vụ
home tham chiếu cũ; generator không nhân bản assets hoặc stylesheet theo palette.

Home mới đặt 3 bài ngay sau hero, gộp manifesto/collection thành một section cream.
Home chưa có bài không có latest/card/link list trong UI sản phẩm. List vào nội dung sớm với heading chức năng;
detail có prose tối đa 680 px và ảnh rộng hơn, bỏ khối “Trong bài viết” chưa có chức năng mục lục.
Desktop giữ hai nhân vật toàn thân; mobile/tablet dùng art stage crop phần dưới để giữ rõ hai mặt.

Generator tạo 17 trang × 2 locale × 2 palette = 68 HTML; A ở thư mục hiện tại, B ở `champagne/`, locale EN ở `en/`
của từng bản. [Báo cáo kiểm tra A/B](../../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-15-neutral-champagne-mock-review.md)
ghi rõ những gì đã chạy và giới hạn screenshot mobile. Tất cả vẫn là fixture review, không phải nội dung public.
