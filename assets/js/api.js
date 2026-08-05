const API_URL = 'https://full-sheffield-treasury-hearts.trycloudflare.com/api';

// Contoh fungsi pendaftaran user baru
async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        return await response.json();
    } catch (error) {
        console.error("Gagal menghubungkan ke server:", error);
    }
}

