# CPM — Đối chiếu tham chiếu và đề xuất giao diện

**Thời điểm:** 2026-10-15, 14:25 UTC+07 (Asia/Bangkok).
**Phạm vi:** nghiên cứu trực tiếp để đề xuất sửa mock Phase 1; không phải quyết định thiết kế đã được owner duyệt.

Tôi đề xuất giữ hai nhân vật anime và chuyển phần UI về nền navy than/ivory tiết chế, đưa nội dung thật lên sớm,
giảm các thông điệp giới thiệu lặp lại. Lavender hiện tại mới thay màu của hệ thống cũ;
nó chưa giải quyết thứ bậc thị giác và chưa có bằng chứng hợp sở thích owner.

## 1. Cách nghiên cứu và độ chắc chắn

- Đọc lại [PRD](../../../docs/prd.md), [home](../../../mockups/cpm-portfolio/index.html),
  [home có bài](../../../mockups/cpm-portfolio/home-mobile.html), [list](../../../mockups/cpm-portfolio/content-list.html),
  [detail](../../../mockups/cpm-portfolio/content-detail.html), shared tokens/CSS và phản hồi owner.
- Mở trực tiếp năm site bên dưới bằng BrowserOS neo; quan sát screenshot desktop 1440×1000 và đọc cấu trúc/nội dung.
  Dùng web search để tìm nguồn, rồi đối chiếu trang chính thức hiện hành; không lấy ảnh trong bảng xếp hạng làm bằng chứng site hiện tại.
- Xem thêm trang detail của Josh Comeau, đọc trang list của Anthony Fu; đo DOM tại viewport đã ghi.
- Quan sát trực tiếp và số đo được ghi mức **cao** trong đúng snapshot/viewport đó. Đề xuất thẩm mỹ và ưu tiên UX là
  **trung bình**: chưa có user test, số liệu hành vi hoặc owner approval. Dự đoán owner sẽ thích palette nào là **thấp**.
- Đây không phải khảo sát đại diện cho toàn ngành hoặc bằng chứng các site tham khảo có conversion/performance tốt hơn CPM.

## 2. Các trang thực sự đã tham khảo

