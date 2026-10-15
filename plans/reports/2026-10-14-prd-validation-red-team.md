# CPM PRD — Validation và Red team

Ngày: 2026-10-14. Đối tượng review: [PRD](../../docs/prd.md).
Trạng thái: đã review từng phát hiện, cập nhật PRD theo quyết định chủ sở hữu và hoàn tất consistency sweep tài liệu.

## Phạm vi và phương pháp

Áp dụng `ak-plan validate` và `red-team` lên PRD vì repo chưa có implementation plan hoặc phase files.
Không tạo plan triển khai để giả lập việc kiểm tra một plan chưa tồn tại.
Hai reviewer độc lập dùng bốn góc nhìn: Security Adversary, Failure Mode Analyst, Assumption Destroyer,
Scope & Complexity Critic. Kiểm tra sự thật ở mức Light bằng file/line và đối chiếu source mock.
Không chạy browser, server, build hoặc kiểm thử sản phẩm; không thay đổi mock hay production.

Các phát hiện là khoảng trống hợp đồng cho sản phẩm tương lai, không phải lỗi production đã tái hiện.
Quyết định đã chốt về brand, anime, static hosting, select, Markdown/MDX, SSOT và phạm vi nội dung được giữ nguyên.

Các evidence file:line trong phần findings ghi nhận vị trí ở bản draft lúc review, không phải tọa độ của PRD đã chỉnh.
Phần “Kết quả cuối” và PRD hiện hành sở hữu kết luận sau phỏng vấn; đề xuất ban đầu bên dưới chỉ là lịch sử.

## Validation Log

### Verification Results

Kiểm tra 8 nhóm khẳng định về hiện trạng: Verified 8; Failed 0; Unverified 0 trong mẫu kiểm tra source.
Điều này không có nghĩa sản phẩm đã đủ điều kiện triển khai hoặc đã đạt nghiệm thu.

| Khẳng định kiểm tra | Kết quả và bằng chứng |
|---|---|
| PRD có trạng thái draft, không nói đã triển khai | Verified — `docs/prd.md:3`, `docs/prd.md:34-35` |
| Các đường dẫn mock/tokens/components trong PRD tồn tại | Verified — `docs/prd.md:24-31`; kiểm tra tồn tại các file liên kết |
| Brand CPM và descriptor nằm trong mock | Verified — `mockups/cpm-portfolio/index.html:15` |
| Header dùng native select VI/EN | Verified — `mockups/cpm-portfolio/index.html:15` |
| Hero có hai ảnh và collection dùng ảnh riêng | Verified — `mockups/cpm-portfolio/index.html:17`, `mockups/cpm-portfolio/index.html:19`; cả ba asset tồn tại |
| Component có focus và reduced-motion | Verified — `mockups/cpm-portfolio/shared/components.css:3`, `mockups/cpm-portfolio/shared/components.css:13`, `mockups/cpm-portfolio/shared/components.css:35` |
| Style menu custom có guard và native fallback | Verified — `mockups/cpm-portfolio/shared/components.css:16-29`; không xác nhận giao diện trên mọi browser |
| Astro/schema/deploy chưa có trong repo hiện tại | Verified — kiểm tra không có root `package.json` hoặc `.github/workflows`; phù hợp mô tả tương lai tại `docs/prd.md:169-180`, `docs/prd.md:193` |

Không dùng việc chưa có scaffold, schema hoặc test commands để kết luận PRD sai: đây là tài liệu trước triển khai.
Deploy, rollback, khả năng truy cập link ngoài, thời gian tải, contrast đo thực và responsive render chưa được kiểm chứng.

## Red Team Review

Reviewer đưa ra 12 phát hiện. Gộp hai cặp trùng về locale và route thành 10 phát hiện độc lập.
Sau đánh giá: đề xuất Accept 9 (2 High, 7 Medium); Reject 1 (High theo reviewer).
Không có Critical được xác nhận. Accept ở đây là đề xuất của reviewer chính, chưa phải chủ sở hữu đã duyệt.

