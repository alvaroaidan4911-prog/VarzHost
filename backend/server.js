const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config/env.js' });

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. SERVE STATIC FILES WITH CLEAN URLS
// ==========================================
// Menyediakan folder assets (css, js, images)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Mengizinkan akses langsung ke folder utama (index.html, pricing.html, login.html, register.html)
// Dengan opsi extensions, jika ketik "/pricing" akan otomatis membaca "pricing.html"
app.use(express.static(path.join(__dirname, '../'), { extensions: ['html', 'htm'] }));

// Mengizinkan akses ke folder dashboard dan admin dengan URL bersih
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard'), { extensions: ['html', 'htm'] }));
app.use('/admin', express.static(path.join(__dirname, '../admin'), { extensions: ['html', 'htm'] }));


// ==========================================
// 3. API ROUTES
// ==========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hosting', require('./routes/hosting'));
app.use('/api/payments', require('./routes/payments'));


// ==========================================
// 4. 404 HANDLE (Jika halaman tidak ditemukan)
// ==========================================
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../404.html'));
});


// ==========================================
// 5. JALANKAN SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`VarzHost Server berjalan di http://localhost:${PORT}`);
});

