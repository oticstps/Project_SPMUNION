# SPM Employee Import System

Backend API untuk mengimport data karyawan dari file Excel ke database MySQL.

## Instalasi

1. Install Node.js (versi 14 atau lebih baru)
2. Clone repository ini
3. Install dependencies:

```bash
npm install
```

4. Konfigurasi database di file `.env`:

```env
DB_HOST=localhost
DB_USER=wandaadii
DB_PASSWORD=10wanda41
DB_NAME=database_spmunionotics
PORT=3000
```

5. Pastikan MySQL server berjalan dan database sudah dibuat

## Menjalankan Server

```bash
# Development mode (dengan hot reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di http://localhost:3000

## API Endpoints

### 1. Cek Kesehatan
`GET /api/health` - Cek koneksi database

### 2. Informasi Database
`GET /api/database/info` - Informasi database dan tabel

### 3. Import Data Excel
`POST /api/import/excel` - Upload dan import file Excel

**Request:**
- Form-data dengan field `excelFile` (file Excel)

**Format Excel yang didukung:**
- Kolom: No., No Urut, NIK, NAMA, PLANT, SECTION, LINE, STATUS LINE, JABATAN, Status Karyawan, Jenis Kelamin, Y, M, D, Tanggal Lahir, Y.1, M.1, D.1, Tgl Masuk, Usia Masuk PT OTICS, Usia Saat ini, Lama kerja, Keterangan

### 4. Data Karyawan
`GET /api/employees` - Daftar karyawan dengan pagination dan filter

**Query Parameters:**
- `page` - Halaman (default: 1)
- `limit` - Jumlah data per halaman (default: 50)
- `search` - Pencarian nama atau NIK
- `plant` - Filter berdasarkan plant
- `section` - Filter berdasarkan section

### 5. Statistik
`GET /api/employees/statistics` - Statistik data karyawan

### 6. Export Data
`GET /api/export/excel` - Export data ke file Excel

### 7. Update Data
`PUT /api/employees/:id` - Update data karyawan

### 8. Hapus Data
`DELETE /api/employees/:id` - Hapus data karyawan

## Struktur Database

Tabel `employees` memiliki kolom:
- `id` - Primary key
- `nik` - Nomor Induk Karyawan (unik)
- `full_name` - Nama lengkap
- `plant`, `section`, `production_line` - Lokasi kerja
- `employment_status` - Status karyawan (T, K, KL, MG, OS, Tr)
- `gender` - Jenis kelamin (L, P)
- `date_of_birth`, `join_date` - Tanggal penting
- `created_at`, `updated_at` - Timestamp

## Frontend Integration

Contoh request dengan fetch:

```javascript
// Upload file Excel
const formData = new FormData();
formData.append('excelFile', fileInput.files[0]);

fetch('http://localhost:3000/api/import/excel', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data));

// Get employees dengan pagination
fetch('http://localhost:3000/api/employees?page=1&limit=10')
.then(response => response.json())
.then(data => console.log(data));
```

## Troubleshooting

1. **Koneksi database gagal:**
   - Pastikan MySQL server berjalan
   - Periksa username dan password di .env
   - Pastikan database sudah dibuat

2. **Upload file gagal:**
   - File harus berformat .xlsx atau .xls
   - Ukuran maksimal 10MB
   - Format kolom harus sesuai

3. **Import data error:**
   - Periksa format tanggal di Excel
   - Pastikan NIK unik (tidak ada duplikat)
   - Cek tipe data setiap kolom

## License

MIT