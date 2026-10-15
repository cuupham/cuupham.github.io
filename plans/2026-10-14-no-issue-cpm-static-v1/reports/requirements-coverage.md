# CPM v1 — Coverage và verification của plan

Nguồn: [PRD hiện hành](../../../docs/prd.md). Phạm vi verification là yêu cầu/tài liệu và cấu trúc plan; không phải implementation hoặc nghiệm thu sản phẩm.
Các file `src/`, script npm, test và Actions được liệt kê trong phase là deliverable phải tạo; hiện chưa tồn tại.

## 40 hợp đồng cần kiểm tra trong draft

Mỗi dòng có owner trong phase, bước thực hiện và tiêu chí xác nhận. Evidence dưới đây ghi dòng PRD ở snapshot intake trước các bổ sung được owner duyệt; source hiện hành đã có thêm quyết định 3/12, raw HTML và publish approval nên số dòng có dịch chuyển.

| # | Phase | Hợp đồng | Evidence PRD |
|---|---|---|---|
| 1 | 1 | Brand CPM / descriptor | 41–43 |
| 2 | 1 | Hero hai nhân vật, toàn thân/chân desktop | 179–180 |
| 3 | 1 | Mobile rõ hai mặt, crop theo mock duyệt | 181–182 |
| 4 | 1 | Soft light, navy/cyan, manifesto cream | 183–185 |
| 5 | 1 | Collection artwork riêng | 186–187 |
| 6 | 1 | Không badge/workflow/placeholder giả | 188–190 |
| 7 | 1 | Be Vietnam Pro / Chakra Petch đọc dấu Việt | 191–192 |
| 8 | 1 | Không CMS/backend/database/advanced filter | 52–54, 210–212 |
| 9 | 1 | Cần thiết kế list/detail/mobile và số bài/pagination | 300 |
| 10 | 1 | Route/schema/date/media/performance là detail engineering | 301–305 |
| 11 | 2 | ID/lang/title/date/body required | 78–84 |
| 12 | 2 | Optional không suy đoán, không block rỗng | 85–91, 250 |
| 13 | 2 | Duplicate ID/route và thiếu body/data fail | 248–249 |
| 14 | 2 | BCP language độc lập UI locale | 149–156 |
| 15 | 2 | Date descending, ID tie-break nhất quán | 95, 99–100 |
| 16 | 2 | Future date vẫn hiện, không scheduler | 96–98, 251–252 |
| 17 | 2 | Draft source và draft-only assets không emit | 115–122 |
| 18 | 2 | HTTPS/internal, reject schemes/controls/credentials | 134–136 |
| 19 | 2 | Schema/registry/components là SSOT | 91, 160–163, 213–214 |
| 20 | 2 | Astro static và source Git làm input publish | 104–111, 210–215 |
| 21 | 3 | Zero/draft-only không list routes/latest/list link | 126–130 |
| 22 | 3 | First content tự hiện latest và list | 128–129 |
| 23 | 3 | Hai UI cùng ID/count/order | 129, 259–260 |
| 24 | 3 | Switch locale giữ bài/context | 152–156, 163 |
| 25 | 3 | html UI lang, article content lang | 169–173, 261 |
| 26 | 3 | No-JS readable và locale anchors thật | 164–165, 263–264 |
| 27 | 3 | Semantic/keyboard/focus/contrast/reduced motion | 196–200, 271–273 |
| 28 | 3 | Responsive optimized images, lazy dưới fold, dimensions | 236–237, 287–290 |
| 29 | 3 | Metadata/canonical/alternate đúng ngôn ngữ thật | 169–173, 230 |
| 30 | 3 | Custom 404 thật, useful navigation | 235 |
| 31 | 4 | Direct home/list/detail và refresh Pages | 231, 279 |
| 32 | 4 | Artifact mới sạch mỗi deploy | 232–233 |
| 33 | 4 | Xóa bài/last post: detail/list cũ 404 sau deploy | 280–281 |
| 34 | 4 | Build/check fail không thay site cũ | 234, 282 |
| 35 | 4 | Check artifact và request draft/private asset, shared asset còn | 253–254 |
| 36 | 4 | MDX import/component owner review như code | 109–111, 255 |
| 37 | 4 | Unaccepted PR không secrets/deploy permissions | 110, 255 |
| 38 | 4 | Home/list/detail ở 375/768/1440 + landscape | 203–204, 268–270 |
| 39 | 4 | Bytes/time đo mạng thật và môi trường, budget sau baseline | 291–296 |
| 40 | 4 | Link thật nghiệm thu; network outage ngoài không cứng build | 222–226, 277–283 |

## Gate chưa chạy khi lập plan

- Chưa có source Astro/npm scripts để chạy check/build/test.
- Chưa có list/detail/mobile mock bổ sung được owner duyệt.
- Chưa chuyển source Pages sang Actions hoặc deploy CPM.
- Chưa có nội dung thật để nghiệm thu live lifecycle thêm/gỡ bài.
- Không đánh dấu checkbox phase hoàn thành chỉ vì plan pass format/link/contract review.

Kết quả review draft và sweep cuối ghi tại `plan-review.md` trong thư mục này.
