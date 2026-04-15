const express = require('express');
const router = express.Router(); // Khởi tạo bộ gom nhóm đường dẫn của API
const authController = require('../controllers/authController'); // Load bộ điều khiển xử lý (não bộ)

// Khi người dùng gửi lệnh POST đến URL /register (Đăng ký) -> Gọi hàm register xử lý
router.post('/register', authController.register);

// Khi người dùng gửi lệnh POST đến URL /login (Đăng nhập) -> Gọi hàm login xử lý
router.post('/login', authController.login);

module.exports = router; // Đẩy Router ra ngoài để dùng trong server.js
