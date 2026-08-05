// Fungsi untuk mengambil data paket dari Backend Node.js
async function loadHostingPlans() {
    try {
        const response = await fetch('https://expects-managing-consequence-housewives.trycloudflare.com/api/hosting/plans');
        const plans = await response.json();

        // Cari elemen container tempat kartu pricing diletakkan
        const pricingContainer = document.getElementById('pricing-container');
        if (!pricingContainer) return;

        pricingContainer.innerHTML = ''; // Kosongkan container sebelum diisi

        // Looping data dari database ke bentuk HTML
        plans.forEach(plan => {
            const card = `
                <div class="pricing-card">
                    <h3>${plan.name}</h3>
                    <p class="price">Rp ${parseFloat(plan.price_per_month).toLocaleString('id-ID')}/bln</p>
                    <ul class="features">
                        <li>Storage: ${plan.storage_gb} GB</li>
                        <li>Bandwidth: ${plan.bandwidth_gb} GB</li>
                        <li>Tipe: ${plan.type.toUpperCase()}</li>
                    </ul>
                    <p class="description">${plan.description}</p>
                    <button class="btn-order" onclick="orderPlan(${plan.id})">Pesan Sekarang</button>
                </div>
            `;
            pricingContainer.innerHTML += card;
        });
    } catch (error) {
        console.error('Gagal memuat paket hosting:', error);
    }
}

// Jalankan fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', loadHostingPlans);

async function orderPlan(planId) {
    // 1. Cek apakah user sudah login
    const token = localStorage.getItem('varz_token');
    if (!token) {
        alert('Kamu harus login terlebih dahulu untuk memesan paket hosting.');
        window.location.href = '/login';
        return;
    }

    // 2. Minta input nama domain dari user
    const domainName = prompt("Masukkan nama domain untuk hosting kamu (contoh: websitemu.com):");
    
    if (!domainName || domainName.trim() === "") {
        alert("Pemesanan dibatalkan. Nama domain wajib diisi.");
        return;
    }

    try {
        // 3. Kirim request checkout ke backend
        const response = await fetch('https://expects-managing-consequence-housewives.trycloudflare.com/api/payments/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Menyertakan JWT token untuk verifikasi keamanan
            },
            body: JSON.stringify({
                plan_id: planId,
                domain_name: domainName
            })
        });

        const data = await response.json();

        if (response.status === 201) {
            alert(`🎉 ${data.message}\nTotal Tagihan: Rp ${parseFloat(data.total_billing).toLocaleString('id-ID')}`);
            // Alihkan pelanggan ke halaman invoices di dashboard untuk melihat tagihan
            window.location.href = '/dashboard';
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error('Error saat checkout:', error);
        alert('Gagal memproses pesanan. Pastikan server aktif.');
    }
}

