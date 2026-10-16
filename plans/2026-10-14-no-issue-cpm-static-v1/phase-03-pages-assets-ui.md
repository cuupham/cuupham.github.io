---
phase: 3
title: "Pages, assets và shared UI"
status: completed
priority: P2
effort: 16h
dependencies: [2]
---

# Phase 3: Pages, assets và shared UI

## Mục tiêu

Implement shared Astro UI/static paths từ registries đã test, khớp home/list/detail/mobile được owner duyệt và chỉ emit dữ liệu/assets thật.

## Context

- [PRD UI và acceptance](../../docs/prd.md)
- [Mock README](../../mockups/cpm-portfolio/README.md)
- [Mock B champagne đã chọn](../../mockups/cpm-portfolio/champagne/home-mobile.html)
- [Phase 1 visual contract](./phase-01-start.md)
- [Phase 2 data/route contract](./phase-02-astro-content-locale.md)

## Files to create / modify

- Create `D:/repo-cuu/cuupham.github.io/src/layouts/base-layout.astro`, `D:/repo-cuu/cuupham.github.io/src/layouts/article-layout.astro` — document semantics, SEO, shared shell.
- Create `D:/repo-cuu/cuupham.github.io/src/components/site-header.astro`, `D:/repo-cuu/cuupham.github.io/src/components/locale-select.astro`, `D:/repo-cuu/cuupham.github.io/src/components/site-footer.astro`, `D:/repo-cuu/cuupham.github.io/src/components/content-card.astro`, `D:/repo-cuu/cuupham.github.io/src/components/content-list.astro`, `D:/repo-cuu/cuupham.github.io/src/components/media-gallery.astro`, `D:/repo-cuu/cuupham.github.io/src/components/content-actions.astro`, `D:/repo-cuu/cuupham.github.io/src/components/hero-art.astro` — conditional shared UI.
- Modify `D:/repo-cuu/cuupham.github.io/src/pages/index.astro` — root redirect, và `D:/repo-cuu/cuupham.github.io/src/pages/[locale]/index.astro` — home cho mọi UI locale, gồm VI default, từ registry.
- Create `D:/repo-cuu/cuupham.github.io/src/pages/[locale]/content/[...page].astro` — optional-rest list wrapper; undefined là page 1, `page/2` trở lên là pagination, mọi locale đều có prefix.
- Create `D:/repo-cuu/cuupham.github.io/src/pages/[locale]/content/[id].astro` — cùng tập bài với tất cả UI locales từ registry. Không tạo root `src/pages/content/*` wrappers.
- Create `D:/repo-cuu/cuupham.github.io/src/pages/404.astro` — useful, noindex, no canonical.
- Create `D:/repo-cuu/cuupham.github.io/src/styles/tokens.css`, `D:/repo-cuu/cuupham.github.io/src/styles/global.css`, `D:/repo-cuu/cuupham.github.io/src/styles/home.css`, `D:/repo-cuu/cuupham.github.io/src/styles/content.css`, `D:/repo-cuu/cuupham.github.io/src/scripts/locale-select.ts` — production styles/progressive navigation.
- Create optimized production imports under `D:/repo-cuu/cuupham.github.io/src/assets/artwork/` from three approved mock sources; keep source evidence unchanged.
- Create `D:/repo-cuu/cuupham.github.io/scripts/check-artifact.mjs`, `D:/repo-cuu/cuupham.github.io/tests/artifact/site-artifact.test.ts`; modify `D:/repo-cuu/cuupham.github.io/package.json` so final build is content check → clean Astro build → artifact check.

## Architecture và data flow

Pages ask route registry for real paths → load same sorted entries → layouts derive UI/SEO without translating article fields → components omit absent blocks → Astro creates responsive assets → locale control links real counterpart → newly clean `dist/` is inspected for routes, metadata, links and forbidden draft/mock/source files.

## Tasks

