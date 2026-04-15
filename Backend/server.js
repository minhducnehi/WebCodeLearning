const express = require('express'); // Thư viện chạy web server
const cors = require('cors');       // Thư viện xử lý CORS (Bảo mật tên miền chéo), giúp frontend gọi được API backend
require('dotenv').config();         // Tải biến môi trường (mật khẩu bí mật) nếu có

const authRoutes = require('./routes/auth'); // Lấy các đường dẫn đã được định nghĩa bên file route/auth

const app = express(); // Khởi tạo ứng dụng server

// Các Hàm Trung Gian (Middleware) chạy trước khi tới API
app.use(cors());           // Kích hoạt CORS 
app.use(express.json());   // Chuyển đổi dữ liệu máy khách gửi lên thành chuẩn JSON để Backend dễ đọc

// Gọi Đường Dẫn (Routes)
app.use('/api/auth', authRoutes); // Tất cả API có đường dẫn '/api/auth' sẽ được xử lý bởi file auth.js

// Lắng nghe và Bật Server
const PORT = process.env.PORT || 5000; // Cài đặt chạy ở cổng 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // In ra khi server chạy thành công
});
