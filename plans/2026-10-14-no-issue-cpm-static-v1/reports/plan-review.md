# CPM v1 — Validation và red team của implementation plan

Review bắt đầu: 2026-10-14. Áp dụng và sweep hoàn tất: 2026-10-15. Plan: [CPM static v1](../plan.md).

## Validation Log

### Session 1 — 2026-10-14

Trigger: lập plan từ PRD; chọn chi tiết hiển thị ảnh hưởng mock, routes và test pagination.
Questions asked: 1. Chỉ hỏi quyết định chưa được PRD chốt; giữ nguyên các quyết định sản phẩm đã duyệt.

**Câu hỏi:** Trong plan, mình đề xuất home hiện tối đa 3 bài mới và danh sách có 12 bài/trang với phân trang static. Bạn muốn dùng cách nào?

**Lựa chọn:**

- Giữ 3 bài mới và 12 bài/trang (đề xuất)
- Home hiện 1 bài mới; danh sách hiển thị tất cả, không phân trang

**Answer:** Giữ 3 bài mới và 12 bài/trang (đề xuất)

Confirmed decision: home tối đa 3 bài mới và list 12 bài/trang, pagination static. Phase 1 mock, Phase 2 route/data constants, Phase 3 render và Phase 4 boundary tests phải dùng cùng quyết định.
Các lựa chọn kỹ thuật khác là proposal có thể review/chỉnh trong Phase 1. Phần thiết kế mobile/list/detail phải có mock cụ thể được duyệt trước production UI.

## Verification boundary

- [Research repo và docs](../research/repository-and-official-docs.md) ghi current local/GitHub facts đã kiểm tra.
- [Coverage 40 hợp đồng](./requirements-coverage.md) đối chiếu PRD; đây là kiểm tra plan, không phải implementation tests.
- Script npm, source Astro, custom Actions và browser acceptance chưa chạy vì chưa được tạo.
- Kết quả format/link/contract sweep và reviewer adjudication nằm ở cuối báo cáo sau khi đã đọc toàn bộ draft và bản chỉnh.

## Red Team Review — finding và chỉnh sửa được duyệt

Ba reviewer đọc độc lập từ các góc Security Adversary, Assumption Destroyer và Failure Mode Analyst. Các tọa độ dưới đây thuộc draft được review; sau chỉnh sẽ ghi section đích và sweep, không coi tọa độ snapshot là dòng bất biến.

Các sửa đổi dưới đây làm cụ thể cách thực hiện/kiểm tra cùng scope v1. Không đảo lại quyết định UI locale độc lập content language hoặc số lượng 3/12 đã được owner chốt.

