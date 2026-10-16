# CPM — Chuẩn bị phát hành ngày 2026-10-16

Đây là stateful receipt cho bước chuẩn bị phát hành, không phải bằng chứng đã phát hành hoặc đã nghiệm thu v1. Snapshot dùng timezone Asia/Bangkok; trước mỗi mutation phải refresh provider state theo [runbook phát hành và rollback](../../../docs/publishing-and-rollback.md).

## Trạng thái hiện tại

- Phase 1, 2 và 3 đã hoàn tất theo checklist/handoff. Phase 4 đang tiếp tục.
- PR #1 vẫn ở trạng thái draft. CI head `64e2bbf0d8911266ad992127e2509387fc74cb65` đã pass trên [run 38714258649](https://github.com/cuupham/cuupham.github.io/actions/runs/38714258649).
- Pages vẫn dùng legacy `main` + `/`. Chưa có source switch, merge app vào main, release flag, production artifact approval, deploy CPM hoặc live acceptance.

## Receipt rollback và environment

- Remote ref `pages-legacy-safe` đã được tạo và re-GET xác minh trỏ tới `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`.
- Tree của safe ref chỉ có `README.md`, nên ref hiện là rollback target sạch đã kiểm chứng và không chứa app/drafts.
- Environment `github-pages` đã có required reviewer duy nhất là owner; `prevent_self_review=false`, repository là single-owner và custom branch policy chỉ cho `main`.
- Repository secrets và environment secrets đều bằng 0. Owner credential đã được dùng cho read/verify cần thiết mà không đổi account mặc định; không ghi credential value vào tài liệu.

## Bằng chứng CI

CI run trên PR là bằng chứng kiểm tra source/permissions của run đó, không phải artifact approval hay deploy proof. Run head hiện tại pass; PR vẫn draft và chưa tạo accepted-main release receipt.

Review độc lập phát hiện inventory của release manifest và upload artifact có thể lệch nhau với dot-path. Đã sửa gate để từ chối dotfile/dot-directory trước inventory trong commit `8b37a6c`; regression test trước fix fail do checker chấp nhận `.nojekyll`, sau fix targeted artifact test pass (1 selected, 3 excluded by filter). Reviewer chấp nhận remediation; full verify và CI trên source mới còn pending. Xem [review](./2026-10-16-release-review.md).

Bài thật [giới thiệu CPM](../../../src/content/posts/gioi-thieu-cpm.md) trong commit `2bd9384` mô tả chính site và hành vi đã triển khai, theo quyền xử lý nội dung owner giao ngày 2026-10-16. Bài không chứa fixture hay thông tin cá nhân suy đoán; vòng publish/remove live chưa chạy.

## Việc còn pending

Owner đã cho phép tiếp tục migration/merge/release steps. Các bước sau vẫn phải hoàn tất theo thứ tự trong runbook:

1. Refresh source/rollback/environment state và review source diff.
2. Switch Pages source sang Actions, merge source đã review và giữ release flag ở trạng thái phù hợp với artifact review.
3. Build production artifact từ accepted main SHA, ghi receipt SHA/run/artifact inventory/digest và để owner review đúng artifact đó.
4. Owner duyệt artifact của run đã dispatch, rồi kiểm tra deployment result và live routes/404/SEO.
5. Owner authorizes a genuine brief CPM intro for the add/remove lifecycle. Không dùng fixture làm nội dung public; lifecycle thêm → deploy → kiểm tra → gỡ → deploy và v1 acceptance chỉ được ghi sau khi có bằng chứng live.

Chi tiết workflow, rollback boundary, approval order và điều kiện không được switch nằm trong [publishing-and-rollback.md](../../../docs/publishing-and-rollback.md). Acceptance evidence hiện hành vẫn ở [acceptance matrix](../../../tests/acceptance/acceptance-matrix.md); CI history đầy đủ ở [PR CI verification](./2026-10-15-pr-ci-verification.md).
