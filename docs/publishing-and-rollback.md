# CPM — Phát hành và rollback

Site chỉ upload artifact `dist/` đã kiểm tra. Không upload repository, mock, docs, plan, fixture hoặc drafts.
Source nội dung và URL theo [hợp đồng kỹ thuật](cpm-v1-technical-contract.md); lệnh local ở [README](../README.md).

## Trạng thái đã xác minh ngày 2026-10-16

- Repository `cuupham/cuupham.github.io`, Pages `https://cuupham.github.io/`, HTTPS enforced.
- Pages đã chuyển sang **GitHub Actions** trước khi PR #1 merge; main accepted SHA là `57db88e69b68315763e54bcf663cfc051be86f31`. Pages URL, HTTPS enforcement và custom 404 đều đã kiểm tra live.
- Remote ref `pages-legacy-safe` đã được tạo và re-GET xác minh trỏ đúng `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`.
  Tree remote tại ref đó chỉ chứa `README.md`; đây là rollback target sạch đã verify, không chứa app/drafts.
- Rulesets API trả `[]`. Đọc bằng tài khoản owner xác nhận repository secrets = 0, environment secrets = 0;
  owner là tài khoản cá nhân nên không có organization secrets kế thừa. Actions enabled, allowed actions = all.
  Lỗi HTTP 403 trước đó do `gh` đang dùng tài khoản khác; không phải bằng chứng về secret configuration.
  Khi có nhiều tài khoản, dùng credential owner cho đúng command mà không đổi tài khoản mặc định của user.
- Environment `github-pages` đã cấu hình required reviewer duy nhất là owner, `prevent_self_review=false`,
  single-owner repository và custom branch policy chỉ cho `main`; enforcement đã được kiểm chứng.