| # | Finding gộp | Mức | Evidence draft | Chỉnh sửa đề xuất |
|---|---|---|---|---|
| R1 | Local media chưa có resolver/emission; cover alt/loading roles thiếu contract | High | phase-01-start.md:47-50; phase-03-pages-assets-ui.md:46,55 | Một resolver/emission owner cho source assets; cover/gallery dùng shape có alt; kiểm tra URL emitted, dimensions và priority/lazy theo vai trò |
| R2 | Locale registry thiếu uniqueness/reserved routes/dictionary checks | High | phase-02-astro-content-locale.md:51,57; phase-03-pages-assets-ui.md:43 | Validate registry và global route manifest; test locale thứ ba cùng collision/missing dictionary |
| R3 | Content language thiếu validation và display-name policy | High | phase-01-start.md:46; phase-03-pages-assets-ui.md:45,54-55 | BCP-47 canonical policy độc lập UI registry; nhãn theo UI locale và fallback mã; test ngôn ngữ bài ngoài VI/EN |
| R4 | Artifact oracle có thể lặp cùng bug; no-JS context/404 exception chưa assert rõ | High | phase-03-pages-assets-ui.md:37,44-45,48 | Expected fixture paths/metadata độc lập code production; assert counterpart từng page/detail; 404 zero canonical/alternate + noindex |
| R5 | PR chỉ build, có thể bỏ qua unit regression | High | phase-04-verification-deployment.md:35,67 | Tạo `npm run verify` chung cho unit + artifact scenarios + production check/build; dùng chính lệnh đó trong PR/release gate |
| R6 | Browser list/detail cần artifact fixture riêng, chưa có boundary upload | High | phase-03-pages-assets-ui.md:49; phase-04-verification-deployment.md:59 | Acceptance fixture chỉ nằm dưới temp root riêng; deploy chỉ production dist mới tạo sạch, reject sentinel; rebuild production sau review |
| R7 | Concurrent main builds có thể deploy bản cũ sau bản mới | High | phase-04-verification-deployment.md:37,51 | Pages concurrency policy, artifact cùng run, kiểm tra intended commit và live deployment SHA |
| R8 | Rollback trước lần đổi source đầu tiên chưa có exact target thực thi | High | phase-04-verification-deployment.md:33,36,39 | Resolve/prepare safe rollback ref + known-good tree trước switch; approval gate release đầu, rollback triggers rõ |
| R9 | Review server thiếu port/PID/worktree lifecycle | Medium | phase-04-verification-deployment.md:59 | Port deterministic 4321, kiểm tra owner trước start, record PID/command/port/root, stop clean và kiểm tra release port |
| R10 | Push `main` chưa đủ chứng minh source được owner chấp nhận | High | research/repository-and-official-docs.md:10-13; phase-04-verification-deployment.md:35-38 | Release đầu có manual approval artifact cụ thể; trước auto-deploy phải chứng minh PR/check protection hoặc owner-only environment approval, không tự đổi settings |
| R11 | Markdown raw HTML chưa có trust policy, có thể bypass action/component checks | High | phase-02-astro-content-locale.md:39-41,50; phase-03-pages-assets-ui.md:47 | Đề xuất Markdown raw HTML hiển thị dưới dạng text đã escape; rich HTML/component dùng MDX được owner review như code |
| R12 | Checkout credential có thể bị PR build đọc | Medium | phase-04-verification-deployment.md:35,50 | `persist-credentials: false`, read-only permissions, không truyền token vào scripts; không lưu Git auth header/helper cho build |
| R13 | Root-relative URL chưa có thuật toán same-origin chống bypass | Medium | phase-02-astro-content-locale.md:41 | Parse theo site origin, reject raw/decoded backslash/control/network-path/credentials, assert exact origin và local target; adversarial fixtures |
| R14 | ID grammar/normalization còn mơ hồ trên Windows/Linux | Medium | phase-01-start.md:45; phase-02-astro-content-locale.md:38,51 | ASCII regex, không silent normalize ID, reject symlink/non-regular files và slug override; test Unicode/case/extension collision |

Tổng sau gộp: 14 finding (0 Critical, 10 High, 4 Medium). Accept 14, Reject 0; mọi finding có evidence file:line. Owner đã duyệt áp dụng toàn bộ; propagation hoàn tất trong các phase.

Riêng R10 không tự áp branch protection hoặc settings mới. Release có owner approval artifact, kiểm tra cơ chế authorization thực tế trước khi cho auto-deploy; nếu cần thêm provider controls thì owner duyệt riêng trước mutation. R11 đã được owner duyệt trong phiên review này và cập nhật vào PRD; đây không phải quyết định đã có từ trước turn lập plan.

### Validation Session 2 — review finding

**Câu hỏi:** Review plan đề xuất 14 chỉnh sửa trong báo cáo `plans/2026-10-14-no-issue-cpm-static-v1/reports/plan-review.md` để bổ sung media/locale/CI/fixture/deploy/rollback. Hai policy đi kèm: raw HTML trong Markdown hiển thị như text (rich HTML dùng MDX được review), và release có xác nhận source/artifact của owner trước khi cho auto-deploy. Giữ nguyên scope v1 và lựa chọn 3/12; chưa đổi settings hay deploy. Bạn muốn xử lý thế nào?

**Lựa chọn:**

- Áp dụng các chỉnh sửa được đề xuất
- Review từng điểm trước khi sửa
- Giữ draft hiện tại, chỉ lưu báo cáo

**Answer:** Áp dụng các chỉnh sửa được đề xuất

Không có finding nào bị áp dụng trước câu trả lời này. Thao tác được duyệt là chỉnh **plan**; không phải quyền thay provider hoặc publish ngay.

### Propagation