### R1 — Một nội dung có nhiều bản ngôn ngữ chưa có đơn vị xuất bản rõ — High — Đề xuất Accept

- Evidence: `docs/prd.md:81-84`, `docs/prd.md:105-108`, `docs/prd.md:120-134`, `docs/prd.md:215-222`.
- Kịch bản: VI published, EN draft hoặc chưa tồn tại. Đếm bài toàn site có thể làm home EN hiện link tới danh sách rỗng;
  selector/hreflang có thể dẫn tới bản EN chưa được công bố. Hai implementation đều có thể diễn giải PRD khác nhau.
- Đề xuất: một ID nhóm nội dung, các biến thể locale có trạng thái riêng. Lọc bản published theo locale trước khi sinh
  home/list/detail/SEO. Bản draft không tham gia selector, route hoặc alternate link. Chốt hành vi thiếu bản dịch qua Q1.
- Mục cần cập nhật nếu duyệt: 5, 6, 9, 10, 12.

### R2 — Field bắt buộc chưa chốt nhưng nghiệm thu yêu cầu build từ chối dữ liệu thiếu — High — Đề xuất Accept

- Evidence: `docs/prd.md:76-84`, `docs/prd.md:97-101`, `docs/prd.md:207-211`.
- Kịch bản: entry thiếu mô tả/ngày/locale hoặc action chỉ có nhãn nhưng thiếu URL; không có hợp đồng để phân biệt
  entry hợp lệ với entry phải làm build fail.
- Đề xuất: ma trận dữ liệu tối thiểu. Bắt buộc: ID nhóm, locale, slug ổn định, title, summary, status, body;
  published cần ngày công bố hợp lệ. Tùy chọn: cover, media, ngày cập nhật, actions. Action hiện hữu cần nhãn và URL hợp lệ;
  platform/version chỉ là tùy chọn. Tính duy nhất: ID nhóm + locale và route; không ép taxonomy sản phẩm.
- Mục cần cập nhật nếu duyệt: 5, 8, 10, 12; schema cụ thể vẫn thuộc plan triển khai.

### R3 — Ngày đăng và thứ tự chưa xác định — Medium — Đề xuất Accept

- Evidence: `docs/prd.md:81-87`, `docs/prd.md:103-114`, `docs/prd.md:200-206`.
- Kịch bản: ngày bản EN khác VI, hai bài cùng ngày, hoặc published có ngày tương lai; latest khác nhau qua các lần build
  hoặc bị hiểu là có tính năng hẹn giờ dù scope không yêu cầu.
- Đề xuất: published là quyết định công bố thủ công, không có scheduler trong v1. Ngày đăng phục vụ sắp xếp và hiển thị;
  timestamp có timezone rõ hoặc date-only được chuẩn hóa theo Asia/Bangkok. Lọc draft/locale trước khi sort giảm dần,
  tie-break bằng ID nhóm ổn định. Ngày theo từng biến thể locale; không lấy ngày của bản draft để xếp bản published.
- Mục cần cập nhật nếu duyệt: 5, 10, 12.

### R4 — Ẩn navigation chưa quyết định URL danh sách rỗng và route bị gỡ — Medium — Đề xuất Accept

- Evidence: `docs/prd.md:64`, `docs/prd.md:110-114`, `docs/prd.md:190-191`, `docs/prd.md:198-206`, `docs/prd.md:239-242`.
- Kịch bản: gỡ bài cuối cùng nhưng HTML detail/list cũ vẫn xuất bản vì deploy chồng lên output trước.
- Đề xuất: build/deploy toàn bộ artifact sạch; route detail bị gỡ không tồn tại trong artifact mới. Quy tắc list zero theo
  từng locale chốt ở Q2. Thêm nghiệm thu published → draft/deleted và request trực tiếp các URL trước/sau.
- Mục cần cập nhật nếu duyệt: 4, 5, 9, 10.

