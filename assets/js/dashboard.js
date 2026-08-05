document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('varz_token');
    
    // ==========================================================
    // LOGIKA HALAMAN UTAMA DASHBOARD (INDEX STATS)
    // ==========================================================
    const statActive = document.getElementById('stat-active-services');
    const statUnpaid = document.getElementById('stat-unpaid-invoices');
    const statTotal = document.getElementById('stat-total-invoices');

    if (statActive || statUnpaid || statTotal) {
        async function loadDashboardStats() {
            try {
                const response = await fetch('https://full-sheffield-treasury-hearts.trycloudflare.com/api/payments/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const stats = await response.json();

                if (response.ok) {
                    if (statActive) statActive.innerText = stats.active_services;
                    if (statUnpaid) statUnpaid.innerText = stats.unpaid_invoices;
                    if (statTotal) statTotal.innerText = stats.total_invoices;
                }
            } catch (error) {
                console.error('Gagal memuat statistik dashboard:', error);
            }
        }
        loadDashboardStats();
    }

    // ==========================================================
    // LOGIKA HALAMAN TAGIHAN SAYA (INVOICES)
    // ==========================================================
    const tableBody = document.getElementById('invoice-table-body');

    if (tableBody) {
        async function loadInvoices() {
            try {
                const response = await fetch('https://full-sheffield-treasury-hearts.trycloudflare.com/api/payments/invoices', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const invoices = await response.json();

                tableBody.innerHTML = '';

                if (invoices.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8;">Belum ada riwayat tagihan.</td></tr>`;
                    return;
                }

                invoices.forEach(inv => {
                    const isUnpaid = inv.status === 'unpaid';
                    const statusColor = isUnpaid ? '#ef4444' : '#10b981';
                    
                    const row = `
                        <tr style="border-bottom: 1px solid #334155;">
                            <td style="padding: 12px;">#INV-${inv.id}</td>
                            <td style="padding: 12px;">${inv.plan_name || 'Hosting Plan'}</td>
                            <td style="padding: 12px; font-style: italic;">${inv.domain_name}</td>
                            <td style="padding: 12px;">Rp ${parseFloat(inv.amount).toLocaleString('id-ID')}</td>
                            <td style="padding: 12px; color: ${statusColor}; font-weight: bold;">${inv.status.toUpperCase()}</td>
                            <td style="padding: 12px;">
                                ${isUnpaid ? `<button class="btn-order" style="padding: 5px 10px; font-size: 0.85rem;" onclick="payInvoice(${inv.id})">Bayar Instan</button>` : `<span style="color:#94a3b8;">Selesai</span>`}
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } catch (error) {
                console.error('Gagal mengambil data invoice:', error);
            }
        }

        window.payInvoice = async (invoiceId) => {
            if (!confirm('Apakah kamu ingin mensimulasikan pembayaran lunas untuk invoice ini?')) return;

            try {
                const response = await fetch(`https://full-sheffield-treasury-hearts.trycloudflare.com/api/payments/pay/${invoiceId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                alert(data.message);
                loadInvoices();
            } catch (error) {
                console.error('Gagal membayar:', error);
            }
        };

        loadInvoices();
    }

    // ==========================================================
    // LOGIKA HALAMAN LAYANAN SAYA (SERVICES)
    // ==========================================================
    const servicesContainer = document.getElementById('services-container');
    
    if (servicesContainer) {
        async function loadActiveServices() {
            try {
                const response = await fetch('https://full-sheffield-treasury-hearts.trycloudflare.com/api/payments/services', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const services = await response.json();
                servicesContainer.innerHTML = '';

                if (!Array.isArray(services) || services.length === 0) {
                    servicesContainer.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                            <h3>Belum ada layanan yang aktif</h3>
                            <p>Silakan lakukan pemesanan paket dan selesaikan pembayaran invoice Anda.</p>
                            <a href="/" class="btn-order" style="display:inline-block; width:auto; margin-top:15px; padding: 10px 20px; text-decoration:none;">Beli Paket Sekarang</a>
                        </div>`;
                    return;
                }

                services.forEach(srv => {
                    const planName = srv.plan_name || 'Paket Hosting';
                    const storage = srv.storage_gb || '0';
                    const bandwidth = srv.bandwidth_gb || '0';
                    const domain = srv.domain_name || 'Tanpa Domain';

                    const card = `
                        <div class="pricing-card" style="border-color: #10b981; text-align: left; margin-bottom: 20px;">
                            <span style="background-color: #10b981; color: #0f172a; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; float: right;">ACTIVE</span>
                            <h3 style="color: #38bdf8; margin-bottom: 5px;">${planName}</h3>
                            <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 15px; word-break: break-all;">🌐 ${domain}</p>
                            
                            <ul class="features" style="margin-bottom: 20px; list-style: none; padding-left: 0;">
                                <li style="color: white; margin-bottom: 5px;">✓ Penyimpanan: ${storage} GB</li>
                                <li style="color: white; margin-bottom: 5px;">✓ Bandwidth: ${bandwidth} GB</li>
                                <li style="color: #10b981; margin-bottom: 5px;">✓ Status: Selamanya Aktif</li>
                            </ul>
                            
                            <button class="btn-order" style="background-color: #1e293b; color: white; border: 1px solid #334155; width: 100%;" onclick="manageHosting('${domain}')">Masuk cPanel</button>
                        </div>
                    `;
                    servicesContainer.innerHTML += card;
                });
            } catch (error) {
                console.error('Gagal mengambil data layanan:', error);
                alert("Terjadi Error Frontend: " + error.message);
                servicesContainer.innerHTML = `<p style="color: #ef4444; text-align: center;">Gagal terhubung dengan sistem server.</p>`;
            }
        }

        // Diubah agar mengarahkan pengguna ke halaman cPanel simulasi
        window.manageHosting = (domain) => {
            window.location.href = `/dashboard/cpanel.html?domain=${encodeURIComponent(domain)}`;
        };

        loadActiveServices();
    }
});

