const express = require('express');
const router = express.Router();
const db = require('../config/database');
const verifyToken = require('../middleware/auth');

// 1. Endpoint: POST /api/payments/checkout
router.post('/checkout', verifyToken, async (req, res) => {
    const { plan_id, domain_name } = req.body;
    const user_id = req.user.id;

    if (!plan_id || !domain_name) {
        return res.status(400).json({ message: 'Paket ID dan nama domain wajib diisi!' });
    }

    try {
        const [plans] = await db.execute('SELECT price_per_month FROM hosting_plans WHERE id = ?', [plan_id]);
        if (plans.length === 0) {
            return res.status(404).json({ message: 'Paket hosting tidak ditemukan.' });
        }
        const price = plans[0].price_per_month;

        const [invoiceResult] = await db.execute(
            'INSERT INTO invoices (user_id, amount, status) VALUES (?, ?, ?)',
            [user_id, price, 'unpaid']
        );

        await db.execute(
            'INSERT INTO user_subscriptions (user_id, plan_id, domain_name, status) VALUES (?, ?, ?, ?)',
            [user_id, plan_id, domain_name, 'pending']
        );

        res.status(201).json({
            message: 'Pesanan berhasil dibuat! Silakan lakukan pembayaran.',
            invoice_id: invoiceResult.insertId,
            total_billing: price
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memproses pesanan di server.' });
    }
});

// 2. Endpoint: GET /api/payments/invoices (Sudah Diperbaiki Agar Sesuai Kepemilikan Invoice)
router.get('/invoices', verifyToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        // Menggunakan kueri yang aman tanpa cross-join tak terkendali
        const [invoices] = await db.execute(
            `SELECT i.*, 
                    (SELECT s.domain_name FROM user_subscriptions s WHERE s.user_id = i.user_id ORDER BY s.id DESC LIMIT 1) as domain_name,
                    (SELECT p.name FROM user_subscriptions s JOIN hosting_plans p ON s.plan_id = p.id WHERE s.user_id = i.user_id ORDER BY s.id DESC LIMIT 1) as plan_name
             FROM invoices i
             WHERE i.user_id = ? 
             ORDER BY i.created_at DESC`, 
            [user_id]
        );
        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memuat data tagihan.' });
    }
});


// 3. Endpoint: POST /api/payments/pay/:id (Sudah diperbaiki kueri update-nya)
router.post('/pay/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const [invoice] = await db.execute(
            'SELECT * FROM invoices WHERE id = ? AND user_id = ? AND status = "unpaid"',
            [id, user_id]
        );

        if (invoice.length === 0) {
            return res.status(400).json({ message: 'Tagihan tidak ditemukan atau sudah dibayar.' });
        }

        await db.execute('UPDATE invoices SET status = "paid" WHERE id = ?', [id]);

        await db.execute(
            'UPDATE user_subscriptions SET status = "active" WHERE user_id = ? AND (status = "pending" OR status = "PENDING")',
            [user_id]
        );

        res.status(200).json({ message: 'Pembayaran sukses! Layanan hosting kamu sekarang aktif.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memproses pembayaran.' });
    }
});

// Endpoint: GET /api/payments/services
router.get('/services', verifyToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        // Hapus bagian ORDER BY s.created_at DESC
        const [services] = await db.execute(
            `SELECT s.*, p.name as plan_name, p.storage_gb, p.bandwidth_gb
             FROM user_subscriptions s
             LEFT JOIN hosting_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = "active"`,
            [user_id]
        );
        res.status(200).json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memuat data layanan aktif.' });
    }
});

// 5. Endpoint: GET /api/payments/stats (Untuk Ringkasan Halaman Depan Dashboard)
router.get('/stats', verifyToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        // Count total layanan aktif
        const [servicesCount] = await db.execute(
            'SELECT COUNT(*) as total FROM user_subscriptions WHERE user_id = ? AND status = "active"',
            [user_id]
        );

        // Count total invoice unpaid (Belum dibayar)
        const [unpaidCount] = await db.execute(
            'SELECT COUNT(*) as total FROM invoices WHERE user_id = ? AND status = "unpaid"',
            [user_id]
        );

        // Count total semua invoice
        const [totalInvoiceCount] = await db.execute(
            'SELECT COUNT(*) as total FROM invoices WHERE user_id = ?',
            [user_id]
        );

        res.status(200).json({
            active_services: servicesCount[0].total,
            unpaid_invoices: unpaidCount[0].total,
            total_invoices: totalInvoiceCount[0].total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memuat statistik dashboard.' });
    }
});


module.exports = router;

