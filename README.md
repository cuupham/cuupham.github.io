# cuupham.github.io

[PRD CPM](docs/prd.md) — yêu cầu sản phẩm và phạm vi website chia sẻ cá nhân.

[Kế hoạch triển khai CPM v1](plans/2026-10-14-no-issue-cpm-static-v1/plan.md) — các phase, hợp đồng kỹ thuật đề xuất và tiêu chí nghiệm thu.

[Mockup trang chủ](mockups/cpm-portfolio/index.html) — tham chiếu giao diện, mở trực tiếp bằng trình duyệt.

Mock đã chọn: [B — Champagne](mockups/cpm-portfolio/champagne/home-mobile.html). [A — Trung tính](mockups/cpm-portfolio/home-mobile.html) giữ để đối chiếu.

[Hợp đồng kỹ thuật](docs/cpm-v1-technical-contract.md) đã được duyệt cho Phase 2.

## Phát triển local

Dùng Node theo [.node-version](.node-version), sau đó `npm ci`.

- `npm run dev`: Astro tại `http://127.0.0.1:4321`.
- `npm run check`: raw content preflight và Astro/TypeScript diagnostics.
- `npm run test:unit`: kiểm tra schema/source/asset/locale trong thư mục tạm.
- `npm run test:artifact`: build và kiểm tra route/SEO/locale/add-remove trong OS temp; kiểm tra CI boundary và verify fail propagation.
- `npm run build`: preflight → manifest asset reachable → dọn `dist/` đã kiểm tra → Astro → artifact gate.
- `npm run verify`: check → unit → artifact scenarios → production build cuối; dừng ngay khi một bước lỗi.
- `npm run preview`: xem output build tại `http://127.0.0.1:4321`.

Bài thật nằm ở `src/content/posts/<id>.md|mdx`; [mẫu bài](content-templates/post.md) không thuộc tập publish.
Nháp và asset riêng của nháp nằm ở `drafts/`. Khi tập bài rỗng, production chỉ có home B champagne và 404,
không tạo list/detail. Không upload toàn repository lên Pages; chỉ `dist/` sau các gate.

[Phát hành và rollback](docs/publishing-and-rollback.md) mô tả fixture preview, CI, source switch, exact SHA/artifact approval
và phần live còn pending. Pages đã chuyển sang Actions; source đã merge vào main.
[Release đầu](plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-first-release.md) đang chờ owner duyệt đúng artifact đã build.