1. Port accepted B champagne composition/tokens: wordmark CPM bằng chữ, champagne ở nút chính/chi tiết nhỏ, heading/body ivory trên navy than. Hero có hai nhân vật toàn thân desktop, cả hai mặt/CTA rõ tablet/mobile; latest ngay sau hero khi có bài; phần giới thiệu và collection gộp trong section cream với artwork riêng. Kế thừa `mockups/cpm-portfolio/champagne/home-mobile.html`, `champagne/home-empty.html` và `review.css`, không dùng bố cục `index.html` tham chiếu cũ. Motion tiết chế, không diagonal spotlights.
2. Build owner-confirmed latest 3 and 12/page list/detail. Do not render empty description/cover/gallery/media/action/platform/version or fake “coming soon”.
3. Use registry/getStaticPaths: optional-rest list and detail wrappers return no paths when content is empty; 13 posts emits list root plus page 2, never page 1 alias. The locale parameter comes only from the UI locale registry, not hardcoded `en`; direct refresh works via static HTML.
4. Native locale select gets tiny navigation enhancement; no-JS anchors keep ID/page context. Core reading/navigation remains HTML.
5. SEO home/list self-canonical + real alternates; detail shared canonical `/vi/content/<id>/` với reciprocal absolute `hreflang` cho mọi UI wrapper thật, gồm self-reference. Giữ article lang/title/body thật, không coi UI wrapper là bản dịch bài. Root redirect canonical `/vi/`, noindex, zero alternates; 404 noindex, zero canonical/alternate.
6. Optimize hero/collection/cover/gallery/poster via local assets, srcset/sizes, stable dimensions and lazy below fold. Hero prioritized; media needs title and user action, no background autoplay.
7. Safe external rel and normalized internal links; trusted MDX only through approved components.
8. Artifact gate kiểm tra output mới tạo sạch: route uniqueness; indexable home/list/detail có đúng một canonical và detail wrappers dùng shared article canonical; 404 có zero canonical/alternate và `noindex`. Kiểm tra alternates thật, không page-1 alias/draft/mock/test/template/source/draft-derived assets, không broken local target/fragment hoặc HTML bài đã gỡ.
9. Run zero/draft-only/1/13/remove-last matrices in isolated temp roots, never production content.

## Verification

- Commands to **create**: `npm run test:unit`, `npm run test:artifact`, `npm run build`.
- Matrices cover VI article under EN UI and all optional blocks absent/present.
- Static assertions cover html/article lang, canonical/alternate/noindex, safe rel, image width/height/srcset/lazy and route parity.
- Expected fixture paths/metadata là literal độc lập production helper: zero/draft-only có root redirect, `/vi/`, `/en/`, 404 và assets dùng thật, không list/detail. 13 bài có `/vi/content/`, `/en/content/`, `/vi/content/page/2/`, `/en/content/page/2/`; không root `/content/*` hoặc cả hai page-1 alias. So hai chiều tập output; xóa bài cuối trên cùng fixture workspace để bắt stale files.
- Root HTML phải có meta-refresh và anchor thật `/vi/`, noindex, một canonical `/vi/`, zero alternates. Kiểm tra HTTP root là 200 trên Pages, không coi đây là server 301; đọc `/vi/` và `/en/` trực tiếp/refresh vẫn đúng locale.
- Parse từng locale counterpart anchor khi JS tắt: home → home, list page 2 → page 2, detail → cùng ID; link hợp lệ nhưng về home sai context phải fail.
- Detail hreflang assertions: cùng reciprocal set absolute URLs trên VI/EN và locale thứ ba; mỗi set có self và real counterparts, không draft/removed/unknown route. Root/404 zero alternates là exception rõ ràng; article lang/title/body không đổi khi UI đổi.
- Test content language hợp lệ ngoài UI registry, nhãn display/fallback, title/body giữ nguyên. Locale thứ ba sinh home/list/detail/pagination mà không sửa route templates.
- Cover/gallery alt theo schema; hero decorative alt rỗng, không lazy và có loading priority rõ; collection/below-fold gallery lazy. Mỗi ảnh có dimensions và responsive sizes/srcset phù hợp; không assert lazy đồng loạt.
- Audio/video thật được emit qua resolver Phase 2: output URL tồn tại, không source filesystem URL; poster optimized. Sau remove-last, asset chỉ thuộc bài đã gỡ biến mất; shared asset còn nếu bài public còn dùng. Markdown script/event-handler/iframe input trở thành escaped text; MDX chỉ dùng source reviewed.
- Artifact negative builds phủ nested/unvalidated article và draft asset qua symlink/CSS/Markdown/MDX/poster; không chỉ test audio resolver. Fixture embed dùng URL hostile phải fail trước render iframe/source link. Không assert đã cover một OS-specific case khi runner không hỗ trợ.
- Manual visuals are not claimed here; BrowserClaw acceptance is Phase 4.

