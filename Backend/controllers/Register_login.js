const bcrypt = require('bcrypt'); // Thư viện băm/mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện tạo khoá phiên làm việc (Token)
const db = require('../../config/db'); // Kéo kết nối database vào

const JWT_SECRET = process.env.JWT_SECRET || 'phantom_super_secret_key'; // Khoá bí mật để tạo Token

// CHỨC NĂNG ĐĂNG KÝ
exports.register = async (req, res) => {
    try {
        // 1. Nhận dữ liệu (Tên, email, Mật Khẩu) từ Frontend gửi lên
        const { fullName, email, password } = req.body;

        // 2. Kiểm tra xeo có bị sót thông tin không
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // 3. Truy vấn xem Email này đã có ai dùng trong DB chưa?
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email is already registered.' }); // Báo lỗi nếu trùng
        }

        // 4. Mã hoá mật khẩu (Mức độ băm là 10 - tiêu chuẩn)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Tự động lấy phần trước @ của Email để làm Username
        const username = email.split('@')[0];

        // 6. Thực hiện truy vấn chèn dữ liệu vào bảng users 
        // (Lưu ý: role_id = 2 là User/Học viên thông thường mặc định, 1 là Admin)
        const query = `
            INSERT INTO users (role_id, username, password, email, full_name, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.query(query, [2, username, hashedPassword, email, fullName]);

        // 7. Chèn thành công, báo cho Frontend biết
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

// CHỨC NĂNG ĐĂNG NHẬP
exports.login = async (req, res) => {
    try {
        // 1. Lấy thông tin tài khoản (có thể là email hoặc username) và mật khẩu
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Please provide both username/email and password.' });
        }

        // 2. Tìm trong Database xem có user nào chứa username hoặc email trùng khớp?
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [identifier, identifier]
        );

        // 3. Nếu danh sách bằng 0 nghĩa là tài khoản không tồn tại
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Lấy đúng người dùng đầu tiên tìm được
        const user = users[0];

        // 4. So sánh rà soát mật khẩu nhập vào xem có khớp với chuỗi mã hoá (Hash) đang lưu trong DB không
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials.' }); // Sai pass
        }

        // 5. Đăng nhập thành công, tạo Token dán dấu mộc (Hạn 1 ngày = 1d) để thiết lập duy trì đăng nhập
        const token = jwt.sign(
            { id: user.id, role_id: user.role_id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 6. Trả lại thông tin user cơ bản cùng Token cho Frontend
        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};
