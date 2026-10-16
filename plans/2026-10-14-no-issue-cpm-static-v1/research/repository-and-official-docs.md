# CPM v1 — Bằng chứng và quyết định đầu vào

Ngày kiểm tra: 2026-10-14. Đây là research cho plan, chưa có implementation/build/browser/deploy.

## Hiện trạng local và GitHub

- Local branch `codex/anime-portfolio-concept`, HEAD `65d7a15` (Initial commit).
- `README.md` đang sửa; `docs/`, `mockups/`, `plans/` là untracked. Giữ toàn bộ thay đổi sẵn có; chỉ thêm plan mới.
- Repo hiện có README, PRD, report review PRD và mock HTML/CSS/JS với ba ảnh. Không có package manifest, Astro source, tests hoặc custom Actions YAML.
- `gh repo view cuupham/cuupham.github.io`: public, default branch `main`, URL https://github.com/cuupham/cuupham.github.io.
- `gh api repos/cuupham/cuupham.github.io/pages`: `build_type: legacy`, source `main` + `/`, URL https://cuupham.github.io/, HTTPS enforced, `custom_404: false`.
- `gh workflow list`: workflow tự động `pages-build-deployment`; chưa có pipeline Astro.
- `gh api .../rulesets`: `[]`; `gh api .../branches/main/protection`: HTTP 404. Không suy ra chính sách hiện tại từ repo ở session cũ; kiểm tra lại trước publish.
- Run dynamic hiện có: https://github.com/cuupham/cuupham.github.io/actions/runs/38506713795 (success). Đây không phải build/deploy CPM.

## Bằng chứng sản phẩm hiện hành

- [PRD](../../../docs/prd.md) sở hữu contract; [review PRD](../../reports/2026-10-14-prd-validation-red-team.md) giữ lịch sử.
- [Mock](../../../mockups/cpm-portfolio/index.html), [README mock](../../../mockups/cpm-portfolio/README.md), tokens/components/page CSS là reference.
- Mock locale JS chỉ đổi text trong cùng DOM; production cần static route và no-JS anchors.
- Hero source 2,110,742 + 2,647,525 bytes; collection source 2,933,042 bytes. Đây là dung lượng file gốc, không phải bytes mạng đã đo.
- PRD giữ UI locale độc lập language của bài; zero-content tính toàn site; không scheduler; asset nháp không vào artifact; native select; home giữ mock.

## Research chính thức

1. [Astro collections](https://docs.astro.build/en/guides/content-collections/): `src/content.config.ts`, build-time loader, schema, `getCollection`/render. `glob()` có ID từ tên file và khả năng override slug; plan cần chặn override, kiểm tra collision trước khi loader deduplicate.
2. [Astro routing](https://docs.astro.build/en/guides/routing/): dynamic static routes dùng `getStaticPaths()`; list zero-content cần không sinh paths, không phải cố định page rỗng.
3. [Astro GitHub Pages](https://docs.astro.build/en/guides/deploy/github/): user site dùng `site` ở domain root; cần chuyển Pages source sang Actions. Không cần repo-name base ở user site này.
4. [Astro images](https://docs.astro.build/en/guides/images/): local source images có thể xử lý bằng assets API; pass-through public không tối ưu và không bảo vệ draft assets.
5. [Astro i18n](https://docs.astro.build/en/guides/internationalization/): registry VI/EN, default không prefix; không dùng fallback để tạo route không có nội dung thật.
6. [GitHub custom 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site): deploy `404.html`; status HTTP phải kiểm tra live, không suy từ preview.
7. [GitHub deploy-pages](https://github.com/actions/deploy-pages): deploy job cần Pages/OIDC permissions và build artifact; chỉ publish source được chấp nhận.
8. [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use): quyền tối thiểu, pin action SHA sau review; PR chạy untrusted code không cấp secrets/deploy permissions.
9. [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions): metadata locale phải thể hiện ngôn ngữ thật; detail cùng body VI trong wrapper EN không được khai như bản dịch EN. Chốt canonical policy riêng cho detail trong phase 1.

Version Node/Astro/action SHA phải xác nhận lúc implement, khóa lockfile/runtime; không chép mutable major version từ research thành sự thật vĩnh viễn.

## Scope challenge

HOLD SCOPE. Chỉ lập plan toàn bộ v1; không tạo product content, không cấu hình provider/publish trong turn planning.
Hơn 8 file là hợp lý vì repo chưa có application: config, content contract, locale/routes, layouts/pages, asset pipeline, checks và workflow là boundary thực. Bốn phase tách theo gate design, dữ liệu, UI và nghiệm thu/publish; không dùng service/class mới hoặc backend.

## Draft direction lúc research để planner làm concrete

- VI `/`, EN `/en/`; list `/content/`, `/en/content/`; detail `/content/<id>/`, `/en/content/<id>/`; page 2+ `/content/page/<n>/` và prefix locale tương ứng.
- 3 latest trên home; 12 bài/trang list, pagination static; subject to owner review trong mock gate, không thêm search/filter.
- ID filename stem lowercase kebab-case, unique across md/mdx; reserve `page`; không frontmatter slug override, không title-derived slug.
- Date-only `YYYY-MM-DD` calendar-validated, UTC normalization cho arithmetic/Intl date display để không shift ngày; không scheduler; descending date then ASCII ID ascending.
- Published `src/content/posts/`, draft ngoài loader ở `drafts/`; draft-only assets trong `drafts/assets/`, source asset published/shared dưới src; không broad eager glob asset và không public draft copy.
- Required language/title/publishedAt/body + filename ID; optional description/cover/gallery/media/updatedAt/actions/platform/version. Một schema owner; body/collision/build-link rules bổ sung shared helpers, không schema thứ hai.
- Root-relative internal action paths hoặc HTTPS; resolve body links và assets theo source khi cần, reject controls/credential/executable/protocol-relative, missing local targets/fragments và draft imports/references. Network external audit riêng, không cứng trong build.
- Browser acceptance dùng MCP BrowserClaw theo preference đã có; không chọn Chrome DevTools/Playwright cho browser nghiệm thu. Unit/artifact checks dùng Vitest/Node; test fixtures chỉ trong sandbox ngoài production source/artifact.
- No real content yet: verify behavior with isolated fixtures, ship zero-content only; live thêm/gỡ bài dùng nội dung thật khi owner có và authorize publish, ghi acceptance pending nếu chưa có. Không public fixture để giả nghiệm thu.

## Decision delta sau research

Owner đã xác nhận 3 latest/12 bài mỗi trang và duyệt 14 chỉnh sửa review; xem [review log](../reports/plan-review.md). Draft direction ở trên giữ dấu vết đầu vào; contract hiện hành để thực thi nằm trong phase files đã cập nhật. Live GitHub facts ở đây là snapshot ngày 2026-10-14, không thay preflight khi triển khai.

Validation lượt tiếp theo ngày 2026-10-15: owner chọn prefix cả `/vi/` + `/en/`; ví dụ VI-root ở research này đã superseded. [Report hiện hành](../reports/2026-10-15-validation-red-team.md) ghi preflight mới và các finding còn chờ quyết định.
