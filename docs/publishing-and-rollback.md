# CPM — Phát hành và rollback

Site chỉ upload artifact `dist/` đã kiểm tra. Không upload repository, mock, docs, plan, fixture hoặc drafts.
Source nội dung và URL theo [hợp đồng kỹ thuật](cpm-v1-technical-contract.md); lệnh local ở [README](../README.md).

## Trạng thái đã xác minh ngày 2026-10-15

- Repository `cuupham/cuupham.github.io`, Pages `https://cuupham.github.io/`, HTTPS enforced.
- Pages vẫn là **legacy**, source `main` + `/`; không custom 404. Không có workflow CPM trên remote.
- Main và last successful legacy Pages build cùng commit `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`.
  Tree remote tại commit đó chỉ chứa `README.md`; commit là ứng viên legacy rollback sạch, không chứa app/drafts.
- **Chưa có remote rollback branch riêng được tạo/verify.** Commit còn reachable qua remote main hiện tại;
  không trỏ legacy lại vào main sau khi main chứa app.
- Rulesets API trả `[]`. Secrets API trả HTTP 403; không suy ra secrets bằng 0 hoặc PR boundary đã nghiệm thu.
- Environment `github-pages` hiện chỉ có branch policy, **chưa có required reviewer**; deploy authorize job mới
  sẽ từ chối cho đến khi owner-only approval được cấu hình và kiểm chứng.
- Chưa đổi provider, bật release flag, commit/push/merge app hoặc deploy CPM. Những thao tác đó cần owner cho phép.

Refresh tất cả giá trị trên trước thao tác. Snapshot này không thay bằng chứng live tại lúc phát hành.

## Viết và kiểm tra bài

1. Bắt đầu từ [mẫu bài](../content-templates/post.md); điền title, language, date `YYYY-MM-DD` và nội dung thật.
2. Đặt file tại `src/content/posts/<id>.md|mdx`, assets tại `src/assets/`. Nháp ở `drafts/`, không để ở `public/`.
3. MDX và danh sách imported components được review như code. Không coi static asset graph là sandbox.
4. `npm ci`, `npm run verify`. Xem local bằng `npm run preview`. Không public fixture để giả nội dung thật.
5. Review diff và source SHA. Không merge app vào legacy main/root vì source/drafts có thể bị pass-through.

## Xem acceptance fixture

`npm run acceptance:fixture` tạo input/output riêng trong OS temp và in root JSON có marker rõ ràng.
`npm run preview:acceptance -- --root <root-vừa-tạo>` kiểm tra artifact rồi serve đúng thư mục đó tại
`http://127.0.0.1:4321`. Missing route trả HTTP 404, không SPA fallback. Marker không phải một giấy phép publish.

Trước start, kiểm tra port 4321/PID/root; reuse đúng instance hoặc dừng instance mình tạo. Không chọn port khác
để né process lạ. Script log PID/port/root; Ctrl+C dừng clean. Không copy fixture vào production content/dist.
Khi xong, dừng server, gỡ junction `node_modules` của workspace tạm trước khi cleanup đúng thư mục tạm đã xác minh.
Build production cuối cùng phải qua `npm run verify` sau các lượt fixture/browser.

## Chuyển legacy sang Actions — chỉ sau owner approval

Thực hiện theo thứ tự; chưa có bước mutation nào ở dưới được chạy:

1. Xác minh quyền/secret boundary với owner hoặc token có quyền đọc phù hợp. Repo/org secrets không được inject
   vào job chạy source PR chưa được chấp nhận. `.github/workflows/check.yml` chỉ có contents read,
   checkout không persist credentials và không privileged follow-up. Chạy PR job thực để kiểm chứng logs/permissions.
2. Owner review source diff, sequence chuyển nguồn và rollback. Tạo remote branch `pages-legacy-safe` trỏ
   **đúng** `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`, hoặc một safe target mới đã được review nếu snapshot đổi.
   Nếu branch đã tồn tại, kiểm tra SHA/tree; không force-update tự động. Xác nhận operator có quyền restore.
3. Xác minh branch rollback tồn tại remote và tree không chứa app/drafts/mock/docs pass-through. Nếu thiếu proof,
   **không switch**. Sau approval có thể dùng `gh api repos/cuupham/cuupham.github.io/git/refs -X POST`
   với `ref=refs/heads/pages-legacy-safe` và exact safe SHA đã xác minh; lưu receipt thao tác.
4. Owner cho phép đổi Pages source từ legacy sang GitHub Actions (`build_type=workflow`). Xác minh provider trả
   workflow trước khi merge app/workflows vào main. Source switch có thể tạo khoảng trống tạm trước release đầu;
   chọn thời điểm phù hợp, giữ rollback branch/permissions sẵn sàng.
5. Merge source đã review vào main sau source switch. Deploy workflow chỉ dispatch thủ công, không trigger push.
6. Cấu hình environment `github-pages`: required reviewer duy nhất là user owner, branch policy chỉ cho main
   (hoặc protected main tương ứng). Xác minh enforcement, branch controls và secrets; sau approval mới đặt
   repository variable `CPM_PAGES_RELEASE_ENABLED=true`. Flag mặc định chưa có thì workflow không chạy release.

Không xem việc push/merge main hoặc flag là artifact approval. Chưa được phép bật auto-deploy.

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
   `/vi/`, `/en/`, 404/SEO/route refresh. Artifact pass không thay bằng chứng HTTP trên Pages.

## Rollback

- Nếu first release chưa deploy được: xác nhận last successful deployment/site còn gì trước khi retry.
  Nếu cần restore legacy, owner approve đổi source về **branch rollback sạch đã verify**, không dùng main mới.
- Actions rollback: owner chọn exact known-good accepted commit đã từng nghiệm thu, xác minh tree/history,
  dừng các ý định promotion mới, dispatch ở trusted main với `mode=rollback` + target SHA. Workflow cho phép
  ancestor đã chấp nhận nhưng vẫn build/verify, tạo receipt mới và đòi owner artifact approval.
- Revalidate latest intent sau approval. Reject/cancel các pending approvals sai ý định trước khi resume release;
  không hủy job đang deploy. Ghi SHA target riêng, deployment/run/digest và hậu kiểm HTTP.
- Không có live rehearsal/rollback proof trong lượt local này. Remote rollback branch, owner permission,
  environment enforcement và provider receipt vẫn cần được chứng minh trước first switch.

## Nghiệm thu còn mở

Owner chọn **chờ số đo Pages live rồi mới chốt budget** ngày 2026-10-15. Số đo local là baseline tham khảo,
không phải pass budget hoặc Pages performance. Kiểm tra live thêm → deploy → gỡ → deploy chỉ với bài thật
owner cho phép. Nếu chưa có bài/approval, lifecycle giữ pending và không gọi toàn v1 là đã nghiệm thu.

Tham chiếu: [deploy-pages](https://github.com/actions/deploy-pages),
[upload-pages-artifact](https://github.com/actions/upload-pages-artifact),
[deployment approvals](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments),
[concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).
