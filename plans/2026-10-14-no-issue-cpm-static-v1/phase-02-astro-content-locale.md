---
phase: 2
title: "Astro, content contract và locale routes"
status: completed
priority: P2
effort: 12h
dependencies: [1]
---

# Phase 2: Astro, content contract và locale routes

## Mục tiêu

Scaffold Astro static và biến contract đã duyệt thành một pipeline duy nhất: raw preflight trước loader, executable schema, draft isolation, deterministic sort, route registry và UI locale registry. Repo chưa có package manifest/Astro/tests/workflow (`plans/2026-10-14-no-issue-cpm-static-v1/research/repository-and-official-docs.md:9`).

## Context

- [PRD content và locale contract](../../docs/prd.md)
- [Phase 1 contract/mock gate](./phase-01-start.md)
- [Research direction](./research/repository-and-official-docs.md)

## Files to create / modify

- Create `D:/repo-cuu/cuupham.github.io/package.json`, `D:/repo-cuu/cuupham.github.io/package-lock.json`, `D:/repo-cuu/cuupham.github.io/astro.config.mjs`, `D:/repo-cuu/cuupham.github.io/tsconfig.json` — pinned runtime/dependencies/scripts.
- Create `D:/repo-cuu/cuupham.github.io/src/content.config.ts` — một Astro collection/schema owner.
- Create `D:/repo-cuu/cuupham.github.io/src/content/posts/.gitkeep`, `D:/repo-cuu/cuupham.github.io/drafts/posts/.gitkeep`, `D:/repo-cuu/cuupham.github.io/drafts/assets/.gitkeep`, `D:/repo-cuu/cuupham.github.io/content-templates/post.md` — empty production set, isolated drafts, non-public author template.
- Create `D:/repo-cuu/cuupham.github.io/src/pages/index.astro` — root HTML redirect + anchor `/vi/`; create `D:/repo-cuu/cuupham.github.io/src/pages/[locale]/index.astro` — minimal semantic home scaffold cho **mọi** locale từ registry, gồm VI default. Như vậy destination của root redirect tồn tại ngay ở Phase 2; Phase 3 triển khai visual home.
- Create `D:/repo-cuu/cuupham.github.io/src/lib/content-contract.ts` — ID/date/action/media validation và sort.
- Create `D:/repo-cuu/cuupham.github.io/src/lib/content-source.ts` — published loader facade/body refs.
- Create `D:/repo-cuu/cuupham.github.io/src/lib/asset-graph.ts` — Markdown/MDX/frontmatter/CSS dependency graph.
- Create `D:/repo-cuu/cuupham.github.io/src/lib/routes.ts` — route registry, pagination reserve, locale-context mapping.
- Create `D:/repo-cuu/cuupham.github.io/src/lib/locales.ts`, `D:/repo-cuu/cuupham.github.io/src/i18n/vi.ts`, `D:/repo-cuu/cuupham.github.io/src/i18n/en.ts` — UI registry/dictionaries only.
- Create `D:/repo-cuu/cuupham.github.io/scripts/check-content.mjs` — build-blocking raw/invariant check.
- Create `D:/repo-cuu/cuupham.github.io/.node-version`, `D:/repo-cuu/cuupham.github.io/.gitignore`, `D:/repo-cuu/cuupham.github.io/vitest.config.ts`, `D:/repo-cuu/cuupham.github.io/scripts/build.mjs` — runtime pin, output ignores, test config và clean build orchestration.
- Create `D:/repo-cuu/cuupham.github.io/src/lib/media-assets.ts` — source resolver và ESM media manifest generation; không có resolver copy riêng trong component.
- Create `D:/repo-cuu/cuupham.github.io/tests/unit/content-contract.test.ts`, `D:/repo-cuu/cuupham.github.io/tests/unit/asset-graph.test.ts`, `D:/repo-cuu/cuupham.github.io/tests/unit/routes-locales.test.ts` — isolated temp-fixture behavior.

## Architecture và data flow