### R5 — Draft assets có thể xuất bản dù không có reference từ HTML — Medium — Đề xuất Accept

- Evidence: `docs/prd.md:105-114`, `docs/prd.md:202-203`.
- Kịch bản: draft nằm ngoài collection public nhưng ảnh riêng nằm trong thư mục pass-through; output vẫn có ảnh ở URL đoán được.
  Câu nghiệm thu “không được tham chiếu” yếu hơn yêu cầu “không vào public build”.
- Đề xuất: kiểm tra artifact, không chỉ links trong HTML. Asset chỉ thuộc draft không được emit; shared asset dùng bởi
  published vẫn hợp lệ. Asset đặt ở pass-through được xem là public. Không coi public Git là nơi giữ bí mật.
- Mục cần cập nhật nếu duyệt: 5, 8, 10.

### R6 — “URL thật” chưa định nghĩa URL an toàn và mục tiêu tải xuống — Medium — Đề xuất Accept một phần

- Evidence: `docs/prd.md:97-100`, `docs/prd.md:181-185`, `docs/prd.md:237-238`.
- Kịch bản: action có nhãn nhưng URL dùng `javascript:`/`data:` hoặc nhầm đích. URL đúng cú pháp chưa đủ để nghiệm thu.
- Đề xuất tối thiểu: URL external HTTPS hoặc route internal hợp lệ; chặn scheme thực thi, credential trong URL và ký tự
  điều khiển; không tự kích hoạt download; link tab mới có rel phù hợp. Link binary nên trỏ release/file rõ phiên bản.
- Không áp đặt checksum/signature bắt buộc, allowlist provider hoặc UI hiện hostname cho mọi link ở v1; đó là scope chưa chốt.
  MDX do chủ sở hữu kiểm soát, không suy diễn site có người dùng không tin cậy đăng nội dung.
- Mục cần cập nhật nếu duyệt: 5, 8, 10.

### R7 — MDX cần phân biệt nội dung với code có thể chạy trong build — Medium — Đề xuất Accept một phần

- Evidence: `docs/prd.md:91-95`, `docs/prd.md:169-170`, `docs/prd.md:263`.
- Kịch bản: contributor đưa expression/import có side effects vào MDX và được compile với quyền của job publish.
- Đề xuất: MDX là source tin cậy, phải được owner review như code; chỉ dùng component/import được duyệt.
  Kiểm tra PR không tin cậy không có secret/quyền deploy. Không thêm CMS, sandbox hoặc hệ thống moderation.
- Mục cần cập nhật nếu duyệt: 5, 8, 10.

### R8 — Nghiệm thu mobile có thể đạt bằng cách cắt mất nhân vật — Medium — Đề xuất Accept

- Evidence: `docs/prd.md:138-151`, `docs/prd.md:162-163`, `docs/prd.md:224-227`;
  `mockups/cpm-portfolio/page.css:4`, `mockups/cpm-portfolio/page.css:12`.
- Kịch bản: overflow bị ẩn nên kiểm tra ngang pass, nhưng gương mặt/silhouette bị cắt hoặc artwork đè CTA.
- Đề xuất: desktop giữ full composition và chân; mobile/tablet phải thấy rõ cả hai mặt, không che chữ/CTA và không che mặt nhau.
  Crop phần thấp trên mobile chỉ theo mock mobile được review; không tự coi crop là hợp lệ. Đây là tiêu chí thiết kế,
  không phải xác nhận mock hiện tại đã render lỗi.
- Mục cần cập nhật nếu duyệt: 7, 10.

### R9 — “Ảnh tối ưu” chưa có bằng chứng nghiệm thu — Medium — Đề xuất Accept

- Evidence: `docs/prd.md:69`, `docs/prd.md:192`, `docs/prd.md:244-255`;
  `mockups/cpm-portfolio/index.html:17`, `mockups/cpm-portfolio/index.html:19`.
