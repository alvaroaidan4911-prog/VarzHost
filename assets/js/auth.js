document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Mencegah reload halaman bawaan form

            // Mengambil input data dari HTML
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Mengirim data ke backend API Express yang telah kita buat
                const response = await fetch('https://full-sheffield-treasury-hearts.trycloudflare.com/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.status === 201) {
                    alert(data.message); // Registrasi berhasil!
                    window.location.href = '/login'; // Alihkan ke halaman login
                } else {
                    alert(data.message); // Menampilkan pesan error dari backend
                }
            } catch (error) {
                console.error('Error saat registrasi:', error);
                alert('Terjadi kesalahan jaringan atau server mati.');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    // LOGIKA UNTUK FORM LOGIN
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Fetch menembak ke API backend yang kita buat di atas
                const response = await fetch('https://full-sheffield-treasury-hearts.trycloudflare.com/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.status === 200) {
                    alert('Login Sukses!');

                    // SIMPAN TOKEN KE BROWSER CLIENT
                    localStorage.setItem('varz_token', data.token);
                    localStorage.setItem('varz_user', JSON.stringify(data.user));

                    // Alihkan ke halaman dashboard
                    window.location.href = '/dashboard';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error saat login:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});