1. `npm run check:content` inventory **recursive**, không follow symlink, trước Astro loader. Reject mọi article path không phải một `<id>.md|mdx` trực tiếp dưới `posts/`; không bỏ qua nested source vì scan top-level. ASCII `^[a-z0-9]+(?:-[a-z0-9]+)*$`, reserve `page`, reject `slug`, symlink/non-regular file. ID giữ nguyên stem, không silent normalize; cross-extension collision là lỗi.
2. Loader chỉ tiêu thụ accepted inventory nói trên; nếu dùng glob riêng thì assert exact file-set equality với inventory trước load/dedup. Không có nested/unvalidated input được loader đọc. Draft không thuộc accepted set. Một schema kiểm tra data; body/date dùng shared supplemental checks, không schema thứ hai.
3. Asset graph follows frontmatter, Markdown image/link, MDX static import, CSS `@import`/`url()` và approved components. Mọi local edge dùng **một** source-boundary resolver: `lstat` + realpath containment trên file và parent chain, reject symlink/junction/reparse/non-regular hoặc escaped/draft target. Relative `..` hợp lệ nếu resolved target vẫn trong allowed roots. Không eager import/copy draft hoặc cả cây assets vào public.
4. Action, body link và embed/source URLs dùng parser/serialization chung: external HTTPS không userinfo/control/backslash; internal root-relative parse với site origin, exact same origin và canonical path/query/hash. Không scheme-only validation riêng cho embed. Source-relative Markdown asset refs dùng resolver ở bước 3. Preflight kiểm tra syntax/source/route manifest; fragment và đích HTML thực tế kiểm tra sau render Phase 3. External reachability không là hard build dependency.
5. Return one globally sorted array: date descending, ASCII ID ascending. UI locale never filters it. Route registry prefix **mọi** UI locale, gồm default `vi`; map page kind + locale + ID/page. Page 1 dùng `/<locale>/content/`, page 2+ dùng `/<locale>/content/page/<n>/`. Home lấy 3, list chia 12 theo quyết định owner; không có root content aliases.
6. UI dictionaries control navigation/labels/date locale. Article language/title/body pass through; document lang follows UI and article lang follows content.

## Hợp đồng bổ sung sau review

<!-- Updated: Validation Session 2 - asset emission, locale and source validation -->

- Astro config: `output: 'static'`, `site: 'https://cuupham.github.io'`, root base `/`, directory output/trailing slash nhất quán; i18n `prefixDefaultLocale: true`. Locale/default lấy registry. Root redirect luôn tới VI default, không browser-language guessing/fallback hoặc thêm `/vi/` vào Astro `base`. Đây là user site, không thêm `/cuupham.github.io` base.
- Registry validation: đúng một default, segment unique/reserved-safe, dictionary keys đầy đủ; tạo global route manifest reject collision trước emit. `language` bài dùng BCP-47 validation và display-name policy ở Phase 1; không kiểm tra membership trong UI locales.
- Source-boundary resolver thuộc `asset-graph.ts`; `media-assets.ts` gọi đúng resolver này để lấy real source paths được chấp nhận. Cover/gallery/poster/media/Markdown refs/CSS/MDX static imports không có nhánh bỏ qua realpath check. Generate manifest với **chỉ** ESM imports của audio/video reachable (ví dụ Vite `?url`); cache dưới `.astro/`, không `public/`. Astro/Vite sở hữu emission; không tự viết lại bundler/resolver thứ hai.
- Markdown parser chuyển raw HTML nodes thành escaped text trước render; không tác động fenced code. MDX static imports/components được review như code; không claim static graph bảo vệ khỏi code tùy ý đã được tin cậy.
- Scripts `.mjs` gọi TypeScript helpers bằng runner đã khóa version (ví dụ `tsx`); không giả định Node tự hiểu TS hoặc các module ảo Astro. Schema/image integration chỉ chạy trong Astro, raw preflight dùng pure helpers chung.
- `scripts/build.mjs` preflight → chuẩn bị referenced-media manifest → dọn **đúng** output thuộc build hiện tại → `astro build`; Phase 3 thêm post-build artifact check. Resolve/validate absolute output trước cleanup; không xóa root repo hoặc output của run khác.
- Tạo scripts `check:content`, `check` (content + `astro check`), `test:unit` (`vitest run tests/unit`), `build`, `preview` (`astro preview`). `verify` giai đoạn này chạy check → unit → build; Phase 3 bổ sung artifact scenarios trước production build cuối.
- Tests thêm 0/1/3/4/12/13/24/25 bài, invalid ASCII/case/Unicode/slug/symlink, URL separator/encoded controls, third UI locale và missing dictionary/collision, content language ngoài VI/EN, Markdown raw HTML. Khẳng định route expected không gọi lại production registry để tính đáp án.
- Repair mới đã duyệt: test nested article + loader/inventory mismatch; asset symlink/junction qua từng entry type, gồm parent symlink và relative `..` vẫn-contained; missing file/non-regular/draft realpath; embed userinfo/encoded control/backslash bị cùng URL validator reject. Chạy OS-specific filesystem fixtures trên nền tảng hỗ trợ và ghi rõ phần skip, không giả đã chạy Windows junction trên Linux.

