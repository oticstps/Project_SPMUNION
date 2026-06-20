const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper: ubah string kosong jadi null
const toNullable = (val) => (val === '' || val === undefined || val === null) ? null : val;
const toNullableNumber = (val) => {
    if (val === '' || val === undefined || val === null) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
};

// GET semua karyawan
router.get('/', (req, res) => {
    db.query('SELECT * FROM karyawan ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        res.json(results);
    });
});

// GET satu karyawan by id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM karyawan WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
        res.json(results[0]);
    });
});

// POST tambah karyawan
router.post('/', (req, res) => {
    const data = req.body;

    const columns = [
        'foto', 'nik', 'nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
        'golongan_darah', 'agama', 'status_perkawinan', 'jumlah_anak',
        'alamat_ktp', 'alamat_domisili', 'no_telepon', 'email', 'kontak_darurat',
        'pendidikan_terakhir', 'institusi_pendidikan', 'tahun_lulus', 'jurusan',
        'nip', 'plant', 'bagian', 'line', 'status_line', 'jabatan', 'departemen',
        'tanggal_masuk', 'status_karyawan', 'gaji_pokok', 'tunjangan', 'no_rekening',
        'bank', 'bpjs_kesehatan', 'bpjs_ketenagakerjaan', 'riwayat_sakit', 'catatan_lain'
    ];

    const values = [
        toNullable(data.foto),
        toNullable(data.nik),
        toNullable(data.nama),
        toNullable(data.tempat_lahir),
        toNullable(data.tanggal_lahir),
        toNullable(data.jenis_kelamin),
        toNullable(data.golongan_darah),
        toNullable(data.agama),
        toNullable(data.status_perkawinan),
        toNullableNumber(data.jumlah_anak),
        toNullable(data.alamat_ktp),
        toNullable(data.alamat_domisili),
        toNullable(data.no_telepon),
        toNullable(data.email),
        toNullable(data.kontak_darurat),
        toNullable(data.pendidikan_terakhir),
        toNullable(data.institusi_pendidikan),
        toNullableNumber(data.tahun_lulus),
        toNullable(data.jurusan),
        toNullable(data.nip),
        toNullable(data.plant),
        toNullable(data.bagian),
        toNullable(data.line),
        toNullable(data.status_line),
        toNullable(data.jabatan),
        toNullable(data.departemen),
        toNullable(data.tanggal_masuk),
        toNullable(data.status_karyawan) || 'Kontrak',
        toNullableNumber(data.gaji_pokok),
        toNullableNumber(data.tunjangan),
        toNullable(data.no_rekening),
        toNullable(data.bank),
        toNullable(data.bpjs_kesehatan),
        toNullable(data.bpjs_ketenagakerjaan),
        toNullable(data.riwayat_sakit),
        toNullable(data.catatan_lain)
    ];

    const placeholders = columns.map(() => '?').join(', ');
    const query = `INSERT INTO karyawan (${columns.join(', ')}) VALUES (${placeholders})`;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('❌ Error saat insert:', err);
            return res.status(500).json({ error: 'Gagal menyimpan data', detail: err.message });
        }
        res.status(201).json({ message: 'Data berhasil disimpan', id: result.insertId });
    });
});

// PUT update karyawan
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const columns = [
        'foto', 'nik', 'nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
        'golongan_darah', 'agama', 'status_perkawinan', 'jumlah_anak',
        'alamat_ktp', 'alamat_domisili', 'no_telepon', 'email', 'kontak_darurat',
        'pendidikan_terakhir', 'institusi_pendidikan', 'tahun_lulus', 'jurusan',
        'nip', 'plant', 'bagian', 'line', 'status_line', 'jabatan', 'departemen',
        'tanggal_masuk', 'status_karyawan', 'gaji_pokok', 'tunjangan', 'no_rekening',
        'bank', 'bpjs_kesehatan', 'bpjs_ketenagakerjaan', 'riwayat_sakit', 'catatan_lain'
    ];

    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const query = `UPDATE karyawan SET ${setClause} WHERE id = ?`;

    const values = [
        toNullable(data.foto),
        toNullable(data.nik),
        toNullable(data.nama),
        toNullable(data.tempat_lahir),
        toNullable(data.tanggal_lahir),
        toNullable(data.jenis_kelamin),
        toNullable(data.golongan_darah),
        toNullable(data.agama),
        toNullable(data.status_perkawinan),
        toNullableNumber(data.jumlah_anak),
        toNullable(data.alamat_ktp),
        toNullable(data.alamat_domisili),
        toNullable(data.no_telepon),
        toNullable(data.email),
        toNullable(data.kontak_darurat),
        toNullable(data.pendidikan_terakhir),
        toNullable(data.institusi_pendidikan),
        toNullableNumber(data.tahun_lulus),
        toNullable(data.jurusan),
        toNullable(data.nip),
        toNullable(data.plant),
        toNullable(data.bagian),
        toNullable(data.line),
        toNullable(data.status_line),
        toNullable(data.jabatan),
        toNullable(data.departemen),
        toNullable(data.tanggal_masuk),
        toNullable(data.status_karyawan),
        toNullableNumber(data.gaji_pokok),
        toNullableNumber(data.tunjangan),
        toNullable(data.no_rekening),
        toNullable(data.bank),
        toNullable(data.bpjs_kesehatan),
        toNullable(data.bpjs_ketenagakerjaan),
        toNullable(data.riwayat_sakit),
        toNullable(data.catatan_lain),
        id
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('❌ Error saat update:', err);
            return res.status(500).json({ error: 'Gagal update data', detail: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
        res.json({ message: 'Data berhasil diupdate' });
    });
});

// DELETE karyawan
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM karyawan WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('❌ Error saat delete:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
        res.json({ message: 'Data berhasil dihapus' });
    });
});

module.exports = router;