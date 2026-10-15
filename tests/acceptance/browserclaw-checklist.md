# CPM — BrowserOS neo local acceptance

Ngày 2026-10-15. BrowserOS neo, Chromium 155 trên Windows. Chỉ dùng neo, không Playwright/Chrome DevTools MCP.
Các lệnh `cdp` là API của chính BrowserOS neo. Preview `127.0.0.1:4321`, artifact tĩnh trong OS temp có marker,
không phải source bài public/production dist. Không suy ra HTTP Pages hoặc cross-engine behavior từ kết quả này.

## Đã kiểm tra

- VI home/list/full detail: 375×812, 768×1024, 1440×900, 812×375, 1024×768, 900×1440.
- EN home/list/JA MDX detail: cùng 6 viewport; tổng 36 tổ hợp. Không horizontal overflow hoặc broken image phát hiện;
  mỗi trang có một h1. Bài JA trong wrapper EN vẫn `article[lang=ja]` và nguyên body.
- Prose 680 px ở desktop/tablet, 347 px tại 375; artwork rộng hơn ở detail. Optional blocks thiếu không tạo figure/action rỗng.
- Screenshot desktop 1440×1000: cả hai nhân vật toàn thân/đủ chân, không che chữ/CTA. Screenshot mobile 375×812:
  cả hai mặt rõ, phần thân dưới crop trong art stage 270 px; CTA kết thúc y490, art bắt đầu y514.
- Native select EN list page 2 → VI giữ page 2/ID13. Tắt JS/reload, fallback EN page 2 → detail13 → VI detail13
  giữ đúng ID; select enhance ẩn. JS đã được bật lại sau kiểm tra.
- Native select detail có fragment giữ `#n%E1%BB%99i-dung` khi sang EN. No-JS checks chứng minh ID/page context,
  không khẳng định fallback HTML tự đọc/giữ fragment hiện tại khi JavaScript tắt.
- 14 Tab stops trên list có outline solid 2 hoặc 3 px; reduced motion cho scroll auto và transition 0s.
- Contrast từ sRGB tokens: ivory/navy 16,01:1; muted trên phần hero sáng nhất 7,40:1;
  champagne/navy 8,60:1; cream body 5,81:1. Đây là kiểm màu token, không phải pixel/full WCAG certification.
- Embed trước click: 0 iframe, 0 resource request tới YouTube. Sau click: đúng một iframe HTTPS, title Big Buck Bunny.
  Đây là deferred creation proof, không phải playback/provider uptime proof.
- Audio có controls/preload none; fixture WAV sinh hợp lệ để kiểm emission. Chưa kiểm âm thanh trên thiết bị thật.
- Recheck artifact cuối sau khi bổ sung heading danh sách: VI/EN list × 6 viewport (12 tổ hợp), một h1/một h2,
  12 cards, không overflow/broken image. 404 có zero canonical/alternate và không đánh dấu Home đang active;
  HTTP preview missing route/page-1 alias trả 404, root trả 200.
- Zero-content artifact cuối: VI/EN home × cùng 6 viewport (12 tổ hợp), một h1, không cards/link danh sách,
  không overflow/broken image. Production build riêng vẫn có đúng 4 HTML/16 files.

## Performance baseline tham khảo

375×812, CPU throttle 4×, Network latency 150 ms, download 200.000 bytes/s, upload 75.000 bytes/s;
CDP network cache disabled, font cache của profile vẫn ấm. Site là localhost static fixture 13 bài.
Navigation resource size 7.018 bytes; tài nguyên nội bộ 286.223 bytes trong 7 requests;
tổng nội bộ kể cả document **293.241 bytes**. LCP buffered entry **1.540 ms**, candidate IMG;
load/navigation duration **3.927 ms**. Đây là một mẫu đo, không percentile, không Pages live hoặc Lighthouse score.
Cross-origin/font cache giới hạn tổng transfer có thể biết; không gọi mẫu này là fully cold font/network measurement.

Owner đã chọn “Chờ số đo Pages live rồi mới chốt budget”. Không áp mốc 400 KB/2,5 s từ đề xuất local.
Network/CPU/cache emulation đã được restore sau đo.

## Giới hạn

- Chưa real-device, cross-engine/native-select fallback ở browser khác, screen reader audit hoặc full WCAG certification.
- Live HTTP status, production perf/caching/CDN, actual CI permissions và authorized add/remove lifecycle còn pending.
- Preview processes do lượt này tạo đã được dừng; command/PID/root/port và kiểm tra giải phóng port ghi trong phase report.