- Kịch bản: copy ảnh PNG gốc thẳng lên production nhưng vẫn gọi là tối ưu; LCP chỉ là target ứng viên nên chưa có gate để kiểm tra.
- Đề xuất: responsive image nguồn/kích thước phù hợp, định dạng tối ưu có fallback cần thiết, lazy-load artwork dưới fold,
  ổn định layout bằng kích thước/aspect ratio; báo cáo bytes ảnh thực tải ở mobile/desktop khi nghiệm thu.
  Ngưỡng ngân sách cụ thể và LCP sẽ chốt trong plan kỹ thuật; không tự bịa số đo hoặc ép ngân sách chưa được duyệt.
- Mục cần cập nhật nếu duyệt: 7, 9, 10, 11.

### R10 — Quy trình thu hồi khẩn cấp/rollback release — High theo reviewer — Reject ở phạm vi PRD hiện tại

- Evidence: `docs/prd.md:91-93`, `docs/prd.md:71-72`, `docs/prd.md:193`.
- Kịch bản reviewer: cần gỡ link binary nguy hiểm nhưng build mới fail, bản cũ vẫn hoạt động.
- Adjudication: giữ bản đang hoạt động khi build mới lỗi là hợp đồng đã chọn, không phải mâu thuẫn cần đảo ngược.
  Hiện chưa có binary/release hosting hoặc pipeline thật. Không thêm emergency publisher, quyền revoke provider hay
  acceptance cho một route vận hành chưa được đặt trong scope. Clean-artifact/unpublish thuộc R4 được giữ lại.
  Rollback vận hành cần được mô tả khi chọn pipeline/hosting ở plan triển khai, trước publish; không xem Reject là đã xử lý incident.

## Câu hỏi validation chờ trả lời

### Q1 — Bản dịch thiếu

Trên trang chi tiết chỉ có bản VI đã công bố, bạn muốn select ngôn ngữ xử lý thế nào?

- Chỉ cho chọn bản ngôn ngữ đã công bố của bài đó (Đề xuất).
- Cho chuyển giao diện EN nhưng giữ bài VI, ghi rõ ngôn ngữ nội dung.

### Q2 — Không còn bài công bố

Khi một ngôn ngữ không có bài công bố, URL danh sách của ngôn ngữ đó nên hoạt động thế nào?

- Không sinh trang danh sách; URL trả 404, home giữ nguyên mock (Đề xuất).
- Giữ URL danh sách và chuyển về trang chủ của ngôn ngữ đó.

### Q3 — Áp dụng red team

Tôi đề xuất bổ sung 9 điểm R1–R9 trong báo cáo: schema tối thiểu, lọc published theo locale, ngày đăng không hẹn giờ,
artifact sạch/loại draft assets, URL an toàn, MDX tin cậy và nghiệm thu mobile/ảnh. Bạn muốn xử lý thế nào?

- Áp dụng các bổ sung được đề xuất, cùng lựa chọn Q1/Q2 (Đề xuất).
- Review từng phát hiện trước khi sửa PRD.
- Giữ PRD hiện tại, chỉ lưu báo cáo.

### Câu trả lời chủ sở hữu

- Q1: **Cho chuyển giao diện EN nhưng giữ bài VI, ghi rõ ngôn ngữ nội dung.**
- Q2: **Không sinh trang danh sách; URL trả 404, home giữ nguyên mock.**
- Q3: **Review từng phát hiện trước khi sửa PRD.**

Hai quyết định Q1/Q2 đã được xác nhận nhưng đã propagate vào PRD sau khi hoàn tất review R9 vì chủ sở hữu chọn review từng phát hiện trước.
Không xem lựa chọn Q1/Q2 là phê duyệt toàn bộ R1–R9. Từng finding cần câu trả lời riêng.
Đặc biệt, đề xuất R1 về chỉ cho chọn bản dịch published phải được điều chỉnh theo Q1:
locale giao diện độc lập với ngôn ngữ nội dung; wrapper EN dùng nội dung VI có nhãn rõ không phải bản dịch EN.
Draft EN không được coi là một bản dịch có thể xuất bản hoặc đưa vào metadata public.