## Verification orchestration sau review

<!-- Updated: Validation Session 2 - independent artifact oracle and fixture boundary -->

- Create `D:/repo-cuu/cuupham.github.io/scripts/acceptance-fixture.mjs` để dựng clone/input sandbox trong OS temp directory duy nhất; output `<temp>/cpm-acceptance-<id>/dist/`, không ghi fixture vào production `src/content/posts/`, `public/` hoặc `dist/`.
- Tạo `test:artifact` (`vitest run tests/artifact`) và `acceptance:fixture` (`tsx scripts/acceptance-fixture.mjs`). Fixture artifact có sentinel/nhãn test rõ; production artifact check reject sentinel và fixture IDs đã quy định.
- Final `verify`: `check` → `test:unit` → `test:artifact` → `build` production cuối cùng. Artifact tests build sandbox trực tiếp bằng build runner với validated temp roots; không gọi `verify` đệ quy. Mọi command fail phải propagate nonzero exit.
- `build`: content/source preflight → referenced media manifest → clean output → Astro schema/render → `check-artifact` đọc DOM/files. Emit chỉ output đã kiểm tra. Production `dist/` luôn được rebuild sau fixture/browser run trước upload.

## Risks và rollback

- **High × high — stale route survives deletion:** clean output plus expected-vs-actual artifact manifest.
- **High × medium — SEO claims false translation:** central helper and same-body wrapper tests.
- **Medium × high — responsive hero loses faces:** compare approved mobile at three widths + landscape; no crop workaround covering faces/CTA.
- **Medium × medium — assets heavy/layout-shifting:** responsive derivatives/stable dimensions; measure real bytes Phase 4.
- Rollback: revert pages/components/styles/assets/artifact gate and restore Phase 2 build script; content contract remains testable.

## Success criteria

- [x] Clean fixture builds emit exact route/artifact set with no draft leakage/stale files.
- [x] UI locale changes wrapper only; article identity/language/title/body and order stay stable.
- [x] 3 latest/12 per page, optional UI, no-JS, 404 and SEO follow approved contract.
- [x] Production source contains no fake published content.

## Current status — 2026-10-16

Phase 3 đã hoàn tất theo checklist và handoff. Pages/assets/shared UI và local artifact gates đã xanh; bằng chứng chi tiết nằm trong [báo cáo implementation](./reports/2026-10-15-phase-03-implementation.md). Browser/local evidence không thay thế live deployment evidence của Phase 4.

## Execution log — 2026-10-15

Shared UI/pages/styles và responsive assets đã implement theo B champagne. Markdown/MDX local assets,
real locale counterpart, conditional blocks và SEO đều đi qua artifact gate; fixture chỉ ở OS temp.
`npm run verify` cuối exit 0: 93 unit pass/1 Windows file-symlink privilege skip, 4 artifact/workflow pass,
check 0 errors/warnings/hints, production 4 HTML/16 files. BrowserOS neo đã chạy responsive/no-JS/keyboard,
list/detail và zero-content checks; chi tiết/giới hạn trong [báo cáo](./reports/2026-10-15-phase-03-implementation.md).
Không publish bài fixture, không tạo release hoặc đổi Pages provider.
