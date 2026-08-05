const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Endpoint: GET /api/hosting/plans
router.get('/plans', async (req, res) => {
    try {
        const [plans] = await db.execute('SELECT * FROM hosting_plans');
        res.status(200).json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data paket hosting.' });
    }
});

// WAJIB: Eksport router di baris paling bawah!
module.exports = router;

