const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Ambil token dari header 'Authorization'
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    // Biasanya format token: "Bearer <TOKEN>", kita ambil <TOKEN>-nya saja
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Format token salah.' });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || 'VARZHOST_SUPER_KEY';
        // Verifikasi token
        const verified = jwt.verify(token, jwtSecret);
        req.user = verified; // Masukkan data user (id, username, role) ke objek request
        next(); // Lanjut ke fungsi utama rute
    } catch (error) {
        res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};