## Tasks

1. At implementation time verify current Node/Astro/MDX/Vitest compatibility, lock exact dependencies and commit lockfile; do not copy mutable versions from research.
2. Implement accepted schema/raw preflight with actionable file/field errors.
3. Make `npm run build` call `check:content` unconditionally before `astro build`, so local and CI use one gate.
4. Implement routes/locales, approved MDX import registry and asset/reference graph.
5. Temp-workspace tests cover zero/draft-only, 1/13 posts, duplicate md/mdx ID, reserved ID, invalid date, same-date tie, future date, optional nested shapes, invalid actions, missing fragments/assets, CSS/MDX draft leakage, shared asset retention and locale parity.
6. Tests never write fixtures into production content, `public/` or production `dist/`.

## Verification

- Commands to **create**, not verified current: `npm ci`, `npm run check:content`, `npm run test:unit`, `npm run build`; the minimal root page keeps the Phase 2 full build executable before Phase 3 routes exist.
- Assert zero content emits no list/detail route data; EN/VI manifests share ordered IDs.
- Assert raw collision failure trước loader; không `/content/*` hoặc `/<locale>/content/page/1/`. Manifest bao gồm root redirect riêng, registry sinh cả default locale và locale thứ ba; không hardcode `[locale]` chỉ là non-default.
- Re-grep actual imports/callers after implementation; no second schema or duplicated locale array.

## Risks và rollback

- **High × high — draft asset emitted indirectly:** dependency roots + MD/MDX/CSS graph + Phase 3 artifact gate.
- **High × medium — loader hides duplicate IDs:** raw scan runs before collection APIs (`plans/2026-10-14-no-issue-cpm-static-v1/research/repository-and-official-docs.md:26`).
- **Medium × high — UI locale mutates content:** separate types and body/title equality tests.
- **Medium × medium — external outage breaks build:** validate syntax/local targets only; record manual link check.
- Rollback: remove scaffold/source/tests/lockfile; preserve Phase 1 approved contract/mock.

## Success criteria

- [x] Data/collision/date/URL/graph/locale temp-fixture tests pass.
- [x] Zero-content build succeeds without public list/detail routes or fake content.
- [x] Draft files/assets have no loader or public dependency path.
- [x] Build cannot bypass required content invariants.

## Current status — 2026-10-16

Phase 2 đã hoàn tất theo checklist và handoff. Astro/content/locale pipeline và các kiểm tra local đã xanh; bằng chứng chi tiết nằm trong [báo cáo implementation](./reports/2026-10-15-phase-02-implementation.md). Các execution log bên dưới là lịch sử, không thay thế trạng thái release hiện tại.

## Execution log — 2026-10-15

Owner đã xác nhận exact contract và yêu cầu tiếp tục Phase 2; Phase 1 gate đã đóng.
Node local 24.18.0; package versions được xác minh từ npm trước khi khóa.
Astro 7.3.8/MDX 8.0.3 dùng unified processor để áp dụng Markdown raw-HTML policy.
TypeScript 7 không thuộc peer range của `@astrojs/check` hiện hành; dùng 6.0.3, không ép bỏ peer check.
Schema pure có một định nghĩa tại `src/lib/content-contract.ts`, được Astro đăng ký trong `src/content.config.ts`;
cách tách này cho raw preflight/test chạy bằng tsx mà không import module ảo Astro.

Kết quả cuối: `npm ci` pass, audit 0 vulnerabilities; `npm run verify` pass toàn chuỗi.
Astro/TypeScript: 0 errors/warnings/hints; Vitest: 94 passed, 1 skipped (Windows file-symlink privilege).
Production build cuối chỉ có `index.html`, `vi/index.html`, `en/index.html`; kiểm tra HTML độc lập xác nhận
root refresh/anchor/canonical/noindex/zero alternates và hai home đúng lang/self-canonical/reciprocal alternates.
Không có bài thật, list/detail, source/draft/fixture trong output. Không chạy browser acceptance hoặc deploy.
Xem [báo cáo implementation và giới hạn](./reports/2026-10-15-phase-02-implementation.md).
