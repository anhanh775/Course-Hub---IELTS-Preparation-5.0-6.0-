# Course Hub – bản mỗi unit một file HTML

## Cấu trúc
- `index.html` – trang chủ
- `unit1.html` … `unit8.html` – mỗi unit một trang. **Dữ liệu của unit nằm ngay trong file đó** (khối `window.UNIT`), nên cập nhật unit nào chỉ cần thay file của unit đó.
- `config.js` – link Google Classroom và danh sách tên 8 unit (dùng chung)
- `style.css`, `common.js` – giao diện và code dùng chung (ít khi phải sửa)
- `uploads/` – (tự tạo) nơi để PDF/audio, ví dụ `uploads/unit6-coursebook.pdf`

## Đưa lên Netlify
1. Tạo repository GitHub, tải **toàn bộ nội dung thư mục này** lên (kéo thả trên github.com cũng được).
2. Netlify → Add new site → Import an existing project → chọn repository. Không cần lệnh build.

## Cập nhật một unit sau này
1. Làm xong `unit6.html` (hoặc nhờ Claude làm), tải file đó lên repository, ghi đè file cũ.
2. Netlify tự cập nhật sau 1–2 phút. Các unit khác không bị ảnh hưởng.
3. PDF/audio: tải vào thư mục `uploads/` rồi ghi đường dẫn `uploads/ten-file.pdf` vào `links` hoặc `audio` trong file unit.

## Chế độ canh thời gian (dành cho giáo viên)
Nút này ẩn với học viên. Mở trang unit kèm `?gv=1` (ví dụ `unit1.html?gv=1`) mới thấy nút ở cuối trang.
