# CPM — Chuẩn bị phát hành ngày 2026-10-16

Đây là stateful receipt của snapshot trước first release, không phải trạng thái hiện tại. First release và live evidence được ghi trong [first-release receipt](./2026-10-16-first-release.md) và [live-acceptance receipt](./2026-10-16-live-acceptance.md). Snapshot dùng timezone Asia/Bangkok; trước mỗi mutation phải refresh provider state theo [runbook phát hành và rollback](../../../docs/publishing-and-rollback.md).

## Trạng thái hiện tại

- Phase 1, 2 và 3 đã hoàn tất theo checklist/handoff. Phase 4 đang tiếp tục.
- Tại snapshot chuẩn bị, PR #1 còn draft và CI head `64e2bbf0d8911266ad992127e2509387fc74cb65` đã pass trên [run 38714258649](https://github.com/cuupham/cuupham.github.io/actions/runs/38714258649).
- Các trạng thái chờ trong snapshot này đã được xử lý bởi first release: Pages Actions source, merge main, release flag, artifact approval và deploy đã có bằng chứng; live acceptance hiện ở receipt riêng.

## Receipt rollback và environment

- Remote ref `pages-legacy-safe` đã được tạo và re-GET xác minh trỏ tới `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`.
- Tree của safe ref chỉ có `README.md`, nên ref hiện là rollback target sạch đã kiểm chứng và không chứa app/drafts.
- Environment `github-pages` đã có required reviewer duy nhất là owner; `prevent_self_review=false`, repository là single-owner và custom branch policy chỉ cho `main`.
- Repository secrets và environment secrets đều bằng 0. Owner credential đã được dùng cho read/verify cần thiết mà không đổi account mặc định; không ghi credential value vào tài liệu.

## Bằng chứng CI và artifact tại snapshot

CI run trên PR là bằng chứng kiểm tra source/permissions của run đó, không phải artifact approval hay deploy proof. Run head hiện tại pass; PR vẫn draft và chưa tạo accepted-main release receipt.

Review độc lập phát hiện inventory của release manifest và upload artifact có thể lệch nhau với dot-path. Đã sửa gate để từ chối dotfile/dot-directory trước inventory trong commit `8b37a6c`; regression test trước fix fail do checker chấp nhận `.nojekyll`, sau fix targeted artifact test pass (1 selected, 3 excluded by filter). Reviewer chấp nhận remediation; full verify và CI trên source mới còn pending. Xem [review](./2026-10-16-release-review.md).

Bài thật [giới thiệu CPM](https://github.com/cuupham/cuupham.github.io/blob/57db88e69b68315763e54bcf663cfc051be86f31/src/content/posts/gioi-thieu-cpm.md) trong commit `2bd9384` mô tả chính site và hành vi đã triển khai, theo quyền xử lý nội dung owner giao ngày 2026-10-16. Bài không chứa fixture hay thông tin cá nhân suy đoán; vòng publish/remove live chưa chạy tại snapshot này.

## Việc còn pending tại snapshot

Owner đã cho phép tiếp tục migration/merge/release steps. Các bước dưới đây là pending tại thời điểm ghi receipt; first-release receipt ghi nhận chúng đã được hoàn tất hoặc chuyển thành live acceptance:

1. Refresh source/rollback/environment state và review source diff.
2. Switch Pages source sang Actions, merge source đã review và giữ release flag ở trạng thái phù hợp với artifact review.
3. Build production artifact từ accepted main SHA, ghi receipt SHA/run/artifact inventory/digest và để owner review đúng artifact đó.
4. Owner duyệt artifact của run đã dispatch, rồi kiểm tra deployment result và live routes/404/SEO.
5. Owner authorizes a genuine brief CPM intro for the add/remove lifecycle. Không dùng fixture làm nội dung public; lifecycle thêm → deploy → kiểm tra → gỡ → deploy và v1 acceptance chỉ được ghi sau khi có bằng chứng live.

Chi tiết workflow, rollback boundary, approval order và điều kiện không được switch nằm trong [publishing-and-rollback.md](../../../docs/publishing-and-rollback.md). Acceptance evidence hiện hành ở [acceptance matrix](../../../tests/acceptance/acceptance-matrix.md); first-release và live evidence ở [first-release receipt](./2026-10-16-first-release.md) và [live-acceptance receipt](./2026-10-16-live-acceptance.md).
