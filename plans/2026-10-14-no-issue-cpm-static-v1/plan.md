---
title: "CPM static v1"
description: "Triển khai CPM thành site Astro tĩnh trung thực với nội dung thật, UI VI/EN độc lập ngôn ngữ bài và GitHub Pages an toàn."
status: in-progress
priority: P2
effort: 43h
branch: codex/anime-portfolio-concept
tags: [feature, frontend, infra]
blockedBy: []
blocks: []
created: 2026-10-14
---

# CPM static v1

## Kết quả

Biến home mock đã duyệt thành site Astro static trên GitHub Pages, không tạo bài, action hay release giả. Site có home, list/detail theo dữ liệu thật, UI VI/EN không đổi body/ngôn ngữ bài, 404/SEO đúng route, artifact sạch và pipeline không trao quyền deploy cho source PR chưa được chấp nhận.

## Phạm vi và ràng buộc

- PRD là hợp đồng sản phẩm hiện hành; mock chỉ là tham chiếu hình ảnh, chưa chứng minh responsive/deploy/accessibility (`docs/prd.md:20`, `docs/prd.md:34`).
- Không CMS/backend/database/search/filter, không scheduler, không nội dung public giả (`docs/prd.md:53`, `docs/prd.md:96`).
- Owner đã chốt 3 bài mới, 12 bài/trang và prefix cả `/vi/`, `/en/`; root là static redirect về `/vi/`. Field/schema, date normalization, canonical và mock mobile được hoàn thiện qua Phase 1; policy review giữ trạng thái trong log hiện hành.
- Các phase chạy tuần tự; Phase 2 chờ gate hình ảnh/hợp đồng Phase 1, Phase 3 chờ contract/test dữ liệu, Phase 4 chờ site và artifact checks.

## Luồng dữ liệu đích

Markdown/MDX + local assets → raw collision/security/asset-graph checks → Astro collection schema → sort toàn site → route registry VI/EN → layouts/pages/SEO → clean dist → artifact checks → Pages artifact → owner-approved deploy.

Draft nằm ngoài loader và mọi public dependency root; ngôn ngữ UI chỉ chọn wrapper/route, còn language, title và body của bài giữ nguyên (`docs/prd.md:114`, `docs/prd.md:149`).

## Context

- [PRD hiện hành](../../docs/prd.md)
- [Mock contract](../../mockups/cpm-portfolio/README.md)
- [Research repository và official docs](./research/repository-and-official-docs.md)
- [Validation và review đã áp dụng](./reports/plan-review.md); [coverage 40 hợp đồng PRD](./reports/requirements-coverage.md)
- [Artifact Phase 1 và kiểm tra mock](./reports/phase-01-mock-verification.md); [technical contract để review](../../docs/cpm-v1-technical-contract.md)

## Phases

| # | Phase | Trạng thái | Phụ thuộc | Effort (ước tính) |
|---|---|---|---|---|
| 1 | [Chốt hợp đồng và mock review](./phase-01-start.md) | Done | — | 5h |
| 2 | [Astro, content contract và locale routes](./phase-02-astro-content-locale.md) | Done | Phase 1 được owner duyệt | 12h |
| 3 | [Pages, assets và shared UI](./phase-03-pages-assets-ui.md) | Done | Phase 2 xanh | 16h |
| 4 | [Nghiệm thu và chuyển Pages sang Actions](./phase-04-verification-deployment.md) | In progress | Phase 3 xanh; owner duyệt provider/publish | 10h |

## Tiêu chí hoàn tất toàn plan

- [x] Owner duyệt contract và mock list/detail/mobile trước production UI.
- [ ] Unit/content/artifact gates chứng minh zero-content, first-content, locale parity, collision, draft isolation, URL/asset validation và clean deletion.
- [ ] BrowserClaw chứng minh keyboard/no-JS/responsive/route thật; số đo hiệu năng được ghi trước khi đề xuất budget.
- [ ] PR checks không secret/quyền deploy; deploy chỉ từ source main đã chấp nhận và artifact mới tạo sạch.
- [ ] Nếu chưa có bài thật được owner cho phép publish rồi gỡ, giữ lifecycle live ở trạng thái pending và không tuyên bố v1 đã nghiệm thu.

