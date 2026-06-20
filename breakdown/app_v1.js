const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Database
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'wandaadii',
    password: process.env.DB_PASSWORD || '10wanda41',
    database: process.env.DB_NAME || 'database_spmunionotics',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Membuat pool koneksi database
const pool = mysql.createPool(dbConfig);

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /xlsx|xls/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Hanya file Excel (.xlsx, .xls) yang diperbolehkan!'));
        }
    }
});

// Middleware untuk koneksi database
const withConnection = async (req, res, next) => {
    try {
        req.db = await pool.getConnection();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Koneksi database gagal',
            error: error.message
        });
    }
};

// Fungsi untuk membuat atau memastikan tabel ada
async function createTableIfNotExists(connection) {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        excel_number INT,
        serial_number INT,
        nik VARCHAR(20) UNIQUE,
        full_name VARCHAR(100) NOT NULL,
        plant VARCHAR(50),
        section VARCHAR(50),
        production_line VARCHAR(50),
        line_status VARCHAR(50),
        position VARCHAR(50),
        employment_status ENUM('T', 'K', 'KL', 'MG', 'OS', 'Tr') NOT NULL,
        gender ENUM('L', 'P') NOT NULL,
        birth_year INT,
        birth_month INT,
        birth_day INT,
        date_of_birth DATE,
        join_year INT,
        join_month INT,
        join_day INT,
        join_date DATE,
        age_at_joining INT,
        current_age INT,
        length_of_service VARCHAR(20),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_nik (nik),
        INDEX idx_full_name (full_name),
        INDEX idx_plant (plant),
        INDEX idx_section (section)
    )
    `;

    await connection.query(createTableQuery);
    console.log('Tabel employees sudah tersedia');
}

// Fungsi untuk membaca dan memproses file Excel
function processExcelFile(filePath) {
    try {
        // Baca workbook
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Konversi ke JSON
        const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });
        
        // Mapping nama kolom
        const columnMapping = {
            'No.': 'excel_number',
            'No Urut': 'serial_number',
            'NIK': 'nik',
            'NAMA': 'full_name',
            'PLANT': 'plant',
            'SECTION': 'section',
            'LINE': 'production_line',
            'STATUS LINE': 'line_status',
            'JABATAN': 'position',
            'Status Karyawan': 'employment_status',
            'Jenis Kelamin': 'gender',
            'Y': 'birth_year',
            'M': 'birth_month',
            'D': 'birth_day',
            'Tanggal Lahir': 'date_of_birth',
            'Y.1': 'join_year',
            'M.1': 'join_month',
            'D.1': 'join_day',
            'Tgl Masuk': 'join_date',
            'Usia Masuk PT OTICS': 'age_at_joining',
            'Usia Saat ini': 'current_age',
            'Lama kerja': 'length_of_service',
            'Keterangan': 'remarks'
        };

        console.log(`File Excel berhasil dibaca: ${data.length} baris ditemukan`);
        
        return {
            success: true,
            data: data,
            columns: Object.keys(data[0] || {}),
            rowCount: data.length
        };
    } catch (error) {
        console.error('Error membaca file Excel:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Fungsi untuk memformat tanggal
function formatDate(dateValue) {
    if (!dateValue) return null;
    
    // Jika sudah dalam format Date object
    if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
    }
    
    // Jika dalam format string
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return date.toISOString().split('T')[0];
}

// Fungsi untuk mengimport data ke database
async function importDataToDatabase(connection, excelData) {
    const insertQuery = `
    INSERT INTO employees (
        excel_number, serial_number, nik, full_name, plant, section,
        production_line, line_status, position, employment_status, gender,
        birth_year, birth_month, birth_day, date_of_birth,
        join_year, join_month, join_day, join_date,
        age_at_joining, current_age, length_of_service, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        plant = VALUES(plant),
        section = VALUES(section),
        production_line = VALUES(production_line),
        line_status = VALUES(line_status),
        position = VALUES(position),
        employment_status = VALUES(employment_status),
        gender = VALUES(gender),
        date_of_birth = VALUES(date_of_birth),
        join_date = VALUES(join_date),
        age_at_joining = VALUES(age_at_joining),
        current_age = VALUES(current_age),
        length_of_service = VALUES(length_of_service),
        remarks = VALUES(remarks),
        updated_at = CURRENT_TIMESTAMP
    `;

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        try {
            // Menyiapkan data
            const data = [
                row['No.'] ? parseInt(row['No.']) : null,
                row['No Urut'] ? parseInt(row['No Urut']) : null,
                row['NIK'] ? String(row['NIK']) : null,
                row['NAMA'] ? String(row['NAMA']) : null,
                row['PLANT'] ? String(row['PLANT']) : null,
                row['SECTION'] ? String(row['SECTION']) : null,
                row['LINE'] ? String(row['LINE']) : null,
                row['STATUS LINE'] ? String(row['STATUS LINE']) : null,
                row['JABATAN'] ? String(row['JABATAN']) : null,
                row['Status Karyawan'] ? String(row['Status Karyawan']) : null,
                row['Jenis Kelamin'] ? String(row['Jenis Kelamin']) : null,
                row['Y'] ? parseInt(row['Y']) : null,
                row['M'] ? parseInt(row['M']) : null,
                row['D'] ? parseInt(row['D']) : null,
                formatDate(row['Tanggal Lahir']),
                row['Y.1'] ? parseInt(row['Y.1']) : (row['Y'] ? parseInt(row['Y']) : null),
                row['M.1'] ? parseInt(row['M.1']) : (row['M'] ? parseInt(row['M']) : null),
                row['D.1'] ? parseInt(row['D.1']) : (row['D'] ? parseInt(row['D']) : null),
                formatDate(row['Tgl Masuk']),
                row['Usia Masuk PT OTICS'] ? parseInt(row['Usia Masuk PT OTICS']) : null,
                row['Usia Saat ini'] ? parseInt(row['Usia Saat ini']) : null,
                row['Lama kerja'] ? String(row['Lama kerja']) : null,
                row['Keterangan'] ? String(row['Keterangan']) : null
            ];

            await connection.query(insertQuery, data);
            successCount++;

            // Log progress setiap 50 baris
            if (successCount % 50 === 0) {
                console.log(`  Diproses: ${successCount}/${excelData.length}`);
            }
        } catch (error) {
            errorCount++;
            errors.push({
                row: i + 2, // +2 karena header + index dimulai dari 0
                nik: row['NIK'],
                nama: row['NAMA'],
                error: error.message
            });
            
            // Batasi jumlah error yang ditampilkan
            if (errors.length <= 5) {
                console.error(`Error baris ${i + 2}: ${error.message}`);
            }
        }
    }

    return {
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Kembalikan maksimal 10 error
    };
}

// ==================== ROUTES ====================

// Route untuk mengecek koneksi database
app.get('/api/health', withConnection, async (req, res) => {
    try {
        const [result] = await req.db.query('SELECT 1 as test');
        res.json({
            success: true,
            message: 'Koneksi database berhasil',
            database: dbConfig.database,
            test: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Koneksi database gagal',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk mendapatkan informasi database
app.get('/api/database/info', withConnection, async (req, res) => {
    try {
        // Cek versi MySQL
        const [versionResult] = await req.db.query('SELECT VERSION() as version');
        
        // Cek daftar tabel
        const [tablesResult] = await req.db.query('SHOW TABLES');
        
        // Cek data employees jika ada
        let employeesCount = 0;
        let employeesColumns = [];
        
        try {
            const [countResult] = await req.db.query('SELECT COUNT(*) as count FROM employees');
            employeesCount = countResult[0].count;
            
            const [columnsResult] = await req.db.query('DESCRIBE employees');
            employeesColumns = columnsResult.map(col => col.Field);
        } catch (e) {
            // Tabel mungkin belum ada
        }
        
        res.json({
            success: true,
            database: {
                name: dbConfig.database,
                version: versionResult[0].version,
                tables: tablesResult.map(row => Object.values(row)[0])
            },
            employees: {
                tableExists: employeesCount >= 0,
                rowCount: employeesCount,
                columns: employeesColumns
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mendapatkan informasi database',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk membuat tabel employees
app.post('/api/database/create-table', withConnection, async (req, res) => {
    try {
        await createTableIfNotExists(req.db);
        
        res.json({
            success: true,
            message: 'Tabel employees berhasil dibuat/dipastikan sudah ada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error membuat tabel',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk upload dan import data Excel
app.post('/api/import/excel', upload.single('excelFile'), withConnection, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Tidak ada file yang diupload'
        });
    }

    try {
        const filePath = req.file.path;
        
        // Proses file Excel
        const excelResult = processExcelFile(filePath);
        if (!excelResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Gagal membaca file Excel',
                error: excelResult.error
            });
        }

        // Pastikan tabel ada
        await createTableIfNotExists(req.db);

        // Import data ke database
        console.log('Memulai import data ke database...');
        const importResult = await importDataToDatabase(req.db, excelResult.data);

        // Hapus file setelah diproses
        fs.unlinkSync(filePath);

        // Hitung total data di database
        const [countResult] = await req.db.query('SELECT COUNT(*) as count FROM employees');
        const totalInDb = countResult[0].count;

        res.json({
            success: true,
            message: 'Import data berhasil',
            fileInfo: {
                originalName: req.file.originalname,
                rowCount: excelResult.rowCount,
                columns: excelResult.columns
            },
            importResult: {
                processed: excelResult.rowCount,
                success: importResult.successCount,
                errors: importResult.errorCount,
                errorDetails: importResult.errors
            },
            database: {
                totalRecords: totalInDb
            }
        });
    } catch (error) {
        console.error('Error dalam proses import:', error);
        res.status(500).json({
            success: false,
            message: 'Error dalam proses import',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk mendapatkan data karyawan dengan pagination
app.get('/api/employees', withConnection, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        
        const search = req.query.search || '';
        const plant = req.query.plant || '';
        const section = req.query.section || '';

        let query = 'SELECT * FROM employees WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM employees WHERE 1=1';
        const params = [];
        const countParams = [];

        // Filter pencarian
        if (search) {
            query += ' AND (full_name LIKE ? OR nik LIKE ?)';
            countQuery += ' AND (full_name LIKE ? OR nik LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Filter plant
        if (plant) {
            query += ' AND plant = ?';
            countQuery += ' AND plant = ?';
            params.push(plant);
            countParams.push(plant);
        }

        // Filter section
        if (section) {
            query += ' AND section = ?';
            countQuery += ' AND section = ?';
            params.push(section);
            countParams.push(section);
        }

        // Order dan limit
        query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        // Eksekusi query
        const [rows] = await req.db.query(query, params);
        const [countResult] = await req.db.query(countQuery, countParams);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get distinct values for filters
        const [plants] = await req.db.query('SELECT DISTINCT plant FROM employees WHERE plant IS NOT NULL ORDER BY plant');
        const [sections] = await req.db.query('SELECT DISTINCT section FROM employees WHERE section IS NOT NULL ORDER BY section');

        res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                plants: plants.map(p => p.plant),
                sections: sections.map(s => s.section)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mengambil data karyawan',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk mendapatkan statistik data
app.get('/api/employees/statistics', withConnection, async (req, res) => {
    try {
        const queries = [
            // Total karyawan
            'SELECT COUNT(*) as total FROM employees',
            
            // Status karyawan
            'SELECT employment_status, COUNT(*) as count FROM employees GROUP BY employment_status',
            
            // Jenis kelamin
            'SELECT gender, COUNT(*) as count FROM employees GROUP BY gender',
            
            // Plant distribution
            'SELECT plant, COUNT(*) as count FROM employees WHERE plant IS NOT NULL GROUP BY plant',
            
            // Section distribution
            'SELECT section, COUNT(*) as count FROM employees WHERE section IS NOT NULL GROUP BY section LIMIT 10',
            
            // Usia rata-rata
            'SELECT AVG(current_age) as avg_age FROM employees WHERE current_age IS NOT NULL',
            
            // Lama kerja rata-rata (dari length_of_service)
            'SELECT AVG(CAST(SUBSTRING_INDEX(length_of_service, " ", 1) AS UNSIGNED)) as avg_years FROM employees WHERE length_of_service LIKE "%Th%"'
        ];

        const [
            totalResult,
            statusResult,
            genderResult,
            plantResult,
            sectionResult,
            ageResult,
            serviceResult
        ] = await Promise.all(queries.map(q => req.db.query(q)));

        res.json({
            success: true,
            statistics: {
                total: totalResult[0][0].total,
                byStatus: statusResult[0].reduce((acc, row) => {
                    acc[row.employment_status] = row.count;
                    return acc;
                }, {}),
                byGender: genderResult[0].reduce((acc, row) => {
                    acc[row.gender] = row.count;
                    return acc;
                }, {}),
                byPlant: plantResult[0],
                bySection: sectionResult[0],
                averageAge: ageResult[0][0].avg_age ? Math.round(ageResult[0][0].avg_age) : null,
                averageServiceYears: serviceResult[0][0].avg_years ? Math.round(serviceResult[0][0].avg_years) : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mengambil statistik',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk mengupdate data karyawan
app.put('/api/employees/:id', withConnection, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validasi ID
        const [existing] = await req.db.query('SELECT id FROM employees WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data karyawan tidak ditemukan'
            });
        }

        // Bangun query update dinamis
        const allowedFields = [
            'full_name', 'plant', 'section', 'production_line', 'line_status',
            'position', 'employment_status', 'gender', 'date_of_birth',
            'join_date', 'age_at_joining', 'current_age', 'length_of_service', 'remarks'
        ];

        const updateFields = [];
        const updateValues = [];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada data yang valid untuk diupdate'
            });
        }

        updateValues.push(id);

        const updateQuery = `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`;
        await req.db.query(updateQuery, updateValues);

        // Ambil data yang sudah diupdate
        const [updatedData] = await req.db.query('SELECT * FROM employees WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Data berhasil diupdate',
            data: updatedData[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mengupdate data',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk menghapus data karyawan
app.delete('/api/employees/:id', withConnection, async (req, res) => {
    try {
        const { id } = req.params;

        // Validasi ID
        const [existing] = await req.db.query('SELECT id FROM employees WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data karyawan tidak ditemukan'
            });
        }

        await req.db.query('DELETE FROM employees WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Data berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error menghapus data',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk export data ke Excel
app.get('/api/export/excel', withConnection, async (req, res) => {
    try {
        // Ambil semua data
        const [rows] = await req.db.query('SELECT * FROM employees ORDER BY id');
        
        // Konversi ke worksheet
        const worksheet = xlsx.utils.json_to_sheet(rows);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Employees');
        
        // Generate buffer
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        // Set header untuk download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=employees_export.xlsx');
        
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error export data',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk import dari file yang sudah ada di server
app.post('/api/import/local', withConnection, async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(400).json({
                success: false,
                message: 'File tidak ditemukan'
            });
        }

        // Proses file Excel
        const excelResult = processExcelFile(filePath);
        if (!excelResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Gagal membaca file Excel',
                error: excelResult.error
            });
        }

        // Pastikan tabel ada
        await createTableIfNotExists(req.db);

        // Import data ke database
        console.log('Memulai import data ke database...');
        const importResult = await importDataToDatabase(req.db, excelResult.data);

        // Hitung total data di database
        const [countResult] = await req.db.query('SELECT COUNT(*) as count FROM employees');
        const totalInDb = countResult[0].count;

        res.json({
            success: true,
            message: 'Import data berhasil',
            importResult: {
                processed: excelResult.rowCount,
                success: importResult.successCount,
                errors: importResult.errorCount,
                errorDetails: importResult.errors
            },
            database: {
                totalRecords: totalInDb
            }
        });
    } catch (error) {
        console.error('Error dalam proses import:', error);
        res.status(500).json({
            success: false,
            message: 'Error dalam proses import',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Route untuk testing tanpa upload file
app.post('/api/import/test-sample', withConnection, async (req, res) => {
    try {
        // Data contoh untuk testing
        const sampleData = [
            {
                'No.': 1,
                'No Urut': 1,
                'NIK': '1997-0007',
                'NAMA': 'Aris Indrawanto',
                'PLANT': 'EJIP',
                'SECTION': 'PROD P1',
                'LINE': 'PROD',
                'STATUS LINE': 'Active',
                'JABATAN': 'Sr Manager',
                'Status Karyawan': 'T',
                'Jenis Kelamin': 'L',
                'Y': 1972,
                'M': 7,
                'D': 7,
                'Tanggal Lahir': new Date('1972-07-07'),
                'Y.1': 1997,
                'M.1': 10,
                'D.1': 27,
                'Tgl Masuk': new Date('1997-10-27'),
                'Usia Masuk PT OTICS': 25,
                'Usia Saat ini': 53,
                'Lama kerja': '28 Th 0 Bln',
                'Keterangan': ''
            }
        ];

        // Pastikan tabel ada
        await createTableIfNotExists(req.db);

        // Import data ke database
        const importResult = await importDataToDatabase(req.db, sampleData);

        res.json({
            success: true,
            message: 'Data contoh berhasil diimport',
            importResult: {
                processed: sampleData.length,
                success: importResult.successCount,
                errors: importResult.errorCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mengimport data contoh',
            error: error.message
        });
    } finally {
        if (req.db) req.db.release();
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: 'Error upload file',
            error: err.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Fungsi untuk memulai server
async function startServer() {
    try {
        // Test koneksi database
        const connection = await pool.getConnection();
        console.log('✅ Berhasil terhubung ke database MySQL');
        console.log(`📊 Database: ${dbConfig.database}`);
        
        // Buat tabel jika belum ada
        await createTableIfNotExists(connection);
        connection.release();
        
        // Mulai server
        app.listen(PORT, () => {
            console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
            console.log('\n📋 Endpoints yang tersedia:');
            console.log('  GET  /api/health           - Cek koneksi database');
            console.log('  GET  /api/database/info    - Info database');
            console.log('  POST /api/database/create-table - Buat tabel');
            console.log('  POST /api/import/excel     - Import data dari Excel (upload)');
            console.log('  POST /api/import/local     - Import data dari path lokal');
            console.log('  GET  /api/employees        - Daftar karyawan dengan filter');
            console.log('  GET  /api/employees/statistics - Statistik karyawan');
            console.log('  PUT  /api/employees/:id    - Update data karyawan');
            console.log('  DELETE /api/employees/:id  - Hapus data karyawan');
            console.log('  GET  /api/export/excel     - Export data ke Excel');
        });
    } catch (error) {
        console.error('❌ Gagal menghubungkan ke database:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('  1. Pastikan MySQL server berjalan');
        console.log('  2. Periksa konfigurasi database di .env file');
        console.log('  3. Pastikan user memiliki akses ke database');
        process.exit(1);
    }
}

// File package.json yang diperlukan
const packageJson = {
    name: "spm-employee-import",
    version: "1.0.0",
    description: "Backend API untuk import data karyawan dari Excel ke MySQL",
    main: "app.js",
    scripts: {
        "start": "node app.js",
        "dev": "nodemon app.js"
    },
    dependencies: {
        "express": "^4.18.2",
        "mysql2": "^3.6.0",
        "multer": "^1.4.5-lts.1",
        "xlsx": "^0.18.5",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1"
    },
    devDependencies: {
        "nodemon": "^3.0.1"
    },
    author: "Your Name",
    license: "MIT"
};

// Jika file package.json belum ada, buat secara otomatis
if (!fs.existsSync('package.json')) {
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('📄 File package.json telah dibuat');
}

// File .env contoh
const envExample = `# Konfigurasi Database MySQL
DB_HOST=localhost
DB_USER=wandaadii
DB_PASSWORD=10wanda41
DB_NAME=database_spmunionotics

# Konfigurasi Server
PORT=3000
NODE_ENV=development

# Konfigurasi Upload
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760  # 10MB

# Logging
LOG_LEVEL=info`;

if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envExample);
    console.log('📄 File .env.example telah dibuat');
}

// File README.md
const readmeContent = `# SPM Employee Import System

Backend API untuk mengimport data karyawan dari file Excel ke database MySQL.

## Instalasi

1. Install Node.js (versi 14 atau lebih baru)
2. Clone repository ini
3. Install dependencies:

\`\`\`bash
npm install
\`\`\`

4. Konfigurasi database di file \`.env\`:

\`\`\`env
DB_HOST=localhost
DB_USER=wandaadii
DB_PASSWORD=10wanda41
DB_NAME=database_spmunionotics
PORT=3000
\`\`\`

5. Pastikan MySQL server berjalan dan database sudah dibuat

## Menjalankan Server

\`\`\`bash
# Development mode (dengan hot reload)
npm run dev

# Production mode
npm start
\`\`\`

Server akan berjalan di http://localhost:3000

## API Endpoints

### 1. Cek Kesehatan
\`GET /api/health\` - Cek koneksi database

### 2. Informasi Database
\`GET /api/database/info\` - Informasi database dan tabel

### 3. Import Data Excel
\`POST /api/import/excel\` - Upload dan import file Excel

**Request:**
- Form-data dengan field \`excelFile\` (file Excel)

**Format Excel yang didukung:**
- Kolom: No., No Urut, NIK, NAMA, PLANT, SECTION, LINE, STATUS LINE, JABATAN, Status Karyawan, Jenis Kelamin, Y, M, D, Tanggal Lahir, Y.1, M.1, D.1, Tgl Masuk, Usia Masuk PT OTICS, Usia Saat ini, Lama kerja, Keterangan

### 4. Data Karyawan
\`GET /api/employees\` - Daftar karyawan dengan pagination dan filter

**Query Parameters:**
- \`page\` - Halaman (default: 1)
- \`limit\` - Jumlah data per halaman (default: 50)
- \`search\` - Pencarian nama atau NIK
- \`plant\` - Filter berdasarkan plant
- \`section\` - Filter berdasarkan section

### 5. Statistik
\`GET /api/employees/statistics\` - Statistik data karyawan

### 6. Export Data
\`GET /api/export/excel\` - Export data ke file Excel

### 7. Update Data
\`PUT /api/employees/:id\` - Update data karyawan

### 8. Hapus Data
\`DELETE /api/employees/:id\` - Hapus data karyawan

## Struktur Database

Tabel \`employees\` memiliki kolom:
- \`id\` - Primary key
- \`nik\` - Nomor Induk Karyawan (unik)
- \`full_name\` - Nama lengkap
- \`plant\`, \`section\`, \`production_line\` - Lokasi kerja
- \`employment_status\` - Status karyawan (T, K, KL, MG, OS, Tr)
- \`gender\` - Jenis kelamin (L, P)
- \`date_of_birth\`, \`join_date\` - Tanggal penting
- \`created_at\`, \`updated_at\` - Timestamp

## Frontend Integration

Contoh request dengan fetch:

\`\`\`javascript
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
\`\`\`

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

MIT`;

if (!fs.existsSync('README.md')) {
    fs.writeFileSync('README.md', readmeContent);
    console.log('📄 File README.md telah dibuat');
}

// Mulai server
startServer();