### Review từng phát hiện

- R1: chủ sở hữu bác bỏ việc gắn ngôn ngữ giao diện với biến thể xuất bản của bài. Đề xuất ban đầu chưa được duyệt.
- R2–R9: đã được hỏi riêng và duyệt theo các câu trả lời ghi bên dưới.

### R1 — Phản hồi và mô hình điều chỉnh

Phản hồi nguyên văn:

> git page mà, đâu có trang quản trị đâu mà công bố.
>
> nói chung là mỗi bài viết gắn id  ngôn ngữ vào, đây là `ngôn ngữ bài viết`, nó sẽ khác với ngôn ngữ trang web

Quyết định từ phản hồi: mỗi bài có mã ngôn ngữ nội dung; ngôn ngữ bài độc lập với ngôn ngữ giao diện website.
Không có trang quản trị. Không bắt buộc một bài có cặp bản VI/EN hoặc ID nhóm dịch chỉ để đổi giao diện.
Việc đưa file nội dung vào bản build qua Git khác với workflow quản trị có nút công bố; không dùng thuật ngữ gây hiểu nhầm.

Đã hỏi: “Với ngôn ngữ bài độc lập ngôn ngữ giao diện, tôi đề xuất đổi VI/EN vẫn giữ nguyên danh sách bài và bài đang đọc;
mỗi bài có nhãn ngôn ngữ. Quy tắc không sinh danh sách/404 chỉ áp dụng khi toàn site chưa có bài nào. Bạn chọn cách nào?”

Các lựa chọn: “Giữ cùng danh sách bài khi đổi VI/EN (Đề xuất)” | “Danh sách chỉ hiện bài có ngôn ngữ trùng giao diện”.
**Trả lời:** “Giữ cùng danh sách bài khi đổi VI/EN (Đề xuất)”.

R1 được chốt theo mô hình điều chỉnh: ngôn ngữ giao diện độc lập ngôn ngữ bài; đổi giao diện giữ nguyên tập bài và bài đang đọc;
mỗi bài có nhãn ngôn ngữ. Q2 áp dụng khi toàn site không có bài, không tính theo từng locale.
Không cần chính sách “bài thiếu bản dịch” để cho phép đổi giao diện. Không bắt buộc nhóm biến thể dịch hoặc trạng thái theo locale.
Đề xuất R2/R3/R4 phải được điều chỉnh theo mô hình này trước khi hỏi; đã propagate vào PRD sau khi hoàn tất review R9.
R1 gốc và các khuyến nghị lọc published theo locale trong báo cáo là lịch sử review, không phải contract đã được duyệt.

### R2 — Quyết định đã duyệt

Đề xuất metadata tối thiểu: ID ổn định (có thể lấy từ tên file), mã ngôn ngữ bài, tiêu đề, ngày đăng và nội dung.
Mô tả ngắn, ảnh, media và link trải nghiệm/tải là tùy chọn; action có mặt cần nhãn và URL hợp lệ.
Không bắt buộc loại sản phẩm, platform/version hoặc cặp bản VI/EN.

Câu hỏi: “R2 — Tôi đề xuất mỗi bài cần ID ổn định (có thể lấy từ tên file), mã ngôn ngữ bài, tiêu đề, ngày đăng và nội dung.
Mô tả ngắn, ảnh, video và link trải nghiệm/tải xuống đều tùy chọn; link nếu có cần nhãn và URL hợp lệ.
Không bắt buộc phân loại sản phẩm hay bản dịch VI/EN. Bạn muốn chốt thế nào?”

Các lựa chọn: “Dùng bộ dữ liệu tối thiểu này (Đề xuất)” | “Muốn chỉnh các trường bắt buộc” | “Không bổ sung quy định dữ liệu”.
**Trả lời:** “Dùng bộ dữ liệu tối thiểu này (Đề xuất)”. R2 được duyệt; đã propagate vào PRD sau khi hoàn tất review R9.

### R3 — Quyết định đã duyệt

