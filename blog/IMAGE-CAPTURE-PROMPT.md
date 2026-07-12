# Blog Evidence Screenshot Standard

Use this workflow for screenshots that contain UI text, numbers, logos, or source evidence.

## Why the previous images looked soft

The source PNGs were not compressed incorrectly. The three challenge screenshots are only `800×540`, while the
article previously displayed them at up to `1160–1880` CSS pixels. The browser therefore enlarged the raster image.
The perks capture is `1030×520` and had the same issue on wide screens.

The safe fix is:

1. Recapture the exact source section at 2× device pixel ratio.
2. Never display an evidence image above its intrinsic pixel width.
3. Put essential facts in native HTML; use the screenshot as documentary evidence.
4. Link every evidence figure to its original-resolution PNG.
5. Never use generative enhancement on text-heavy evidence.

## Preferred capture prompt — Vietnamese

```text
Bạn là chuyên gia browser capture và image QA.

Nguồn: [SOURCE URL]. Người dùng đã đăng nhập sẵn. Tuyệt đối không hiển thị, ghi lại,
hoặc xuất credential, cookie, session token, email cá nhân hay dữ liệu đăng nhập.

Mục tiêu:
Tạo screenshot sắc nét và trung thực tuyệt đối để dùng làm bằng chứng trong một bài blog
công khai bằng tiếng Anh.

Các section cần chụp riêng:
1. Problem statement
2. Build direction và Expected outcomes
3. Data notes và Recommended build stack
4. Các AABW perks thực sự được sử dụng

Yêu cầu chụp:
- Dùng viewport desktop rộng 1440 CSS pixels, browser zoom 100%, device pixel ratio 2.
- Chờ network idle và document.fonts.ready trước khi chụp.
- Chụp đúng DOM element của từng section; không chụp toàn viewport có nhiều khoảng trống.
- Giữ 24–32px context padding quanh section, không cắt tiêu đề hoặc dòng chữ.
- Loại bỏ cursor, tooltip, hover state, focus ring, loading skeleton và thông tin tài khoản.
- Giữ nguyên tuyệt đối mọi ký tự, dấu câu, con số, logo, màu và bố cục nguồn.
- Không dùng generative fill, AI upscaling, OCR redraw, text reconstruction hoặc content-aware fill.
- Nếu nội dung bị che, tải chưa xong hoặc không đọc được, dừng và báo “recapture required”.
  Không đoán hoặc tự điền phần thiếu.
- Chỉ redact thông tin cá nhân/bí mật; không sửa nội dung challenge công khai.

Output:
- Master PNG sRGB rộng tối thiểu 2400px cho figure full-width.
- Optional PNG derivative rộng 1600px cho responsive delivery.
- Không dùng JPEG cho screenshot chứa chữ.
- Đặt tên file bằng lowercase-kebab-case.
- Trả về dimensions, file size, English alt text, caption, source URL và thời điểm truy cập.

QA bắt buộc:
- So sánh ảnh với trang nguồn ở zoom 100% và 200%.
- Xác nhận không có dòng bị cắt, chữ bị đổi, số liệu sai hoặc logo biến dạng.
- Privacy scan: không có email, account menu, credential, token, customer data hay ID nhạy cảm.
- Nếu không thể bảo đảm text fidelity, loại ảnh và yêu cầu chụp lại.
```

## Preferred capture prompt — English

```text
Act as a browser-capture and image-QA specialist.

Source: [SOURCE URL]. The user is already authenticated. Never expose, record, or export
credentials, cookies, session tokens, personal email addresses, or login data.

Goal:
Produce sharp, text-faithful evidence screenshots for a public English-language blog.

Capture these sections separately:
1. Problem statement
2. Build direction and Expected outcomes
3. Data notes and Recommended build stack
4. The AABW perks actually used

Capture requirements:
- Use a 1440 CSS-pixel desktop viewport, 100% browser zoom, and device pixel ratio 2.
- Wait for network idle and document.fonts.ready.
- Capture the exact DOM element for each section, not a large viewport with empty space.
- Keep 24–32px of context padding without clipping headings or text lines.
- Remove the cursor, tooltips, hover states, focus rings, loading placeholders, and account UI.
- Preserve every character, punctuation mark, number, logo, color, and layout exactly.
- Do not use generative fill, generative enhancement, AI upscaling, OCR redraw, text
  reconstruction, or content-aware fill.
- If content is obscured, incomplete, or illegible, stop and report “recapture required.”
  Never infer or invent missing content.
- Redact only private or sensitive information; do not alter public challenge content.

Output:
- An sRGB PNG master at least 2400px wide for a full-width figure.
- An optional 1600px PNG responsive derivative.
- Do not use JPEG for text-heavy interface captures.
- Use lowercase-kebab-case filenames.
- Report dimensions, file size, English alt text, caption, source URL, and access date.

Mandatory QA:
- Compare every capture with the source at 100% and 200% zoom.
- Confirm that no line is clipped and no character, number, or logo has changed.
- Privacy-scan for account UI, email, credentials, tokens, customer data, and sensitive IDs.
- Reject the image and request a recapture if exact text fidelity cannot be guaranteed.
```

## Fallback when the source cannot be recaptured

This fallback can make edges look cleaner, but it cannot recover detail absent from the original.

```text
Treat this PNG as immutable documentary evidence.

Allowed operations only:
- lossless crop and padding;
- sRGB profile normalization;
- deterministic 2× Lanczos resampling;
- very mild unsharp masking after resampling: radius 0.5–0.8px, amount no more than 60%,
  threshold 2.

Forbidden:
- generative enhancement or super-resolution;
- text or logo reconstruction;
- OCR redraw;
- content-aware fill;
- denoising that changes letter shapes;
- invented pixels presented as original detail.

Do not claim to recover detail that is absent from the source. If any original text is not
reliably legible, report “recapture required” instead of guessing. Compare all text and numbers
with the input before exporting a lossless PNG.
```

## Embed checklist

- Keep `width` and `height` attributes equal to the real intrinsic dimensions.
- Use `decoding="async"`; lazy-load below-the-fold figures.
- Use `image-rendering: auto`; do not apply blur or aggressive sharpening filters.
- Set `max-width` to the image's intrinsic width so CSS never upscales it.
- Add a visible “Open original PNG” link.
- When true 1× and 2× captures exist, use `srcset` and an accurate `sizes` attribute.
- Repeat essential information as native, accessible HTML instead of forcing readers to zoom a screenshot.
