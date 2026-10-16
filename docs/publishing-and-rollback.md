# CPM — Phát hành và rollback

Site chỉ upload artifact `dist/` đã kiểm tra. Không upload repository, mock, docs, plan, fixture hoặc drafts.
Source nội dung và URL theo [hợp đồng kỹ thuật](cpm-v1-technical-contract.md); lệnh local ở [README](../README.md).

## Provider và evidence lookup

- Repository scope: `cuupham/cuupham.github.io`; Pages URL: `https://cuupham.github.io/`; provider source must be `build_type=workflow` before a release merge.
- Repository owner identity is `cuupham`. Read current Pages source with `gh api repos/cuupham/cuupham.github.io/pages`, main with `gh api repos/cuupham/cuupham.github.io/git/ref/heads/main`, environment with `gh api repos/cuupham/cuupham.github.io/environments/github-pages`, branch policy with `gh api repos/cuupham/cuupham.github.io/environments/github-pages/deployment-branch-policies`, and rollback ref with `gh api repos/cuupham/cuupham.github.io/git/ref/heads/pages-legacy-safe`.
- Read deployments and workflow receipts from the repository's GitHub Actions and Pages settings. Refresh them immediately before each mutation; a prior run or local report is not current-state proof.
- Use the owner credential when more than one `gh` identity is available, without changing the user's default account. Never record credential values. Read repository/environment secrets only to verify the boundary; do not expose values or inject them into unaccepted PR jobs.
- Verify `github-pages` has the owner-only required reviewer and custom branch policy restricted to `main`. The environment approval is the deploy gate; the release flag only enables the authorized workflow path.
- The verified legacy rollback ref is `pages-legacy-safe` at `65d7a15fbf756be6260d4a0363d0955b5bf0ef99`; re-GET the ref and tree before every source switch or legacy restore. The tree must remain a clean README-only snapshot without app, drafts, mock, plans or docs pass-through.
- External Actions receipts and provider settings are the operational source of truth. Local release records may retain detailed inventories and observations but are not linked from this public guide.

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

## Source switch và recurring release

Khi Pages còn legacy main/root, không merge app, drafts hoặc pass-through docs vào nhánh đang public. Trước source switch,
owner review source diff, sequence và rollback ref; verify `pages-legacy-safe` vẫn trỏ exact SHA/tree nêu trên. Nếu rollback
proof hoặc provider state không còn đúng, **không switch**.

Sau khi Pages source là Actions:

1. PR workflow chạy read-only với `contents: read`, checkout không persist credentials và không privileged follow-up. Không inject secrets vào source PR chưa được chấp nhận.
2. Merge source đã review vào trusted `main`; deploy workflow chỉ dispatch thủ công, không trigger push.
3. Set `CPM_PAGES_RELEASE_ENABLED=true` only for the authorized release path. The flag permits authorization/build; it is not artifact approval and does not itself deploy.
4. Dispatch with the exact accepted main SHA. Build `npm ci` → `npm run verify`, upload the same-run artifact, and record SHA, run, inventory and digest.
5. Owner reviews the exact receipt/artifact. Only then approve the `github-pages` environment; that approval is the deploy gate. Revalidate SHA, same-run artifact ID/digest, Pages source and latest intent before deploy.
6. After deploy, verify live routes, 404/SEO, artifact-to-live evidence and any authorized content lifecycle. Auto-deploy remains disabled unless separately approved.

Pushing or merging main, setting the release flag, or passing CI never substitutes for review of the exact artifact.

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
   Mỗi release phải có receipt và hậu kiểm riêng.

## Rollback

- Nếu một release chưa deploy được: xác nhận last successful deployment/site còn gì trước khi retry.
  Nếu cần restore legacy, owner approve đổi source về **branch rollback sạch đã verify**, không dùng main mới.
- Actions rollback: owner chọn exact known-good accepted commit đã từng nghiệm thu, xác minh tree/history,
  dừng các ý định promotion mới, dispatch ở trusted main với `mode=rollback` + target SHA. Workflow cho phép
  ancestor đã chấp nhận nhưng vẫn build/verify, tạo receipt mới và đòi owner artifact approval.
- Revalidate latest intent sau approval. Reject/cancel các pending approvals sai ý định trước khi resume release;
  không hủy job đang deploy. Ghi SHA target riêng, deployment/run/digest và hậu kiểm HTTP.
- Rollback live rehearsal chưa là release evidence; rollback vẫn là thao tác có chủ đích, cần owner approval,
  exact target, receipt riêng và hậu kiểm HTTP.

## Nghiệm thu và ngân sách hiệu năng

Budget lab cho home: tài nguyên same-origin đã giải mã không quá 300.000 byte và median LCP của ba lần tải không quá 2.500 ms.
Đo bằng BrowserOS neo ở 375×812, CPU slowdown 4×, latency 150 ms, download 200.000 byte/s, upload 75.000 byte/s,
browser cache tắt và ghi rõ trạng thái font cache của profile. Chờ font và ảnh eager hoàn tất trước khi lấy kết quả;
ghi lưu lượng font ngoài riêng. Budget này không chứng minh field/Core Web Vitals p75, điểm Lighthouse hoặc fully cold font.

Nghiệm thu vòng thêm → deploy → gỡ → deploy phải dùng bài thật được owner cho phép. Sau deploy gỡ bài cuối,
hai locale home vẫn trả 200; list/detail cũ phải trả 404. Giữ kết quả, điều kiện đo và receipt trong hồ sơ local.

Tham chiếu: [deploy-pages](https://github.com/actions/deploy-pages),
[upload-pages-artifact](https://github.com/actions/upload-pages-artifact),
[deployment approvals](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments),
[concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).