Đề xuất: sắp theo ngày đăng mới nhất trước, cùng ngày thì dùng ID ổn định làm tie-break.
Ngày đăng chỉ là dữ liệu hiển thị/sắp xếp; v1 không có scheduler. Bài có trong tập nội dung xuất bản được đưa vào site
sau build/deploy thành công, không tự ẩn/hiện theo đồng hồ. Ngày chỉ có năm-tháng-ngày được hiểu theo Asia/Bangkok;
nếu dùng timestamp phải có timezone rõ. Không lọc bài theo ngôn ngữ giao diện.

Câu hỏi: “R3 — Tôi đề xuất danh sách xếp ngày đăng mới nhất trước; cùng ngày thì dùng ID để giữ thứ tự ổn định.
Ngày đăng chỉ dùng hiển thị/sắp xếp: bài được thêm lên site sau build/deploy, không tự ẩn hoặc chờ đến ngày đó.
V1 không có hẹn giờ đăng bài. Bạn chọn cách nào?”

Các lựa chọn: “Mới nhất trước, không hẹn giờ (Đề xuất)” | “Tự chọn thứ tự bài, không hẹn giờ” | “Muốn hỗ trợ hẹn giờ đăng bài”.
**Trả lời:** “Mới nhất trước, không hẹn giờ (Đề xuất)”. R3 được duyệt; timezone chưa được hỏi riêng,
là chi tiết đề xuất kỹ thuật, không ghi nhận như quyết định chủ sở hữu đã chốt. Chưa propagate vào PRD.

### R4 — Quyết định đã duyệt

Đề xuất: mỗi lần deploy dùng bộ output mới tạo sạch. Bài đã xóa khỏi tập nội dung site không còn HTML detail trong
output mới; URL cũ trả 404 sau deploy thành công. Nếu toàn site không còn bài, cả danh sách VI/EN không được sinh,
home vẫn giữ mock. Chỉ thay bản hoạt động khi build/deploy thành công; không hứa thu hồi tức thời khi build lỗi.

Câu hỏi: “R4 — Khi xóa bài khỏi repo và deploy thành công, tôi đề xuất URL bài cũ trả 404.
Mỗi deploy dùng bộ file mới tạo sạch để không sót HTML cũ. Nếu xóa bài cuối cùng, cả danh sách VI/EN không được sinh,
trang chủ giữ nguyên mock. Bạn chọn cách nào?”

Các lựa chọn: “Xóa URL cũ, trả 404 sau deploy (Đề xuất)” | “Giữ trang thông báo bài đã được gỡ” | “Muốn quy tắc khác cho URL cũ”.
**Trả lời:** “Xóa URL cũ, trả 404 sau deploy (Đề xuất)”. R4 được duyệt; đã propagate vào PRD sau khi hoàn tất review R9.

### R5 — Quyết định đã duyệt

Nếu có file nháp, đề xuất để file bài và asset chỉ dùng cho nháp ngoài tập nội dung xuất bản;
build không đưa chúng vào output của website. Asset dùng chung với bài đã đăng vẫn được giữ.
Quy tắc này không làm file trong public Git trở thành riêng tư. Không thêm trang quản trị.

Câu hỏi: “R5 — Nếu bạn giữ file nháp trong repo, tôi đề xuất để bài nháp và ảnh chỉ dùng cho nháp ngoài tập nội dung
đưa lên website. Build không xuất các file này; ảnh dùng chung với bài đã đăng vẫn giữ.
Repo public thì người khác vẫn có thể đọc file qua GitHub. Bạn muốn chọn cách nào?”

Các lựa chọn: “Loại bài và ảnh riêng của nháp khỏi website (Đề xuất)” | “Không cần giữ bản nháp trong repo” |
“Chỉ ẩn bài nháp, chấp nhận ảnh có URL public”.
**Trả lời:** “Loại bài và ảnh riêng của nháp khỏi website (Đề xuất)”. R5 được duyệt; đã propagate vào PRD sau khi hoàn tất review R9.