| Finding | Đã áp dụng tại |
|---|---|
| R1 | Phase 1 schema/media; Phase 2 `media-assets.ts` emission; Phase 3 alt/loading/output tests |
| R2 | Phase 1 registry policy; Phase 2 manifest/dictionary checks; Phase 3 third-locale test |
| R3 | Phase 1 BCP-47/display policy; Phase 2 validation; Phase 3 output assertions |
| R4 | Phase 1 404 exception; Phase 3 independent expected literals, counterpart anchors và canonical matrix |
| R5 | Phase 2/3 `verify` orchestration; Phase 4 same local/PR/release gate và negative unit test |
| R6 | Phase 3 temp fixture command; Phase 4 separate preview, production rebuild/upload, sentinel rejection |
| R7 | Phase 4 concurrency, same-run artifact, intended/live SHA assertions và rollback exception |
| R8 | Phase 4 pre-switch verified rollback target và mandatory first-artifact approval |
| R9 | Phase 4 deterministic port/PID/command/root, reuse/stop rules và preview script |
| R10 | Phase 1/4 source/artifact approval enforcement; PRD mục 9 |
| R11 | Phase 1/2 raw HTML policy, Phase 3 escaped-output assertions; PRD mục 5 |
| R12 | Phase 4 checkout/Git credential checks và job permissions |
| R13 | Phase 1/2 same-origin/parser/adversarial URL cases |
| R14 | Phase 1/2 ASCII grammar, no silent normalization, slug/symlink/collision tests |

### Verification Results

- Tier: Standard — Fact Checker + Contract Verifier.
- Reviewer sample: 40 claims (20 ở Phase 1–2, 10 ở Phase 3, 10 ở Phase 4).
- Sau chỉnh: 39 claims được đối chiếu bằng source/PRD/contract đã ghi; Failed: 0; Unverified: 1 — nhóm future `Create` modules/scripts chưa thể chứng minh runtime khi implementation chưa có.
- Tất cả 14 draft gap đã có bước thực hiện và kiểm tra tương ứng. Đây là verification của tài liệu, không phải khẳng định chức năng đã chạy.
- `ak plan validate`: valid; 4 phase pending, dependency chain 1 → 2 → 3 → 4; index 74 dòng; 44 local Markdown links kiểm tra thành công, broken 0 tại lượt sweep cuối.
- `git diff --check`: pass. Không chạy npm/build/browser/deploy; không có app manifest/tests để chạy ở scope planning.
- CLI index ghi một active plan với bốn phase; đã pin đúng plan cho worktree. Không có live task-management surface riêng; checkbox phase là nguồn theo dõi bền vững.

### Whole-Plan Consistency Sweep

- Đọc lại `plan.md` và cả bốn phase sau propagation; đối chiếu PRD, mock và research snapshot.
- Kiểm tra 14 decision deltas qua file inventory, pipeline ordering, requirements, verification, risk/rollback và summary.
- Loại fixed list index khỏi route design; optional-rest `getStaticPaths()` có thể không emit list ở zero-content. Locale wrappers lấy registry, không hardcode thư mục EN cho mở rộng locale.
- Hòa giải 404 zero canonical với indexable-page matrix; expected fixture paths độc lập generator; raw HTML policy áp dụng đúng Markdown, MDX vẫn review như code.
- `verify` là release gate, `build` giữ content/schema/artifact invariants; không nhầm command dự kiến tạo với command đã chạy.
- Các câu hỏi hiệu năng/publish/live lifecycle được đặt ở Phase 4; Phase 1 review visual artifact cụ thể và technical contract, không hỏi lại số lượng 3/12 hoặc policy review đã duyệt.
- Unresolved contradictions: 0. Nội dung thật, mock approval, runtime và provider preflight là gate thực thi đã được ghi rõ, không phải phần implementation đã hoàn thành.

## Handoff

Plan authoring/review hoàn tất; có thể bắt đầu Phase 1 khi user yêu cầu triển khai. Chưa đánh dấu phase nào done. Giữ nguyên dirty/untracked work đã có; không commit/push hoặc thay settings trong phiên lập plan.

## Lượt review tiếp theo

User đã yêu cầu chạy lại validate/red-team ngày 2026-10-15. Kết luận hiện hành nằm ở [report lượt mới](./2026-10-15-validation-red-team.md); các kết quả bên trên giữ lịch sử tại thời điểm sweep trước, không phải attestation sau mọi thay đổi tiếp theo. Route VI-root cũ đã bị thay bằng quyết định owner `/vi/` + `/en/` trong lượt mới.
