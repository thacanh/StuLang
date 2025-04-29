# StuLang Backend API

Backend API cho hệ thống học từ vựng tiếng Anh StuLang, sử dụng FastAPI và MySQL.

## Yêu cầu hệ thống

- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd backend
```

2. Tạo và kích hoạt môi trường ảo:
```bash
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
```

3. Cài đặt các dependencies:
```bash
pip install -r requirements.txt
```

4. Tạo file `.env` trong thư mục `backend` với nội dung:
```
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/stulang
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Tạo database và tables:
```bash
# Kết nối MySQL và chạy file SQL để tạo database và tables
mysql -u username -p < database.sql
```

## Chạy server

```bash
uvicorn app.main:app --reload
```

Server sẽ chạy tại `http://localhost:8000`

## API Documentation

Sau khi chạy server, truy cập:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Các endpoint chính

### Authentication
- POST `/register` - Đăng ký user mới
- POST `/token` - Đăng nhập và nhận JWT token

### User
- GET `/users/me` - Lấy thông tin user hiện tại

### Vocabulary
- GET `/vocabulary` - Lấy danh sách từ vựng
- POST `/vocabulary` - Thêm từ vựng mới (admin only)

### Learning Cycle
- POST `/cycles` - Tạo chu kỳ học mới
- GET `/cycles/current` - Lấy chu kỳ học hiện tại
- POST `/cycles/vocabulary` - Thêm từ vào chu kỳ học
- PUT `/cycles/vocabulary/{word_id}` - Cập nhật trạng thái từ vựng

### Chat
- POST `/chat` - Chat với AI

## Bảo mật

- Sử dụng JWT cho xác thực
- Mật khẩu được mã hóa bằng bcrypt
- CORS được cấu hình để bảo vệ API
- Phân quyền admin/user

## Phát triển

1. Tạo branch mới:
```bash
git checkout -b feature/your-feature-name
```

2. Commit changes:
```bash
git add .
git commit -m "Description of changes"
```

3. Push lên remote:
```bash
git push origin feature/your-feature-name
```

4. Tạo Pull Request trên GitHub

## Testing

```bash
pytest
```

## License

MIT 