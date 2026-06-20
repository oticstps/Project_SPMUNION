const express = require('express');
const connection = require('./connect'); // import koneksi database

const app = express();
const port = 4000;

// Middleware untuk parsing JSON (jika diperlukan nanti)
app.use(express.json());

// Endpoint GET /employees
app.get('/api/employees', (req, res) => {
    // Query untuk mengambil semua data dari tabel employees
    connection.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            console.error('❌ Error saat mengambil data:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Gagal mengambil data employees'
            });
        }

        // Kirim data dalam format JSON
        res.status(200).json({
            status: 'success',
            data: results
        });
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
});