### R6 — Quyết định đã duyệt

Đề xuất chỉ cho action dẫn tới HTTPS bên ngoài hoặc đường dẫn nội bộ hợp lệ. Chặn URL thực thi, ký tự điều khiển
và credential trong URL. Tải xuống chỉ bắt đầu sau thao tác của người đọc; external action mở tab mới an toàn.
Khuyến nghị link file/release rõ phiên bản khi có dữ liệu, không ép checksum hoặc nhà cung cấp cụ thể.

Câu hỏi: “R6 — Tôi đề xuất link trải nghiệm/tải xuống dùng HTTPS hoặc đường dẫn nội bộ hợp lệ;
chặn URL thực thi như javascript:. Link ngoài mở tab mới an toàn, không tự tải file khi mở trang.
Platform/version chỉ hiện nếu có dữ liệu, không bắt buộc checksum hay nhà cung cấp lưu file cụ thể.
Bạn muốn chốt thế nào?”

Các lựa chọn: “Dùng quy tắc link này (Đề xuất)” | “Muốn điều chỉnh hành vi link” | “Không bổ sung quy tắc link”.
**Trả lời:** “Dùng quy tắc link này (Đề xuất)”. R6 được duyệt; đã propagate vào PRD sau khi hoàn tất review R9.

### R7 — Quyết định đã duyệt

Đề xuất Markdown mặc định, MDX cho nhu cầu component đặc biệt và được chủ sở hữu review như code.
Component/import trong MDX phải được duyệt. Nếu có PR từ người khác, job kiểm tra không cấp secret hoặc quyền deploy;
chỉ source đã được chủ sở hữu chấp nhận mới đi vào pipeline xuất bản. Không thêm CMS hoặc hệ thống moderation.

Câu hỏi: “R7 — Tôi đề xuất vẫn dùng Markdown mặc định; MDX chỉ dùng khi cần component đặc biệt và được bạn review
như code, gồm các import/component. Nếu có PR từ người khác, lượt kiểm tra không có secret hay quyền deploy;
chỉ source bạn đã chấp nhận mới được triển khai. Bạn chọn cách nào?”

Các lựa chọn: “Cho phép MDX có review như trên (Đề xuất)” | “V1 chỉ dùng Markdown, chưa dùng MDX” | “Muốn chỉnh quy tắc MDX”.
**Trả lời:** “Cho phép MDX có review như trên (Đề xuất)”. R7 được duyệt; đã propagate vào PRD sau khi hoàn tất review R9.

### R8 — Quyết định đã duyệt

Đề xuất desktop giữ cả hai nhân vật và bàn chân, không bị lớp trang trí che. Mobile/tablet thấy rõ cả hai mặt,
không che nhau/chữ/CTA; có thể crop phần thân dưới theo mock mobile được chủ sở hữu duyệt.
Không yêu cầu ép full body làm hero mobile quá dài.

Câu hỏi: “R8 — Tôi đề xuất desktop giữ hai nhân vật đầy đủ, không che chân. Mobile/tablet phải thấy rõ cả hai mặt,
không che chữ hoặc nút; được cắt bớt thân dưới theo mock mobile bạn duyệt để bố cục gọn. Bạn muốn chọn cách nào?”

Các lựa chọn: “Giữ hai mặt rõ; mobile được crop thân dưới (Đề xuất)” | “Luôn hiện toàn thân cả hai nhân vật trên mọi kích thước” |
“Muốn chọn bố cục mobile khác”.
**Trả lời:** “Giữ hai mặt rõ; mobile được crop thân dưới (Đề xuất)”. R8 được duyệt; đã propagate vào PRD sau khi hoàn tất review R9.

### R9 — Quyết định đã duyệt