## Rollback tổng

Mỗi phase có rollback riêng. Release giữ snapshot cấu hình/artifact/commit đang live; rollback ưu tiên build lại commit tốt đã biết qua Actions. Chỉ quay về legacy branch source sau khi khôi phục tree không chứa app/draft/docs có thể bị pass-through và được owner phê duyệt.

## Gate trong quá trình thực thi

- Phase 1: hoàn thiện date/schema/canonical và mock list/detail/mobile; route prefix `/vi/`, `/en/` đã chốt.
- Phase 4: sau khi đo baseline, chốt budget bytes/LCP và điều kiện đo.
- Phase 4: khi có nội dung thật, xác nhận publication/source change và chuỗi live thêm → deploy → gỡ → deploy.

## Validation Log và Red Team Review

Owner đã xác nhận 3/12 và duyệt áp dụng 14 finding (10 High, 4 Medium); chi tiết/propagation trong [review log](./reports/plan-review.md). Các phase đã bổ sung raw-HTML policy, media emission, locale/language checks, independent oracle, `verify`, fixture isolation, deploy authorization/order và exact rollback target. Bảng phase phản ánh trạng thái hiện tại; đây là kế hoạch thực thi, chưa phải bằng chứng runtime.

Lượt [validate/red-team 2026-10-15](./reports/2026-10-15-validation-red-team.md): owner chốt prefix VI/EN và duyệt cả 6 finding mới (2 High, 4 Medium); đã propagate. Ngày bài vẫn date-only proposal khi chưa có câu trả lời; runtime chưa được triển khai/verify.

## Handoff

Owner đã chọn mock B champagne và trả lời “Đồng ý hợp đồng đề xuất, tiếp tục Phase 2” ngày 2026-10-15.
Gate Phase 1 đã đóng. Phase 2 đã hoàn thành Astro/content/locale và các kiểm tra trong OS temp;
schema pure dùng chung trong `src/lib/content-contract.ts`, được đăng ký tại `src/content.config.ts`.
Phase 3 đã port mock B thành production UI, thêm artifact gates và hoàn tất nghiệm thu local.
`npm run verify` cuối exit 0: 97 tests passed/1 privilege skip, check không lỗi/cảnh báo/hint,
production zero-content artifact 4 HTML/16 files. Xem [báo cáo Phase 2](./reports/2026-10-15-phase-02-implementation.md)
và [Phase 3 + phần local Phase 4](./reports/2026-10-15-phase-03-implementation.md).
Phase 4 còn remote rollback ref, environment enforcement, owner-approved
source switch/deploy và live acceptance. Owner chọn chờ Pages live mới chốt budget. Không cần hỏi lại UI/contract/budget local.
Owner đã cho phép commit/push nhánh và mở PR để kiểm CI ngày 2026-10-15.
[PR #1](https://github.com/cuupham/cuupham.github.io/pull/1) đã mở dạng draft;
[CI head hiện tại](https://github.com/cuupham/cuupham.github.io/actions/runs/38714258649) pass trên commit `64e2bbf0d8911266ad992127e2509387fc74cb65`.
Token thực chỉ Contents/Metadata read, checkout auth assertion pass.
Owner credential xác nhận repository/environment secrets = 0, personal owner không có org-secret inheritance.
HTTP 403 trước đó do dùng account không có quyền repo. Chưa đổi provider; không merge app vào main khi Pages vẫn legacy main/root.

Trạng thái hiện tại và receipt chuẩn bị phát hành ngày 2026-10-16 nằm trong [báo cáo release-preparation](./reports/2026-10-16-release-preparation.md). Phase 1–3 đã hoàn tất theo checklist/handoff; Phase 4 đang tiếp tục. Remote rollback ref và owner-only environment enforcement đã được xác minh, còn source switch, merge, release flag, artifact approval, deploy và live acceptance vẫn pending.
