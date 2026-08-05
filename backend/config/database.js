const mysql = require('mysql2');
require('./env'); // Mengambil konfigurasi environment jika ada

// Membuat pool koneksi ke MariaDB Termux
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Kosongkan jika root MariaDB Termux kamu belum diberi password
    database: 'varzhost',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mengubah pool menjadi format promise agar bisa menggunakan async/await
const db = pool.promise();

module.exports = db;
