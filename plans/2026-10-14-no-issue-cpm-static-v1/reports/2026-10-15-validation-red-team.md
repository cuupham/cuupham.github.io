# CPM v1 — Validate và red-team, lượt chạy lại 2026-10-15

Plan: [CPM static v1](../plan.md). Đây là review **kế hoạch**, không phải bằng chứng build/browser/deploy của site.
Lượt này đọc lại cả bốn phase sau 14 chỉnh sửa đã được owner duyệt. Ba reviewer độc lập: Security Adversary, Assumption Destroyer và Failure Mode Analyst; controller kiểm tra scope/complexity và adjudicate.

## Kết quả hiện tại

- Format CLI: valid. Bốn phase pending, dependency `1 → 2 → 3 → 4`, không checkbox implementation nào được đánh dấu hoàn tất.
- Trước khi thêm report này: 35 liên kết Markdown local trong 8 file của plan, broken 0; `git diff --check` pass.
- Red team sau gộp: **6 finding**, không Critical; controller chốt **2 High, 4 Medium**. Cả sáu có evidence file:line; owner đã duyệt áp dụng cả sáu, đã sửa và được ba reviewer xác nhận lại trong bounded reread.
- Một thay đổi do **owner chủ động chọn trong validation**: prefix cả `/vi/` và `/en/`. Đã propagate riêng; không đếm đây là lỗi của draft đã review trước khi owner đổi route.
- Recommendation sau sửa: có thể bắt đầu Phase 1; không còn finding chưa xử lý trong lượt này. Câu hỏi ngày còn chưa trả lời và runtime vẫn là gate thực thi; không dùng format pass để suy ra site sẵn sàng deploy.

## Hiện trạng đã refresh ngày 2026-10-15

Read-only `gh api`/`gh repo view`/`gh workflow list` xác nhận repo `cuupham/cuupham.github.io`, default `main`, Pages `build_type: legacy`, source `main` + `/`, `custom_404: false`, URL `https://cuupham.github.io/`; rulesets `[]`, chỉ workflow dynamic Pages hiện có. Không thay settings.
Local vẫn chưa có `package.json`/Astro source/tests/custom workflow. Các file được ghi `Create` trong phase là deliverable tương lai, không coi absence là defect hiện tại.

## Validation Log — Session 3

Trigger: user yêu cầu chạy `ak-plan --validate` và `--red-team` trên active plan. Questions asked: 2.

### Q1 — Routes

**Câu hỏi:** Validation URL: plan đề xuất VI ở `/`, EN ở `/en/`; danh sách `/content/`, bài `/content/<id>/` và page 2+ `/content/page/2/` (thêm `/en/` cho UI EN). Bạn muốn chốt cấu trúc nào?

**Lựa chọn:**

- Giữ cấu trúc URL trong plan (đề xuất)
- Prefix cả VI và EN: `/vi/`, `/en/`

**Answer:** Prefix cả VI và EN: `/vi/`, `/en/`

