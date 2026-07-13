# Stage — Portfolio Review Workspace

`Stage/` là khu vực review riêng cho bản redesign portfolio. Mục tiêu là giúp phân biệt rõ:

- website production: các file ở repository root trên branch `master`;
- bản đang review: các file trong `Stage/` trên review branch;
- nội dung tạm, screenshot QA: để trong `tmp/qa/` hoặc `output/`, không để trong `Stage/`.

## Mở bản review

Khi local preview server đang chạy từ repository root:

```text
http://127.0.0.1:4173/Stage/
```

## Folder contract

```text
Stage/
├── README.md   # Quy tắc review và promote
├── index.html  # Homepage review; link sang production assets bằng ../
├── home.css    # Visual system và responsive behavior của bản review
└── home.js     # Interaction, motion, navigation, và accessibility
```

Không copy `assets/`, `showcase/`, `blog/`, hoặc CV vào đây. Bản Stage dùng lại public-safe assets hiện có để tránh tạo nhiều source of truth.

## Stage safety rules

- Chỉ sửa redesign homepage trong folder này trong giai đoạn review.
- Production analytics bị tắt để lượt review không làm nhiễu dữ liệu thật.
- Trang có `noindex, nofollow, noarchive`.
- Không đặt raw data, PBIX/PBIT, secret, local path, hoặc thông tin confidential trong Stage.
- Không merge nguyên folder `Stage/` vào `master`; tracked file trên `master` sẽ trở thành public qua GitHub Pages.

## Promote lên production

Sau khi approve:

1. Đồng bộ ba file Stage sang homepage root.
2. Đổi các link `../assets`, `../showcase`, `../blog`, và `../cv.html` về đường dẫn root.
3. Bật lại production analytics và metadata `index, follow`.
4. Chạy link, privacy, keyboard, desktop, tablet, mobile, và reduced-motion QA.
5. Xóa folder `Stage/` khỏi commit production.
6. Chỉ sau đó mới merge/push lên `master`.

Như vậy `Stage/` luôn là nơi review rõ ràng, còn root `master` luôn là website public canonical.