- [PR #1](https://github.com/cuupham/cuupham.github.io/pull/1) đã merge; post-merge [CI run 38832348016](https://github.com/cuupham/cuupham.github.io/actions/runs/38832348016) pass. Release [run 38832467016](https://github.com/cuupham/cuupham.github.io/actions/runs/38832467016) đã build artifact được owner duyệt và deploy thành công.
- Exact Pages artifact `12017767426`, digest `sha256:0d2bbc63402dab68d76b914443fca73e4ddc25e614e607e4a65e076fbdf4bcd7`, source SHA `57db88e69b68315763e54bcf663cfc051be86f31`; deployment `7108166463` thành công. Root/locale/404/live browser evidence nằm trong [live-acceptance receipt](../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-live-acceptance.md).

Refresh tất cả giá trị trên trước thao tác. Receipt first release nằm trong [báo cáo first release](../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-first-release.md); live observations nằm trong [báo cáo live acceptance](../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-live-acceptance.md).

## Viết và kiểm tra bài

1. Bắt đầu từ [mẫu bài](../content-templates/post.md); điền title, language, date `YYYY-MM-DD` và nội dung thật.
2. Đặt file tại `src/content/posts/<id>.md|mdx`, assets tại `src/assets/`. Nháp ở `drafts/`, không để ở `public/`.
3. MDX và danh sách imported components được review như code. Không coi static asset graph là sandbox.
4. `npm ci`, `npm run verify`. Xem local bằng `npm run preview`. Không public fixture để giả nội dung thật.
5. Review diff và source SHA. Khi Pages còn legacy main/root thì không merge app vì source/drafts có thể bị pass-through; sau khi Actions source được xác minh, merge chỉ theo sequence owner-approved.

## Xem acceptance fixture

`npm run acceptance:fixture` tạo input/output riêng trong OS temp và in root JSON có marker rõ ràng.
`npm run preview:acceptance -- --root <root-vừa-tạo>` kiểm tra artifact rồi serve đúng thư mục đó tại
`http://127.0.0.1:4321`. Missing route trả HTTP 404, không SPA fallback. Marker không phải một giấy phép publish.

Trước start, kiểm tra port 4321/PID/root; reuse đúng instance hoặc dừng instance mình tạo. Không chọn port khác
để né process lạ. Script log PID/port/root; Ctrl+C dừng clean. Không copy fixture vào production content/dist.
Khi xong, dừng server, gỡ junction `node_modules` của workspace tạm trước khi cleanup đúng thư mục tạm đã xác minh.
Build production cuối cùng phải qua `npm run verify` sau các lượt fixture/browser.

## Chuyển legacy sang Actions — first release đã hoàn tất

Các bước migration/source switch, merge, release flag, exact artifact approval và protected deploy đã hoàn tất cho first release. Các release sau vẫn phải dùng cùng thứ tự và xác minh lại state.

1. Xác minh quyền/secret boundary với owner hoặc token có quyền đọc phù hợp. Repo/org secrets không được inject
   vào job chạy source PR chưa được chấp nhận. `.github/workflows/check.yml` chỉ có contents read,
   checkout không persist credentials và không privileged follow-up. Chạy PR job thực để kiểm chứng logs/permissions.
2. Owner review source diff, sequence chuyển nguồn và rollback. Remote branch `pages-legacy-safe` đã được tạo và
   re-GET xác minh trỏ **đúng** `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`; refresh SHA/tree trước source switch và không force-update tự động.
   Xác nhận operator có quyền restore.
3. Trước switch, xác minh lại remote rollback ref và tree không chứa app/drafts/mock/docs pass-through. Nếu proof
   không còn đúng, **không switch**. Receipt tạo/re-GET hiện tại nằm trong báo cáo chuẩn bị phát hành.
4. Trước mỗi release, xác minh Pages source là Actions và provider trả workflow. Deploy workflow chỉ dispatch thủ công, không trigger push.
5. Merge source đã review vào main, rồi dispatch release từ trusted main với exact accepted SHA.
6. Xác minh environment `github-pages`: required reviewer duy nhất là owner, branch policy chỉ cho main
   (hoặc protected main tương ứng), cùng secrets/approval state; repository variable `CPM_PAGES_RELEASE_ENABLED=true` chỉ bật cho release có owner-approved artifact.

Không xem việc push/merge main hoặc flag là artifact approval. Release flag đã bật cho first release sau exact artifact approval; auto-deploy vẫn tắt.

## Release đã chấp nhận

1. Ghi chính xác commit SHA main đã review và clean checkout. Dispatch `Release CPM Pages` ở ref main,
   input `approved_sha` 40 ký tự hex, `mode=release`. Workflow từ ref khác bị chặn. SHA release phải là current main.
2. Authorize job xác minh ancestry/main và owner-only environment reviewer. Build job read-only checkout đúng SHA,
   chạy `npm ci` → `npm run verify`; release-manifest từ chối dirty tree hoặc fixture.
3. Build upload artifact cùng run, lưu SHA/run ID/file inventory hash, artifact ID và artifact digest trong
   receipt/Actions summary. **Owner review đúng receipt/artifact đó**, rồi approve job `github-pages`.
4. Job deploy không checkout/chạy app code; sau approval kiểm tra lại SHA, same-run artifact ID/digest, Pages Actions
   và intent dispatch mới nhất. Nếu bị supersede thì fail rõ “nothing deployed”, không ghi run thành deploy success.
5. Deploy/rollback dùng chung serialized group, `cancel-in-progress: false`. Không giả queue FIFO; run mới không tự
   hủy deploy đang chạy. Không rebuild hoặc thay artifact sau owner approval.
6. Đối chiếu deployment actual SHA/artifact/run với receipt. Kiểm tra `/` trả 200 HTML redirect + anchor `/vi/`,
   `/vi/`, `/en/`, 404/SEO/route refresh. Artifact pass không thay bằng chứng HTTP trên Pages. First release
   đã có các bằng chứng này; lần release kế tiếp phải ghi receipt mới.

## Rollback

- Nếu first release chưa deploy được: xác nhận last successful deployment/site còn gì trước khi retry.
  Nếu cần restore legacy, owner approve đổi source về **branch rollback sạch đã verify**, không dùng main mới.
- Actions rollback: owner chọn exact known-good accepted commit đã từng nghiệm thu, xác minh tree/history,
  dừng các ý định promotion mới, dispatch ở trusted main với `mode=rollback` + target SHA. Workflow cho phép
  ancestor đã chấp nhận nhưng vẫn build/verify, tạo receipt mới và đòi owner artifact approval.
- Revalidate latest intent sau approval. Reject/cancel các pending approvals sai ý định trước khi resume release;
  không hủy job đang deploy. Ghi SHA target riêng, deployment/run/digest và hậu kiểm HTTP.
- Không có live rollback rehearsal trong first release. Remote rollback branch, owner permission, environment
  enforcement và provider receipt đã được chứng minh; rollback vẫn là thao tác có chủ đích cần receipt riêng.

## Nghiệm thu còn mở

Owner đã ủy quyền chọn budget theo best practice 2026. Với profile lab đã ghi trong [live-acceptance receipt](../plans/2026-10-14-no-issue-cpm-static-v1/reports/2026-10-16-live-acceptance.md), budget accepted là same-origin decoded bytes ≤300,000 và median lab LCP ≤2,500 ms; đây không phải field/Core Web Vitals p75, Lighthouse hay cold-font proof. First release baseline 224,914 bytes và median LCP 592 ms đạt budget lab này.
Kiểm tra live thêm → deploy → gỡ → deploy chỉ với bài thật owner cho phép. Lần deploy gỡ bài và hậu kiểm route cũ vẫn pending; overall v1 chưa gọi là nghiệm thu.

Tham chiếu: [deploy-pages](https://github.com/actions/deploy-pages),
[upload-pages-artifact](https://github.com/actions/upload-pages-artifact),
[deployment approvals](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments),
[concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).
