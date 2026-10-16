# PRD — CPM Personal GitHub Pages

**Trạng thái:** Đã duyệt
**Ngày:** 2026-10-14
**Đối tượng:** Chủ sở hữu sản phẩm và các agent triển khai
**Phạm vi tài liệu:** Ý định sản phẩm, quyết định đã chốt, yêu cầu v1 và tiêu chí nghiệm thu

## 1. Kết quả mong muốn

CPM là một không gian cá nhân để chủ sở hữu giới thiệu và chia sẻ những điều mình thấy thú vị.
Trang phải tạo cảm giác có cá tính, nhưng không biến thành cửa hàng, trang quảng bá thương mại,
hay một danh mục sản phẩm giả khi chưa có nội dung thật.

V1 cần biến mock home đã được chấp nhận thành một site tĩnh có thể xuất bản trên GitHub Pages,
đồng thời tạo đường đi rõ ràng cho bài viết hoặc sản phẩm thật trong tương lai.

Thành công của v1 được đánh giá bằng trải nghiệm người dùng, tính trung thực của nội dung,
khả năng mở rộng nội dung đa ngôn ngữ và các đường dẫn thật — không bằng số lượng tính năng.

## 2. Bối cảnh và bằng chứng hiện tại

Production UI dùng [design tokens](../src/styles/tokens.css), các component Astro trong `src/components/`,
layout trong `src/layouts/` và route pages trong `src/pages/`. Hợp đồng route/schema/SEO nằm trong
[hợp đồng kỹ thuật](cpm-v1-technical-contract.md); các script build và artifact là nguồn kiểm tra thực thi.
Reference fixture chỉ là tài liệu local, không thuộc source publish hoặc artifact.

## 3. Định vị, người dùng và giọng điệu

### Đã chốt

- Brand: **CPM**.
- Descriptor: **Independent Digital Creator**.
- Chủ sở hữu là người kể chuyện và người chọn nội dung; site không giả lập một công ty hay marketplace.
- Nội dung có thể đến từ phần mềm, web, video, phim, Blender, tài nguyên hoặc bài viết trong tương lai,
  nhưng UI công khai không được liệt kê cứng các nhóm này.
- Copy dùng cách nói tổng quát, đủ linh hoạt cho nhiều loại nội dung và không hứa hẹn dự án chưa tồn tại.
- Tinh thần hình ảnh lấy cảm hứng từ anime/game nguyên bản; Genshin, HSR và ZZZ chỉ là tham chiếu phong cách,
  không phải nội dung, thương hiệu, cốt truyện hoặc sản phẩm được quảng bá.

### Không phải mục tiêu

- Không bán hàng, thu tiền, xác thực tài khoản, bình luận, newsletter hay quảng cáo.
- Không đặt CMS, backend, database, search hoặc bộ lọc nâng cao vào v1.
- Không áp đặt một game 3D hoặc trải nghiệm 3D như một phần bắt buộc của sản phẩm.
- Không ép thành một quy trình “ideate — build — share” có đánh số.
- Không tạo dữ liệu dự án, nút hành động, bản dịch hoặc download giả để lấp khoảng trống.
- Không tuyên bố production-ready, số đo hiệu năng, hosting asset hay trạng thái release khi chưa có bằng chứng.

## 4. Phạm vi v1

V1 bao gồm:

1. Home giữ lại tinh thần và cấu trúc của mock đã chấp nhận.
2. Trang danh sách nội dung, chỉ sinh khi toàn site có bài được đưa lên website theo quy tắc ở mục 5.
3. Trang detail cho từng nội dung thật.
4. Liên kết trải nghiệm hoặc download thật, có nhãn phù hợp với dữ liệu có sẵn.
5. VI mặc định và EN cho UI; registry locale mở rộng được.
6. Build Astro static qua GitHub Actions và xuất bản trên GitHub Pages.
7. 404 thật, metadata SEO theo locale, asset tối ưu và kiểm tra dữ liệu/link trong build.

Phạm vi không bao gồm việc tạo nội dung thật, upload binary, cấu hình provider hiện tại hoặc thay đổi repository
ngoài những gì cần để site static build và deploy theo hợp đồng sau khi được duyệt.

