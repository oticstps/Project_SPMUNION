import pandas as pd
import mysql.connector
from mysql.connector import Error
import os
import sys

def import_excel_to_mysql():
    # Konfigurasi
    excel_file = 'D:\\on\\Project_Pasbatron\\d-core\\project-spm\\database\\database_spm.xlsx'
    
    # Pastikan file Excel ada
    if not os.path.exists(excel_file):
        print(f"ERROR: File '{excel_file}' tidak ditemukan!")
        print(f"Lokasi saat ini: {os.getcwd()}")
        print("\nFile yang ada di direktori ini:")
        for file in os.listdir('.'):
            if file.endswith(('.xlsx', '.xls')):
                print(f"  - {file}")
        
        # Tanya user untuk memasukkan nama file yang benar
        excel_file = input("\nMasukkan nama file Excel (contoh: database_spm.xlsx): ").strip()
        if not os.path.exists(excel_file):
            print("File tidak ditemukan! Program dihentikan.")
            return
    
    # Inisialisasi variabel
    connection = None
    cursor = None
    
    try:
        # Koneksi database
        print("Menghubungkan ke MySQL database...")
        connection = mysql.connector.connect(
            host='localhost',
            user='wandaadii',
            password='pasbatron',
            database='database_spmunionotics'
        )
        
        if connection.is_connected():
            print("✓ Berhasil terhubung ke MySQL database")
            
            # Baca Excel
            print(f"\nMembaca file Excel: {excel_file}")
            df = pd.read_excel(excel_file)
            print(f"✓ Data Excel berhasil dibaca: {len(df)} baris, {len(df.columns)} kolom")
            
            # Tampilkan nama kolom untuk verifikasi
            print("\nKolom yang ditemukan di Excel:")
            for i, col in enumerate(df.columns, 1):
                print(f"  {i:2}. {col}")
            
            # Bersihkan nama kolom (hapus spasi di awal/akhir)
            df.columns = [str(col).strip() for col in df.columns]
            
            # Jika ada kolom dengan nama yang sama, beri suffix
            cols = pd.Series(df.columns)
            duplicates = cols[cols.duplicated()].unique()
            for dup in duplicates:
                cols[cols == dup] = [f'{dup}_{i}' if i != 0 else dup for i in range(sum(cols == dup))]
            df.columns = cols
            
            # Buat cursor
            cursor = connection.cursor()
            
            # Buat tabel jika belum ada
            create_table_query = """
            CREATE TABLE IF NOT EXISTS employees (
                id INT PRIMARY KEY AUTO_INCREMENT,
                excel_number INT,
                serial_number INT,
                nik VARCHAR(20) UNIQUE,
                full_name VARCHAR(100),
                plant VARCHAR(50),
                section VARCHAR(50),
                production_line VARCHAR(50),
                line_status VARCHAR(50),
                position VARCHAR(50),
                employment_status VARCHAR(10),
                gender VARCHAR(5),
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
            cursor.execute(create_table_query)
            print("✓ Tabel 'employees' sudah tersedia")
            
            # Insert data
            print("\nMemulai proses import data...")
            success_count = 0
            error_count = 0
            
            for index, row in df.iterrows():
                try:
                    # Debug: Tampilkan progress setiap 50 baris
                    if (index + 1) % 50 == 0:
                        print(f"  Memproses baris {index + 1}...")
                    
                    # Query insert
                    insert_query = """
                    INSERT INTO employees (
                        excel_number, serial_number, nik, full_name, plant, section,
                        production_line, line_status, position, employment_status, gender,
                        birth_year, birth_month, birth_day, date_of_birth,
                        join_year, join_month, join_day, join_date,
                        age_at_joining, current_age, length_of_service, remarks
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                               %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    # Siapkan data - dengan error handling untuk setiap kolom
                    try:
                        excel_number = int(row['No.']) if 'No.' in row and pd.notnull(row['No.']) else None
                    except:
                        excel_number = None
                    
                    try:
                        serial_number = int(row['No Urut']) if 'No Urut' in row and pd.notnull(row['No Urut']) else None
                    except:
                        serial_number = None
                    
                    try:
                        nik = str(row['NIK']) if 'NIK' in row and pd.notnull(row['NIK']) else None
                    except:
                        nik = None
                    
                    try:
                        full_name = str(row['NAMA']) if 'NAMA' in row and pd.notnull(row['NAMA']) else None
                    except:
                        full_name = None
                    
                    # Lanjutkan untuk kolom lainnya...
                    data = (
                        excel_number,
                        serial_number,
                        nik,
                        full_name,
                        str(row['PLANT']) if 'PLANT' in row and pd.notnull(row['PLANT']) else None,
                        str(row['SECTION']) if 'SECTION' in row and pd.notnull(row['SECTION']) else None,
                        str(row['LINE']) if 'LINE' in row and pd.notnull(row['LINE']) else None,
                        str(row['STATUS LINE']) if 'STATUS LINE' in row and pd.notnull(row['STATUS LINE']) else None,
                        str(row['JABATAN']) if 'JABATAN' in row and pd.notnull(row['JABATAN']) else None,
                        str(row['Status Karyawan']) if 'Status Karyawan' in row and pd.notnull(row['Status Karyawan']) else None,
                        str(row['Jenis Kelamin']) if 'Jenis Kelamin' in row and pd.notnull(row['Jenis Kelamin']) else None,
                        int(row['Y']) if 'Y' in row and pd.notnull(row['Y']) else None,
                        int(row['M']) if 'M' in row and pd.notnull(row['M']) else None,
                        int(row['D']) if 'D' in row and pd.notnull(row['D']) else None,
                        pd.to_datetime(row['Tanggal Lahir']).date() if 'Tanggal Lahir' in row and pd.notnull(row['Tanggal Lahir']) else None,
                        int(row['Y.1']) if 'Y.1' in row and pd.notnull(row['Y.1']) else int(row['Y']) if 'Y' in row and pd.notnull(row['Y']) else None,
                        int(row['M.1']) if 'M.1' in row and pd.notnull(row['M.1']) else int(row['M']) if 'M' in row and pd.notnull(row['M']) else None,
                        int(row['D.1']) if 'D.1' in row and pd.notnull(row['D.1']) else int(row['D']) if 'D' in row and pd.notnull(row['D']) else None,
                        pd.to_datetime(row['Tgl Masuk']).date() if 'Tgl Masuk' in row and pd.notnull(row['Tgl Masuk']) else None,
                        int(row['Usia Masuk PT OTICS']) if 'Usia Masuk PT OTICS' in row and pd.notnull(row['Usia Masuk PT OTICS']) else None,
                        int(row['Usia Saat ini']) if 'Usia Saat ini' in row and pd.notnull(row['Usia Saat ini']) else None,
                        str(row['Lama kerja']) if 'Lama kerja' in row and pd.notnull(row['Lama kerja']) else None,
                        str(row['Keterangan']) if 'Keterangan' in row and pd.notnull(row['Keterangan']) else None
                    )
                    
                    cursor.execute(insert_query, data)
                    success_count += 1
                    
                except Exception as e:
                    error_count += 1
                    print(f"  Error pada baris {index + 2}: {str(e)[:100]}...")
                    # Tampilkan data yang bermasalah untuk debugging
                    if error_count <= 3:  # Batasi output error
                        print(f"    Data: NIK={row.get('NIK', 'N/A')}, NAMA={row.get('NAMA', 'N/A')}")
                    continue
            
            # Commit perubahan
            connection.commit()
            
            # Tampilkan hasil
            print("\n" + "="*50)
            print("HASIL IMPORT DATA")
            print("="*50)
            print(f"Total baris diproses: {len(df)}")
            print(f"Data berhasil diimport: {success_count}")
            print(f"Error: {error_count}")
            
            # Cek data di database
            if cursor:
                cursor.execute("SELECT COUNT(*) FROM employees")
                total_in_db = cursor.fetchone()[0]
                print(f"Total data di database: {total_in_db}")
            
    except Error as e:
        print(f"\n❌ Error MySQL: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Pastikan koneksi ditutup
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("\nKoneksi MySQL ditutup.")

if __name__ == "__main__":
    print("="*60)
    print("PROGRAM IMPORT DATA EXCEL KE DATABASE MYSQL")
    print("="*60)
    
    import_excel_to_mysql()
    
    print("\nProgram selesai.")
    input("Tekan Enter untuk keluar...")