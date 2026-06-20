const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});


pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal mendapatkan koneksi dari pool:', err.message);
  } else {
    console.log('✅ Pool MySQL siap');
    connection.release();
  }
});

module.exports = pool;
















// const mysql = require('mysql2');
// const connection = mysql.createConnection({
//   host: 'trial.pasbatron.net',
//   user: 'wwwpasba_wandaadii',
//   password: '-Lr@F[,EmbMY',
//   database: 'wwwpasba_database_spmunion_otics',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // localhost
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'wandaadii',
//   password: 'pasbatron',
//   database: 'wwwpasba_database_spmunion_otics',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
// connection.connect((err) => {
//     if (err) {
//         console.error('❌ Koneksi gagal:', err.message);
//         return;
//     }
//     console.log('✅ Berhasil terkoneksi ke MySQL');
// });
// module.exports = connection;









