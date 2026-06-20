// db.js
const mysql = require('mysql2');

// Buat koneksi
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'wandaadii',
    password: 'pasbatron',
    database: 'wwwpasba_database_spmunion_otics'
});

// Connect ke database
connection.connect((err) => {
    if (err) {
        console.error('❌ Koneksi gagal:', err.message);
        return;
    }
    console.log('✅ Berhasil terkoneksi ke MySQL');
});

module.exports = connection;