**Rationale/propagation:** mọi home/list/detail/pagination lấy prefix từ registry, gồm default `vi`. Root chỉ là HTML redirect + anchor `/vi/`, HTTP 200, noindex và canonical `/vi/`; không có root `/content/*`. Astro base vẫn `/`, không đặt base `/vi/`. Phase 2 tạo cả root redirect lẫn registry home scaffolds; Phase 3 chỉ có `[locale]` content wrappers; canonical detail `/vi/content/<id>/`. Đã cập nhật PRD và các phase theo quyết định này.
Static redirect dùng HTML thay vì cam kết server status; [Astro redirect reference](https://docs.astro.build/en/reference/configuration-reference/#redirects) là nguồn kỹ thuật.

### Q2 — Date format

**Câu hỏi:** Validation ngày bài: plan chỉ nhận `YYYY-MM-DD`, hiển thị theo UI locale nhưng không đổi ngày do timezone; xếp mới nhất trước rồi ID tăng dần. Ngày tương lai vẫn hiện sau deploy. Bạn muốn dùng dạng nào?

**Lựa chọn:**

- Chỉ ngày `YYYY-MM-DD` như plan (đề xuất)
- Cho phép cả timestamp có timezone rõ

**Answer:** chưa nhận được tại thời điểm lập report; giữ date-only như proposal, không ghi nhận thành quyết định owner. Không có scheduler ở cả hai lựa chọn.

## Red Team Findings và adjudication

Evidence file:line dưới đây trỏ snapshot được reviewer đọc trước propagation prefix; tên file tương đối với thư mục plan. Đã lưu SHA256 của năm plan files khi bắt đầu review; đây là vị trí của snapshot, không giả định số dòng bất biến sau sửa.

### V1 — First release thiếu trigger mode và ràng buộc approved SHA — High

- Reviewer: Security Adversary + Failure Mode Analyst (gộp trùng).
- Evidence: `phase-04-verification-deployment.md:37-38,59`.
- Failure: sau switch source rồi merge workflow, push `main` có thể deploy trước approval; manual dispatch có thể checkout HEAD khác SHA owner vừa review.
- Proposed Accept: workflow ban đầu `workflow_dispatch`-only với main-ref guard; input approved SHA, xác nhận commit thuộc accepted main và checkout đúng SHA. Build/verify/upload cùng run, ghi artifact inventory/digest + SHA trước deploy approval. Chỉ thêm push auto-deploy bằng thay đổi owner duyệt sau khi enforcement đã chứng minh. Không tự thay provider lúc review.
- Rationale: cụ thể hóa cơ chế thực thi của policy approval đã duyệt, không thêm workflow nội dung hay CMS.

### V2 — Cancel superseded run có thể hủy deploy/rollback đang chạy — High

- Reviewer: Failure Mode Analyst.
- Evidence: `phase-04-verification-deployment.md:38,40`.
- Failure: push mới hủy first release/rollback đang deploy; trạng thái live chưa xác định trong khi plan đòi intended/live SHA khớp.
- Proposed Accept: chỉ cancel stale **build/check** trước privileged deploy. Pages deploy group riêng serialize với `cancel-in-progress: false`; manual rollback cùng group, ghi intent SHA riêng. Khi job đến lượt phải kiểm tra lại intent, bỏ stale ordinary release; không giả FIFO cho pending jobs. Tạm dừng auto promotion trong manual rollback, hậu kiểm deployment thật trước resume.
- New evidence: [GitHub Pages starter workflow](https://github.com/actions/starter-workflows/blob/main/pages/static.yml) đặt production group không hủy run đang chạy. [Concurrency docs](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency) giải thích pending/running behavior.
- Rationale: sửa policy kỹ thuật cancel đã ghi trong draft dựa trên bằng chứng mới, không đảo yêu cầu artifact sạch hay giữ site cũ khi build fail.

### V3 — Flat preflight và recursive loader chưa có inventory equality — Medium

- Reviewer: Security Adversary (đề nghị High; controller hạ Medium).
- Evidence: `phase-02-astro-content-locale.md:40-41,89`.
- Failure: implementer dùng top-level scan nhưng loader recursive, nested file lọt ngoài kiểm tra ID/collision/symlink.
- Proposed Accept: scan recursive không follow symlink, reject mọi path không phải một file trực tiếp dưới `posts/`; loader dùng cùng accepted inventory hoặc assert exact set equality. Test nested `.md/.mdx` và mismatch inventory.
- Rationale severity: intent đã yêu cầu enforce flat; đây là thiếu độ chính xác trong thuật toán plan, chưa có code chứng minh bypass. Không gọi đây là lỗ hổng runtime đã tái hiện.

### V4 — Asset checks chưa quy định resolver realpath chung cho mọi edge — Medium

- Reviewer: Security Adversary (đề nghị High; controller hạ Medium).
- Evidence: `phase-01-start.md:47-50`; `phase-02-astro-content-locale.md:42,53`; `phase-03-pages-assets-ui.md:59-60`.
- Failure: đường dẫn cover/Markdown image/CSS/MDX lexically ở allowed root nhưng symlink/junction trỏ tới draft có thể được bundle.
- Proposed Accept: source-boundary resolver chung cho ảnh, gallery, poster, media, Markdown refs, CSS và MDX imports; kiểm tra `lstat`, realpath, containment, reject symlink/junction/reparse/non-regular file kể cả parent path. Relative `..` hợp lệ khi resolved target vẫn ở allowed root; reject escape, không reject mọi relative reference. Media emission dùng kết quả resolver này, không tạo lớp check thứ hai.
- Rationale severity: draft exclusion đã là yêu cầu ở graph; review bổ sung cách kiểm tra file-system tương đương giữa entry types, chưa có implementation defect đã chứng minh.

### V5 — Embed URL chưa chỉ rõ dùng validator chung — Medium

- Reviewer: Security Adversary.
- Evidence: `phase-01-start.md:48,61`; `phase-02-astro-content-locale.md:43`; `docs/prd.md:136-145` ở snapshot review.
- Failure: embed chỉ được scheme-check HTTPS, lọt credential hoặc control/backslash mà actions/body links đã reject.
- Proposed Accept: cùng parser/serialization policy cho external action, body link và embed/source URL; HTTPS, không userinfo/control/backslash; không thêm provider allowlist ngoài scope.
- Rationale: đóng coverage của policy URL đã duyệt, không thay lựa chọn binary/provider.

### V6 — Bỏ detail hreflang không phù hợp hướng dẫn cho UI wrapper — Medium

- Reviewer: Assumption Destroyer.
- Evidence: `phase-01-start.md:51`; `phase-03-pages-assets-ui.md:45`.
- Failure: policy draft loại hết detail locale alternates dù cả VI/EN wrappers tồn tại; công cụ tìm kiếm thiếu chỉ dẫn về UI locale tương ứng.
- Proposed Accept, **chờ owner duyệt policy SEO**: canonical shared `/vi/content/<id>/`; thêm reciprocal absolute `hreflang=vi/en` cho UI wrappers có thật. `<html lang>` vẫn theo UI, `<article lang>` theo bài; không dịch hoặc đổi title/body, không khai nhóm bản dịch giả.
- New evidence: [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) có trường hợp chỉ dịch navigation/footer và giữ nguyên main content. Vì vậy `hreflang` có thể diễn tả localized wrapper, không bắt buộc là bản dịch bài.
- Trade-off: giữ policy hiện tại sẽ ít metadata hơn nhưng không chỉ dẫn locale wrapper; thêm alternates hỗ trợ discovery theo UI locale và cần reciprocal-set test. Đây là thay đổi so với draft, không silently áp dụng.

## Verification Results

- Tier: Standard — Fact Checker + Contract Verifier.
- Reviewer sample 40 claims: Phase 1–2 `13 Verified / 3 Failed / 4 Unverified`; Phase 3 `9 / 1 / 0`; Phase 4 trước route propagation `7 / 3 / 0`.
- Tổng snapshot review: `29 Verified / 7 Failed / 4 Unverified`. Một Failed là route decision mới chưa propagate tại thời điểm reviewer đọc; đã sửa riêng theo user. Sau propagation, remaining gaps tương ứng sáu finding trên: `30 Verified / 6 Failed / 4 Unverified`.
- Verified ở đây là concordance giữa plan và nguồn/contract, **không phải** chức năng đã chạy. Unverified gồm proposal date/SEO chưa chốt, mock/module/scripts/fixture tests chưa triển khai; không gộp future code thành current defects.
- Proposed dispositions: Accept 6, Reject 0. Hai finding được hạ severity với rationale như trên. Không finding evidence-free, không dùng góp ý trừu tượng để đảo decision 3/12, UI/content languages hoặc raw-HTML policy.
- Các kết quả này là lượt mới, không sửa lịch sử `Failed: 0` của [lượt trước](./plan-review.md). Summary cũ không còn là đánh giá hiện hành của toàn plan.

## Whole-Plan Consistency Sweep — route decision và repair

Đã propagate `/vi/` + `/en/` vào index, cả bốn phase và PRD: scaffold, registry/default-prefix, file inventory, positive/negative route literals, root redirect/SEO exception, canonical detail và live acceptance. Source `base` vẫn `/`. Research và review cũ là snapshot/historical; không dùng root-VI examples cũ làm execution authority.
Owner đã duyệt sáu repair như log dưới đây. Các đề xuất ở phần finding giữ lịch sử trước approval; trạng thái sau propagation được ghi riêng, không coi evidence snapshot là vị trí hiện tại bất biến.

## Validation Log — Session 4: áp dụng findings

**Câu hỏi:** Lượt validate/red-team mới có 6 đề xuất trong `reports/2026-10-15-validation-red-team.md`: bind first release với approved SHA, serialize deploy/rollback không hủy run đang chạy, đồng nhất inventory/asset resolver/embed URL validator, và thêm VI/EN hreflang cho UI wrappers (giữ nguyên ngôn ngữ/body bài). Đây là finding mới, chưa áp dụng; prefix `/vi/`, `/en/` bạn chọn đã được cập nhật riêng. Bạn muốn xử lý các đề xuất thế nào?

**Lựa chọn:**

- Áp dụng cả 6 đề xuất
- Review từng finding trước khi sửa
- Giữ plan hiện tại, chỉ lưu báo cáo

**Answer:** Áp dụng cả 6 đề xuất

**Confirmed changes:** sửa cả sáu contract trong plan. Không cấp quyền implementation, provider mutation, commit/push hoặc deploy từ câu trả lời này. Không ghi ngày bài là approved khi Q2 chưa được trả lời.

### Propagation và bounded verification

| Finding | Disposition | Applied to | Kết quả đọc lại độc lập |
|---|---|---|---|
| V1 | Accept, applied | Phase 4 migration/privilege split/negative trigger-SHA tests | Security + Failure reviewers: resolved |
| V2 | Accept, applied | Phase 4 deploy group/rollback intent/rehearsal contract | Failure reviewer: resolved |
| V3 | Accept, applied | Phase 2 recursive inventory/exact loader parity/nested fixtures | Security reviewer: resolved |
| V4 | Accept, applied | Phase 2 shared resolver + Phase 3 multi-entry artifact fixtures | Security reviewer: resolved |
| V5 | Accept, applied | Phase 1/2 URL contract + Phase 3 embed negative builds | Security reviewer: resolved |
| V6 | Accept, applied | Phase 1/3 canonical + reciprocal UI hreflang assertions | Contract reviewer: resolved |

Controller đã đọc lại index và cả bốn phase, so prefix/canonical/default registry, root redirect, asset resolver ownership, URL validator consumers, inventory parity, verify/build order, first trigger, approved SHA/artifact binding và concurrency/rollback intent. Không còn câu chữ active yêu cầu hủy privileged production deployment hoặc cấm detail UI alternates. Review cũ/research giữ nguyên historical evidence, có pointer tới lượt hiện hành.

### Final Verification Results

- Standard-tier sample sau propagation: **36 Verified / 0 Failed / 4 Unverified** trên 40 claims; Verified là source/contract concordance, không phải runtime pass.
- Bốn Unverified giữ đúng giới hạn: ngày/các proposal chưa hoàn tất; mock artifacts; executable modules/scripts; fixture tests chưa triển khai. SEO policy và route prefix đã được quyết định trong lượt này.
- Accepted 6, Rejected 0; finding chưa xử lý 0; unresolved contradictions trong scope reread 0.
- Kiểm tra cuối: `ak plan validate` valid; 50 liên kết Markdown local trong plan/README/PRD, broken 0; `git diff --check` pass (chỉ cảnh báo LF/CRLF của README). Index 75 dòng; reindex nhận đủ bốn phase. Các phase vẫn pending, không checkbox implementation done.
- Không chạy application unit/build/browser/deploy; không có manifest/tests hiện tại. Không thay provider hoặc branch/PR state.