## 5. Nội dung và cách đưa bài lên website

### Dữ liệu tối thiểu của mỗi bài

| Dữ liệu | Yêu cầu |
|---|---|
| ID | Bắt buộc, ổn định và duy nhất; có thể lấy từ tên file. Đổi tiêu đề không tự đổi ID/URL. |
| Mã ngôn ngữ bài | Bắt buộc, xác định ngôn ngữ nội dung; độc lập với ngôn ngữ giao diện. |
| Tiêu đề | Bắt buộc, không rỗng. |
| Ngày đăng | Bắt buộc, ngày hợp lệ; dùng hiển thị và sắp xếp. |
| Nội dung | Bắt buộc, không rỗng; Markdown mặc định, MDX khi cần component. |
| Mô tả ngắn, ảnh, gallery, video/media, ngày cập nhật | Tùy chọn; phần thiếu không tạo khung hoặc dữ liệu giả. |
| Link trải nghiệm/tải xuống | Tùy chọn; mỗi action có mặt cần nhãn và URL hợp lệ. |
| Platform/version | Tùy chọn, chỉ hiện khi có dữ liệu; không bắt buộc bài là sản phẩm phần mềm. |

Không bắt buộc phân loại sản phẩm, cặp bản VI/EN, ID nhóm dịch hoặc trạng thái quản trị.
Danh sách giới thiệu bài bằng tiêu đề; mô tả và ảnh chỉ xuất hiện khi có dữ liệu.
Schema có một nguồn dùng chung cho kiểm tra nội dung, danh sách, detail và SEO.

### Thứ tự và ngày đăng

- Bài mới nhất trước theo ngày đăng; cùng ngày dùng ID để giữ thứ tự ổn định.
- Ngày đăng là metadata, không phải lịch hẹn giờ. V1 không có scheduler.
- Bài thuộc tập nội dung của website được đưa lên sau build/deploy thành công, không tự ẩn hoặc chờ đến ngày ghi trong file.
- Loại file nháp trước khi tính số bài, sắp xếp hoặc chọn bài mới nhất; không lọc theo ngôn ngữ giao diện.
- Định dạng ngày, chuẩn hóa timezone và chiều tie-break theo ID phải nhất quán trong schema và [hợp đồng kỹ thuật](cpm-v1-technical-contract.md);
  không xem đây là tính năng hẹn giờ.

### Cách chủ sở hữu thêm bài

Chủ sở hữu thêm hoặc sửa file Markdown/MDX, asset và link thật trong repo. Khi thay đổi được đưa vào
nhánh triển khai đã cấu hình, GitHub Actions kiểm tra, build và deploy site tĩnh.
Không có trang quản trị hoặc thao tác bấm nút công bố trên website.
Mẫu bài giúp điền đúng dữ liệu, không yêu cầu sửa layout cho từng nội dung.

Markdown là cách viết mặc định. MDX được review như code, gồm component/import, trước khi chủ sở hữu chấp nhận.
Raw HTML trong Markdown hiển thị như text đã escape; rich HTML/component dùng MDX theo quy tắc review code này.
PR chưa được chấp nhận không được cấp secret hoặc quyền deploy; chỉ source đã được chấp nhận mới đi vào pipeline triển khai.
Không thêm CMS, sandbox hay hệ thống moderation.

### Tập nội dung website và file nháp

Bài được đưa lên website và file nháp được tách bằng quy tắc nguồn do cấu hình build quản lý.
Không bắt buộc thêm field trạng thái quản trị vào metadata mỗi bài.

- Bài thuộc tập đưa lên website tham gia danh sách, detail, SEO và phần mới nhất.
- File nháp và asset chỉ dùng cho nháp không được đưa vào output triển khai, kể cả khi không có link tới chúng.
- Asset dùng chung với bài đã đăng vẫn được giữ. File ở thư mục pass-through phải được xem là public;
  không để ảnh riêng của nháp ở đó rồi chỉ lọc file bài.
- File nháp trong public Git không phải dữ liệu riêng tư; không lưu secret hoặc nội dung cần bảo mật trong repo.

### Trang chủ và danh sách theo số bài toàn site