Đề xuất ảnh có nguồn/kích thước responsive và định dạng nén phù hợp; artwork dưới fold lazy-load;
kích thước/aspect ratio giữ layout ổn định. Nghiệm thu ghi bytes ảnh thực tải và thời gian tải trên mobile/desktop.
Chưa tự áp ngưỡng MB/LCP cứng khi chưa đo với môi trường cụ thể; không coi PNG gốc trong mock là asset production đã tối ưu.
Câu hỏi: “R9 — Tôi đề xuất ảnh được nén và có kích thước phù hợp mobile/desktop; ảnh dưới màn hình đầu tải khi cần,
ảnh giữ kích thước để tránh nhảy bố cục. Khi nghiệm thu phải ghi dung lượng ảnh thực tải và thời gian tải,
chưa ép ngưỡng MB/giây cứng trước khi đo. Bạn muốn chốt thế nào?”

Các lựa chọn: “Dùng yêu cầu tối ưu và đo thực này (Đề xuất)” | “Muốn chốt thêm ngưỡng dung lượng/thời gian ngay” |
“Không bổ sung tiêu chí ảnh”.
**Trả lời:** “Dùng yêu cầu tối ưu và đo thực này (Đề xuất)”. R9 được duyệt; đã propagate vào PRD.

## Whole-Plan Consistency Sweep

Đã đọc lại PRD hiện hành và báo cáo; không có phase files để sweep.
Kiểm tra các decision delta R1–R9 qua dữ liệu, danh sách, ngôn ngữ, SEO, assets, link, MDX, responsive và nghiệm thu.

- R1: bỏ nhóm biến thể dịch/trạng thái theo locale bắt buộc. Ngôn ngữ giao diện độc lập ngôn ngữ bài;
  danh sách/bài không đổi khi chọn VI/EN; nhãn bài thể hiện ngôn ngữ thực.
- R2: required ID/ngôn ngữ bài/title/ngày/body; summary/media/action optional; không required status quản trị.
- R3: ngày mới nhất trước, ID tie-break, không scheduler. Định dạng ngày/timezone là chi tiết plan chưa chốt.
- R4: artifact sạch, URL bài bị xóa trả 404 sau deploy; zero-content tính toàn site cho cả danh sách VI/EN.
- R5: bài/asset riêng của nháp không vào artifact; shared assets có sử dụng thực vẫn giữ.
- R6: HTTPS/internal action thật, không tự tải, tab mới an toàn; không ép checksum/provider.
- R7: MDX review như code, PR chưa chấp nhận không có secret/quyền deploy.
- R8: desktop full body/chân, mobile/tablet rõ hai mặt và crop thân dưới theo mock được duyệt.
- R9: responsive/nén ảnh/lazy dưới fold/kích thước ổn định; ghi bytes/thời gian đo thực, chưa có ngưỡng cứng.

Không còn rule hiện hành trong PRD yêu cầu lọc danh sách theo locale, chờ bản dịch EN, metadata status quản trị
hoặc LCP 2.5 giây như gate chưa được duyệt. Kiểm tra internal links và nguồn tham chiếu tài liệu thành công.
Các đề xuất khác trong phần findings đầu báo cáo được giữ như lịch sử, không là yêu cầu sản phẩm hiện hành.

## Kết quả cuối

R1 được thay bằng mô hình chủ sở hữu sửa; R2–R9 được duyệt theo từng câu hỏi. Các lựa chọn Q1/Q2 ban đầu được điều chỉnh
theo R1: danh sách không lọc ngôn ngữ; chỉ không sinh khi toàn site không có bài.
R10 không áp dụng vào PRD; chi tiết vận hành rollback chốt ở plan deploy sau khi chọn pipeline/hosting.

Validation/red team và cập nhật yêu cầu đã hoàn tất ở mức tài liệu. PRD sẵn sàng làm đầu vào thiết kế/lập plan.
Mock danh sách/detail/mobile, route/canonical, schema executable, timezone, host binary và môi trường đo
còn cần chốt trong thiết kế/plan; chưa có implementation plan để khuyến nghị chạy cook ngay.
Không chạy runtime/build/deploy hoặc tuyên bố site đã đạt nghiệm thu.
