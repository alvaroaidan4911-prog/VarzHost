const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Endpoint: POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Semua kolom harus diisi!' });
    }
    try {
        const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username atau Email sudah digunakan.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi!' });
    }

    try {
        // 1. Cek apakah email terdaftar
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const user = users[0];

        // 2. Validasi Password menggunakan bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        // 3. Buat JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'VARZHOST_SUPER_KEY';
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: '2h' }
        );

        // 4. Kirim respon sukses beserta tokennya ke frontend
        res.status(200).json({
            message: 'Login berhasil!',
            token: token,
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server backend.' });
    }
});

module.exports = router;