- Không có bài: giữ home theo mock; ẩn khu vực nội dung mới và link danh sách, không tạo card hoặc thông báo chờ giả.
  Không sinh trang danh sách ở cả giao diện VI/EN; request URL danh sách trả 404 thật.
- Có bài đầu tiên: home tự hiện nội dung mới và link tới danh sách.
- Home hiển thị tối đa 3 bài mới nhất; danh sách có 12 bài/trang với phân trang static.
- Danh sách và thứ tự bài giống nhau khi đổi VI/EN, kể cả toàn bộ bài chỉ viết bằng tiếng Việt.
- Chỉ có file nháp vẫn được coi là chưa có bài trên website.

### Link trải nghiệm và tải xuống

Action chỉ hiện khi có dữ liệu thật. URL external phải là HTTPS hoặc đường dẫn nội bộ hợp lệ;
chặn URL thực thi như `javascript:`, `data:`, `file:`, credential trong URL và ký tự điều khiển.
Không dùng URL protocol-relative để né kiểm tra scheme.

Link ngoài mở tab mới với `rel` an toàn. Không tự mở link hoặc tải file khi người đọc vào trang.
Platform/version chỉ hiển thị khi có dữ liệu; không bắt buộc checksum/signature hoặc provider cụ thể.

Binary lớn có thể được lưu ở nơi phát hành phù hợp, ví dụ GitHub Releases; bài tham chiếu link file/release thật,
rõ phiên bản khi có. Đây không phải xác nhận hosting đã cấu hình.
External embed là khả năng tùy chọn; tải khi cần và cân nhắc privacy, không tự đưa vào mọi bài.

## 6. Ngôn ngữ giao diện và ngôn ngữ bài

### Hai khái niệm độc lập

- Ngôn ngữ giao diện: VI mặc định, EN là lựa chọn thứ hai. Điều khiển navigation, nhãn nút, footer và các chữ của website.
- Ngôn ngữ bài: mã ngôn ngữ gắn với từng file bài; điều khiển nhãn ngôn ngữ nội dung và semantics của phần bài.
  Mã này không bắt buộc thuộc các ngôn ngữ giao diện website đang hỗ trợ.
- Đổi VI/EN giữ nguyên bài đang đọc, tập bài và thứ tự danh sách; không lọc, dịch hoặc thay nội dung bài.
- Ví dụ: giao diện EN vẫn hiển thị bài VI với nhãn rõ như “Content language: Vietnamese”.
  Có bài VI thì danh sách trong giao diện EN vẫn tồn tại dù không có bài viết bằng EN.
- Không bắt buộc tạo bản dịch cho mỗi bài. Không có chính sách “thiếu bản dịch” cản người đọc đổi giao diện.
  Bài thực sự viết bằng EN hoặc ngôn ngữ khác vẫn là nội dung độc lập có ID/ngôn ngữ riêng.

### Bộ chọn và SSOT

- Dùng native `<select>` có accessible label, không dùng hai nút VI/EN hoặc chuỗi mã ngôn ngữ trong footer.
- Registry ngôn ngữ giao diện và dictionary UI dùng chung; thêm ngôn ngữ không nhân bản danh sách trong từng template.
- Dữ liệu bài chứa mã ngôn ngữ nội dung, không hardcode nhãn “tiếng Việt” cho tất cả bài.
- Chuyển giao diện qua route static đã chốt trong [hợp đồng kỹ thuật](cpm-v1-technical-contract.md), luôn giữ cùng ID bài.
- Đã chốt prefix cả VI `/vi/` và EN `/en/`; root `/` dẫn về VI mặc định bằng HTML redirect có link thật. Danh sách/detail/pagination nằm dưới prefix tương ứng; không sinh root content aliases.
- Khi JavaScript tắt, nội dung và link chính vẫn hoạt động; cung cấp liên kết đổi giao diện thật trong fallback.
  Không coi select đổi giá trị là đã điều hướng nếu chưa có hành vi tương ứng.

### Semantics và SEO