| Trang | Quan sát trực tiếp | Bài học đề xuất cho CPM |
|---|---|---|
| [Anthony Fu](https://antfu.me/) | Bản dark có nền gần đen, nội dung tập trung thành cột, dấu hiệu nhận diện dạng chữ ký nhỏ; liên kết Blog/Projects/Talks rõ ràng. | Nhận diện cá nhân có thể đến từ chữ và nội dung thật; CPM không cần thêm badge hình học để trông có thương hiệu. Không sao chép thành tích/project của người khác. |
| [Josh W. Comeau](https://www.joshwcomeau.com/) | Header có minh họa nhân vật và màu sắc nổi bật, phía dưới vào danh sách bài; phần đọc chủ yếu nền tối và chữ sáng, không phải toàn bộ UI đều rực màu. | Giữ artwork làm điểm nhớ; phần đọc có nhịp riêng. Học sự phân vai giữa minh họa và nội dung, không thêm các categories/courses/newsletter của site này vào scope CPM. |
| [Jhey Tompkins](https://www.jhey.dev/) | Bản hiện tại có headline serif lớn, nền đen, link đỏ, grid nền mờ và dấu hiệu cá nhân nhỏ. Nội dung tập trung giới thiệu người sáng tạo và dẫn tới demo thật. | Một điểm nhấn có chủ đích dễ kiểm soát hơn nhiều nhãn/tiêu đề cùng nhấn màu. Không cần chuyển CPM sang serif hoặc thêm dashboard trạng thái. |
| [Lee Robinson](https://leerob.com/) | Desktop đặt bio/notes/blog ở bên trái và minh họa màu lớn ở bên phải; nền gần charcoal, chữ sáng, link tiết chế. | Đây là tham chiếu gần CPM nhất về việc giữ minh họa nổi bật cạnh nội dung cá nhân. Học cách phân chia vai trò, không sao chép art/font/bio. |
| [Zenless Zone Zero](https://zenless.hoyoverse.com/en-us/) | Snapshot desktop là hình chiến dịch chiếm gần toàn màn hình, màu đen/đỏ/cream, logo và nút download nổi bật. Screenshot còn có cookie banner; text extractor không đọc được nội dung chính. | Học bố cục nhân vật và tương phản của chữ trên artwork. Mục tiêu trang là quảng bá/tải game, nên chiều cao landing và mật độ CTA không phải mẫu mặc định cho trang đọc/chia sẻ cá nhân. |

Các mô tả này là quan sát ngày 2026-10-15, không phải tuyên bố nhận diện của site sẽ luôn như vậy.
Ví dụ, không dựa vào một bản Jhey cũ hoặc mặc định ZZZ luôn dùng một palette vàng/đen.

## 3. Đối chiếu với CPM hiện tại

### Màu và điểm nhấn — quan sát cao, đánh giá trung bình

Trong CSS CPM, cùng token accent được dùng cho nút chính, title phụ lớn, eyebrow, selected nav,
link đọc bài, select, footer và các đường trang trí. Đổi `--cyan` sang lavender giữ nguyên sự phân bố đó.
Vì vậy chỉ thay hex chưa tạo được thứ bậc mới.

Art hiện có đã chứa nhiều xanh, tím và coral. Tôi đề xuất để artwork đóng vai trò mang màu chính;
tiêu đề, wordmark và phần đọc dùng màu trung tính. Đây là quyết định art direction đề xuất, không phải kết luận owner thích vàng hay ghét tím.

### Wordmark và typography — quan sát cao, đề xuất trung bình

Badge ngũ giác đã được bỏ. Header vẫn có wordmark CPM, descriptor, trong hero có CPM lớn,
chữ viền Creative Signal, eyebrow, tagline và đoạn giới thiệu. Nhiều lớp chữ cùng muốn tạo dấu ấn.

Đề xuất một wordmark chữ CPM rõ ràng, không thêm hình thay thế. Giữ Be Vietnam Pro cho body;
Chakra Petch chỉ dùng chọn lọc cho nhận diện. Thử giảm chữ viền/italic và đặt Creative Signal ở vai trò phụ,
không vội thay toàn bộ font hoặc tuyên bố đã có logo thiết kế riêng.

### Home — quan sát cao, đề xuất trung bình

Đo trong mock có bài tại **375×812**, gồm thanh review và header:

| Section | Vị trí bắt đầu từ đầu document | Chiều cao |
|---|---:|---:|
| Hero | 164 px | 835 px |
| Manifesto | 999 px | 264 px |
| Collection overview (`spectrum`) | 1.264 px | 985 px |
| Khu “Những chia sẻ mới” | 2.249 px | 1.258 px |

2.249 px là vị trí section, **không phải vị trí card đầu tiên**, và không phải số đo production hoặc bằng chứng người đọc rời trang.
Nó cho thấy hai khối giới thiệu dài nằm trước nội dung. Copy hero, manifesto và overview đều xoay quanh cùng ý chia sẻ điều thú vị.

Đề xuất khi có bài: hero → 3 bài mới → một khối giới thiệu/collection → footer.
Giữ nhịp cream và collection artwork; giảm copy lặp hoặc gộp vai trò hai khối giữa.
Đây là thay đổi so với thứ tự mock đã chấp nhận, cần owner review trước khi áp dụng.
Zero-content vẫn tuân PRD: không tạo latest/list link hoặc card giả; hero dẫn tới khối giới thiệu thật.

Giữ hai nhân vật và full body trên desktop như quyết định đã chốt. Mobile ưu tiên hai mặt và copy/CTA rõ,
giảm các lớp chữ để bớt chiều cao; không ép một chiều cao hero cứng rồi cắt mặt hoặc che overflow.

### List — quan sát cao, đề xuất trung bình

Ở desktop 1440 px, `.page-intro` của list cao **448 px** trước heading danh sách và card.
Tiêu đề “Một góc nhỏ. Nhiều điều thú vị.” tiếp tục làm vai trò giới thiệu thương hiệu.

Đề xuất dùng title chức năng “Góc chia sẻ”, một câu dẫn ngắn, rồi vào bài.
Giữ 12 bài/trang, ngày/ngôn ngữ đúng dữ liệu và ảnh/mô tả optional.
Thử các hàng bài viết hoặc grid có nhịp nhẹ; bài không ảnh vẫn hoàn chỉnh bằng typography,
không tạo thumbnail, mô tả hay ô trống để đạt độ đều.

### Detail — quan sát cao, đề xuất trung bình

Đo desktop 1440 px: hai đoạn prose đầu trong CPM rộng **850 px**, font **16 px**, line-height **31,2 px**.
Ở [bài tham khảo của Josh](https://www.joshwcomeau.com/css/anchor-positioning/), bốn đoạn được lấy mẫu rộng **686 px**,
font **18 px**, line-height **27 px** tại cùng viewport. Đây là hai implementation cụ thể, không phải chứng minh một cỡ chữ là chuẩn bắt buộc.

Đề xuất prose CPM thử khoảng 64–72ch, body 16–18 px theo viewport; ảnh/gallery có thể rộng hơn cột chữ.
H1 của bài và prose được ưu tiên, hạn chế accent ở các tiêu đề phụ.
Khối “Trong bài viết” hiện chỉ có một câu giới thiệu, chưa phải mục lục có link; bỏ hoặc đổi nhãn cho đúng vai trò.
Không tự thêm hệ thống TOC. Action/sidebar chỉ xuất hiện nếu có dữ liệu và lý do thật.

## 4. Hướng đề xuất

**Khuyến nghị:** không gian cá nhân có minh họa anime, UI navy than/ivory, typography rõ và nội dung được đưa lên sớm.
Lee Robinson hữu ích cho cách phân vai artwork/nội dung; Josh Comeau hữu ích cho phân vai trang giới thiệu và trang đọc;
Anthony Fu/Jhey hữu ích cho sự tiết chế của nhận diện.

Palette dưới đây chỉ để làm mẫu so sánh, chưa sửa token hoặc coi là approved:

| Vai trò | Màu thử | Cách dùng |
|---|---|---|
| Nền | `#11131A` | Navy than ít bão hòa; so với navy hiện có trên cùng artwork |
| Chữ chính | `#F1EEE7` | Wordmark, H1, nhãn chính; nút chính có thể dùng fill ivory/chữ tối |
| Chữ phụ | `#B9B8B2` | Đoạn mô tả và metadata |
| Nhấn tùy chọn | `#C8AD7F` | Champagne trầm, chỉ active state/chi tiết nhỏ nếu thực sự cần |

Tính contrast trên cặp màu phẳng với nền `#11131A`: ivory **16,01:1**, muted **9,33:1**, champagne **8,60:1**.
Lavender hiện tại trên cùng nền cũng đạt **10,06:1**: vấn đề chọn lavender ở đây là art direction/sở thích,
không phải thiếu contrast. Các tỷ lệ này không chứng nhận toàn bộ trang hoặc chữ trên artwork.

Phương án đối chiếu có ý nghĩa: cùng bố cục và artwork, một bản UI trung tính hoàn toàn,
một bản thêm champagne rất ít. Không cần đổi nhiều màu ngẫu nhiên hoặc thiết kế một badge mới.
Mức chắc chắn về tính phù hợp với mục tiêu CPM: **trung bình**. Về sở thích owner trước khi xem mock: **thấp**.

## 5. Trình tự xử lý đề xuất và giới hạn

1. Review hướng trung tính/ivory và mức độ nhấn màu trước; giữ các quyết định nội dung và hai nhân vật đã chốt.
2. Sửa hierarchy home/list/detail và copy lặp trong mock, với các thay đổi thứ tự/gộp section được nêu rõ để owner duyệt.
3. Kiểm tra cùng viewport, title Việt dài, zero/first-content, không ảnh, keyboard/no-JS, contrast và vị trí bắt đầu nội dung.
4. Đóng gate Phase 1 khi owner duyệt hình ảnh cùng technical contract; mới chuyển Phase 2.

Lượt này chỉ lưu nghiên cứu, chưa chỉnh mock/PRD theo hướng đề xuất hoặc mở lại các quyết định 3/12, locale, CMS và publishing.
Không có benchmark hiệu năng, user study hoặc bằng chứng hướng mới tăng engagement.
Screenshot mobile của Lee gặp `Page.captureScreenshot` timeout; request screenshot CPM tiếp theo không có kết quả trước khi dừng chờ.
Vì vậy không dùng chúng làm bằng chứng visual mobile đã review thành công. Mobile Lee có DOM/readback;
CPM có DOM và số đo hiện hành. Không suy từ text extractor trống rằng trang ZZZ không có nội dung.

Còn cần owner quyết định: mức độ thích hướng trung tính/ivory, có muốn nhấn champagne hay không,
và có chấp nhận đưa latest lên ngay sau hero/gộp phần giới thiệu để giảm lặp.
