# CPM — PR CI thực

Owner cho phép commit/push nhánh và tạo PR ngày 2026-10-15. Đã mở
[PR #1](https://github.com/cuupham/cuupham.github.io/pull/1) dạng draft vào main, không merge/deploy.
Các commit tách documentation, production content/UI, workflow và whitespace cleanup.
Quét 167 text files/173 paths bằng credential patterns trước commit: không có strong credential match hoặc secret-file path.
Đây là pattern scan, không tuyên bố đã chạy gitleaks.

[Run 38713942819](https://github.com/cuupham/cuupham.github.io/actions/runs/38713942819),
event pull_request, source SHA `0d75b819cc7fcd9f1119ae199d8464a4f6ba1e18`, runner Ubuntu 24.04:

- Job verify success, 1m4s. `npm ci` audit 0 vulnerabilities.
- Astro check: 0 errors/warnings/hints; 94 unit và 4 artifact/workflow tests pass, zero skips.
- Production artifact gate: 4 HTML/16 files. Không dùng fixture làm production content.
- Log GITHUB_TOKEN Permissions: Contents read, Metadata read; không Pages/OIDC write.
- Persisted checkout authentication assertion pass; workflow không dùng secret input hoặc privileged follow-up.

Lỗi PR create/API 403 ban đầu do gh active account không phải repository owner. Tài khoản owner đã đăng nhập
sẵn; dùng token owner trong process của command, không in token hoặc đổi active account. Owner API xác nhận
repository secrets 0, github-pages environment secrets 0; repo thuộc User nên không có org secrets kế thừa.
Actions enabled/allowed all. Environment vẫn chỉ branch policy, chưa required reviewer; Pages vẫn legacy main/root.

Đây là same-repository PR run; không tuyên bố đã diễn tập fork hoặc deploy/rollback concurrency thật.
Runner annotation thông báo ubuntu-latest dự kiến đổi image từ 2026-10-19; run này dùng ubuntu-24.04.
Chưa đổi provider, tạo rollback branch, bật release flag, merge hoặc deploy. Live budget chờ Pages live theo owner.