Document dùng ngôn ngữ giao diện; phần nội dung bài khai báo ngôn ngữ thực của bài.
Tiêu đề, mô tả và nội dung bài không bị gắn nhãn như bản dịch EN chỉ vì giao diện chuyển EN.
Metadata lấy từ nội dung thật; mô tả có thể lấy từ mô tả ngắn nếu có hoặc đoạn trích bài theo quy tắc chung.
Canonical và alternate phải trỏ route có thật và phân biệt biến thể giao diện với bản dịch nội dung;
  quy tắc URL/SEO cụ thể nằm trong [hợp đồng kỹ thuật](cpm-v1-technical-contract.md).

## 7. Hệ thống hình ảnh và giao diện

### Quyết định đã chốt từ mock

- Giữ hero desktop với hai asset nhân vật nam/nữ anime nguyên bản hiện có.
- Desktop giữ toàn thân hai nhân vật và bàn chân, không bị lớp trang trí che.
- Mobile/tablet giữ rõ cả hai gương mặt, không che nhau/chữ/CTA; được crop thân dưới theo mock mobile được chủ sở hữu duyệt.
  Không ép full body làm hero mobile quá dài và không dùng overflow hidden để che lỗi bố cục.
- Dùng ánh sáng mềm đồng nhất; loại bỏ các dải spotlight chéo.
- Nền chính navy, vùng cream và accent tiết chế. Owner đã yêu cầu bỏ cyan cùng badge ngũ giác bọc CPM ngày 2026-10-15;
  mock dùng wordmark CPM bằng chữ. Ngày 2026-10-15, owner chọn bản B nhấn champagne `#c8ad7f`
  cho nút chính và chi tiết nhỏ; heading/body giữ ivory trên nền navy than theo mock B hiện hành.
- Giữ khoảng thở và vùng manifesto màu cream như một nhịp thị giác.
- Artwork phía dưới phải khác hero, dùng `collection-observatory.png` làm hình minh họa trang trí,
  không mô tả một sản phẩm đã phát hành.
- Không thêm badge hero `01`, dấu cộng trang trí, section chờ placeholder, workflow đánh số,
  banner GitHub khổng lồ hoặc block username.
- Footer tối giản, chỉ giữ link thật và back-to-top khi link đó có giá trị.
- Body dùng Be Vietnam Pro; display dùng Chakra Petch như reference hiện tại và phải an toàn với dấu tiếng Việt,
  line-height đủ đọc được.

### Quy tắc trải nghiệm

- Motion tiết chế, tắt hoặc giảm theo `prefers-reduced-motion`.
- Semantic HTML, thứ tự heading hợp lý, keyboard navigation và focus visible là bắt buộc.
- Contrast text: tối thiểu 4.5:1 cho text thường và 3:1 cho text lớn.
- Không giấu main content hoặc nội dung cốt lõi sau JavaScript.
- Customizable `base-select` chỉ là progressive enhancement trong browser hỗ trợ; browser khác dùng native fallback.
- Không dùng background autoplay video.

Layout phải được kiểm tra ở viewport mobile, tablet, desktop và landscape; production acceptance dùng browser evidence theo runbook.

## 8. Biên giới kỹ thuật sản phẩm

### Đã chốt

- Nội dung mặc định là Markdown; MDX chỉ dùng rich component khi component đó có trong repository và có lý do.
- Astro static là hướng build và GitHub Actions là hướng publish cho GitHub Pages.
- Không có CMS, backend hoặc database trong v1.
- Layout/component Astro dùng chung là SSOT; design tokens, schema, locale registry và action URL lấy từ data,
  không hardcode lặp trong từng page.
- HTML+JS fallback của thiết kế tham chiếu không phải yêu cầu phải giữ nguyên như production architecture.

### Ràng buộc implementation hiện hành

- Trường dữ liệu, thư mục nguồn, schema executable và route production được triển khai theo
  [hợp đồng kỹ thuật](cpm-v1-technical-contract.md), với schema tại `src/lib/content-contract.ts` và routes tại `src/lib/routes.ts`.
- Build fail rõ cho data invalid, link external/local không hợp lệ và reference asset không tồn tại qua
  `scripts/check-content.mjs`, `scripts/build.mjs` và artifact checks. External outage không là dependency cứng của build.

## 9. SEO, deploy và vận hành nội dung

- Mỗi public page có title, description, canonical/alternate locale phù hợp với dữ liệu thực tế.
- Direct detail route phải hoạt động khi mở mới và refresh trên GitHub Pages; bài nháp không có URL public.
- Mỗi deploy dùng artifact mới tạo sạch, không chồng lên output cũ. Xóa bài khỏi tập nội dung và deploy thành công
  thì URL detail cũ trả 404 ở cả giao diện; xóa bài cuối cùng thì URL danh sách ở cả VI/EN cũng trả 404.
- Build/check thất bại không thay site đang hoạt động bằng bản lỗi. Không hứa URL biến mất trước khi deploy mới thành công.
- 404 phải là page thật, có điều hướng hữu ích và không giả dạng content detail.
- Ảnh được nén, có kích thước/nguồn responsive phù hợp mobile/desktop; ảnh dưới fold tải khi cần.
  Đặt kích thước hoặc aspect ratio để hạn chế nhảy bố cục. Font ngoài có fallback local/system.
- GitHub Actions là pipeline build/deploy static theo cấu hình được duyệt; release phải gắn source SHA và artifact approval.
- Release cần có bằng chứng source/artifact đã được chủ sở hữu chấp nhận; push vào nhánh triển khai tự nó không thay thế review. Environment owner-only và manual release approval là boundary hiện hành.
- Link GitHub hoặc release chỉ xuất hiện khi là link thật và đúng ngữ cảnh; không dùng username block để thay nội dung.

## 10. Tiêu chí nghiệm thu

### Dữ liệu, danh sách và file nháp

- Không có bài hoặc chỉ có nháp: home VI/EN giữ mock, không có card chờ/link danh sách;
  request trực tiếp URL danh sách trả 404.
- Thêm bài thật đầu tiên và deploy thành công: home hiện nội dung mới; cả giao diện VI/EN có cùng danh sách.
- Mỗi bài cần ID, mã ngôn ngữ nội dung, tiêu đề, ngày đăng và body hợp lệ; thiếu dữ liệu bắt buộc,
  trùng ID/route, asset thiếu hoặc action có nhãn nhưng URL không hợp lệ làm check/build báo lỗi rõ và không deploy bản lỗi.
- Mô tả/cover/media/action không có dữ liệu thì không tạo khối rỗng, URL giả hoặc giá trị suy đoán.
- Sắp ngày mới nhất trước, cùng ngày có tie-break ID ổn định. Ngày tương lai không tạo cơ chế hẹn giờ;
  bài thuộc tập nội dung site vẫn hiện sau deploy thành công.
- Trong artifact mới, không có HTML/SEO/list item hoặc file asset chỉ thuộc nháp. Request URL nháp/asset riêng trả 404;
  kiểm tra artifact và request trực tiếp, không chỉ kiểm tra link trong HTML. Asset chung với bài đã đăng vẫn hoạt động.
- MDX thêm component/import chỉ được đưa lên từ source owner đã review; job PR chưa được chấp nhận không có quyền deploy/secret.

### Ngôn ngữ giao diện và nội dung

- Có bài VI: đổi giao diện sang EN vẫn đọc đúng bài VI, body/title không thay, nhãn ngôn ngữ bài thể hiện đúng VI.
- Danh sách VI/EN có cùng ID, số bài và thứ tự; đổi select không làm lọc bài hoặc mất context đang đọc.
- Document khai báo ngôn ngữ giao diện, phần article khai báo ngôn ngữ bài; không giả vờ có bản dịch chưa tồn tại.
- Thêm UI locale qua nguồn dùng chung không phải sửa chuỗi mã locale tại footer hoặc lặp danh sách trong từng page.
- Tắt JavaScript: main content và link thật vẫn hoạt động; fallback có liên kết locale thực để đổi giao diện,
  không yêu cầu JavaScript để đọc bài.

### Responsive, accessibility và motion

- Kiểm tra home/list/detail ở 375, 768, 1440 px và landscape: không tràn ngang ngoài chủ ý; chữ/link/action không bị che.
- Desktop thấy toàn thân/chân cả hai nhân vật; mobile/tablet thấy rõ hai mặt và không che nhau/chữ/CTA.
  Crop thân dưới chỉ theo mock mobile đã duyệt, không tự cắt phần mặt để đạt kiểm tra overflow.
- Keyboard đi qua navigation/select/card/action/footer có thứ tự hợp lý và focus visible, không bị khóa bởi style custom.
- Reduced motion giảm/tắt chuyển động không cần thiết; contrast tối thiểu 4.5:1 cho text thường, 3:1 cho text lớn.
- Khi browser không hỗ trợ customizable select, native fallback vẫn chọn được và có accessible label.

### Link, deploy và gỡ bài

- Action HTTPS/internal hợp lệ mở đúng đích; link ngoài mở tab mới an toàn. Không tự tải file khi vào trang.
  URL thực thi hoặc dữ liệu thiếu bị check từ chối, platform/version không có thì không tự điền.
- Mở trực tiếp và refresh home/list/detail hoạt động trên GitHub Pages; route không tồn tại trả 404 thật.
- Kiểm tra chuỗi thêm bài → deploy → xóa bài → deploy: URL cũ trả 404 và không còn file detail trong artifact mới.
  Xóa bài cuối cùng: danh sách VI/EN trả 404; home vẫn hoạt động.
- Build/check thất bại giữ site cũ; không báo việc gỡ bài thành công khi artifact mới chưa deploy.
- URL external tạm unavailable không làm build phụ thuộc cứng vào dịch vụ ngoài; nghiệm thu mở link thật để kiểm tra đích.

## 11. Tối ưu ảnh và hiệu năng

- Tối ưu/nén ảnh và nguồn kích thước phù hợp viewport; không coi PNG gốc của mock là asset production đã tối ưu.
- Artwork dưới màn hình đầu tải khi cần; hero ưu tiên tải phù hợp vì là nội dung thị giác đầu tiên.
- Khai báo kích thước/aspect ratio để giữ layout ổn định; kiểm tra không nhảy chữ/nút khi ảnh hoặc font tải xong.
- Không tải JavaScript/media không cần thiết để đọc nội dung. Font có fallback; không background autoplay video.
- Khi nghiệm thu, ghi dung lượng ảnh thực tải và thời gian tải ở mobile/desktop, kèm viewport,
  điều kiện mạng/thiết bị và cách đo. Không dùng kích thước source file để thay cho bytes thực tải.

Budget lab hiện hành là same-origin decoded bytes ≤300,000 và median lab LCP ≤2,500 ms dưới profile đã ghi trong
runbook. Đây là ngưỡng lab được owner ủy quyền chọn theo best practice 2026; không phải field/Core Web Vitals p75,
Lighthouse hay cold-font claim.

## 12. Các điểm maintainer cần giữ

1. Giữ tối đa 3 bài mới trên home, 12 bài/trang và route prefix `/vi/`, `/en/` như hợp đồng kỹ thuật.
2. Giữ source boundary, schema, URL validator, SEO wrapper và artifact gate qua các nguồn executable hiện hành.
3. Chỉ thêm MDX component/import khi source được review; không đưa fixture, nháp hoặc asset riêng nháp vào publish.
4. Binary/release chỉ được link khi có URL thật và ngữ cảnh rõ ràng.
5. Lifecycle gỡ bài phải hoàn tất bằng artifact/deploy thứ hai và hậu kiểm route cũ trước khi gọi v1 đã nghiệm thu.

Các điểm trên là chi tiết triển khai, không mở lại mô hình ngôn ngữ giao diện độc lập ngôn ngữ bài,
không lọc danh sách khi đổi VI/EN, không trang quản trị/CMS/backend v1, không scheduler,
quy tắc zero-content/nháp/gỡ bài, bộ chọn native và tính trung thực của nội dung/link.

## 13. Tài liệu tham khảo

Các liên kết dưới đây là tài liệu hỗ trợ để implementation agent đọc; PRD không coi chúng là bằng chứng rằng
API, workflow hoặc deploy hiện tại đã được live verify:

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro deploy lên GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [MDN Customizable select](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select)

## 14. Tài liệu triển khai

[Hợp đồng kỹ thuật](cpm-v1-technical-contract.md) cụ thể hóa schema, routes và các bất biến của sản phẩm.
[Hướng dẫn phát hành](publishing-and-rollback.md) quy định source/artifact approval, rollback và kiểm tra sau deploy.
