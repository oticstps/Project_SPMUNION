import React, { useState } from 'react';
import Buttonv1 from '../button/Buttonv1'; // Sesuaikan path

const Formv1 = () => {
  const [formData, setFormData] = useState({
    // Data Pribadi
    nip: '',
    nama: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'L',
    agama: '',
    golonganDarah: '',
    statusKeluarga: 'Belum Menikah',
    jumlahAnak: 0,
    namaPasangan: '',
    // Kontak & Alamat
    email: '',
    noHp: '',
    alamat: '',
    kontakDarurat: '',
    noDarurat: '',
    // Data Pekerjaan
    jabatan: '',
    departemen: '',
    tanggalMasuk: '',
    statusKaryawan: 'Tetap',
    // Pendidikan
    pendidikanTerakhir: '',
    institusi: '',
    tahunLulus: '',
    // Kesehatan
    riwayatSakit: '',
    golonganDarah: '',
    bpjsKesehatan: '',
    bpjsKetenagakerjaan: '',
    // Keuangan
    npwp: '',
    bank: '',
    noRekening: '',
    namaRekening: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email tidak valid';
    if (!formData.noHp.trim()) newErrors.noHp = 'No HP harus diisi';
    if (!formData.jabatan) newErrors.jabatan = 'Jabatan harus dipilih';
    // Tambahkan validasi lain sesuai kebutuhan
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log('Data karyawan:', formData);
    alert('Data berhasil disimpan!');
  };

  const handleReset = () => {
    setFormData({
      nip: '',
      nama: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: 'L',
      agama: '',
      golonganDarah: '',
      statusKeluarga: 'Belum Menikah',
      jumlahAnak: 0,
      namaPasangan: '',
      email: '',
      noHp: '',
      alamat: '',
      kontakDarurat: '',
      noDarurat: '',
      jabatan: '',
      departemen: '',
      tanggalMasuk: '',
      statusKaryawan: 'Tetap',
      pendidikanTerakhir: '',
      institusi: '',
      tahunLulus: '',
      riwayatSakit: '',
      bpjsKesehatan: '',
      bpjsKetenagakerjaan: '',
      npwp: '',
      bank: '',
      noRekening: '',
      namaRekening: '',
    });
    setErrors({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Form Data Karyawan Lengkap</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Grid 3 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ===== Data Pribadi ===== */}
          <div className="col-span-3">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Data Pribadi</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NIP</label>
            <input type="text" name="nip" value={formData.nip} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" name="nama" value={formData.nama} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg ${errors.nama ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
            <input type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
            <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
            <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Agama</label>
            <select name="agama" value={formData.agama} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Pilih Agama</option>
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddha">Buddha</option>
              <option value="Konghucu">Konghucu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Golongan Darah</label>
            <select name="golonganDarah" value={formData.golonganDarah} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Pilih</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status Keluarga</label>
            <select name="statusKeluarga" value={formData.statusKeluarga} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="Belum Menikah">Belum Menikah</option>
              <option value="Menikah">Menikah</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Anak</label>
            <input type="number" name="jumlahAnak" value={formData.jumlahAnak} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pasangan</label>
            <input type="text" name="namaPasangan" value={formData.namaPasangan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* ===== Kontak & Alamat ===== */}
          <div className="col-span-3 mt-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Kontak & Alamat</h3>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No HP <span className="text-red-500">*</span></label>
            <input type="tel" name="noHp" value={formData.noHp} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg ${errors.noHp ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.noHp && <p className="text-red-500 text-xs mt-1">{errors.noHp}</p>}
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
            <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kontak Darurat (Nama)</label>
            <input type="text" name="kontakDarurat" value={formData.kontakDarurat} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No Telepon Darurat</label>
            <input type="tel" name="noDarurat" value={formData.noDarurat} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* ===== Data Pekerjaan ===== */}
          <div className="col-span-3 mt-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Data Pekerjaan</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
            <select name="jabatan" value={formData.jabatan} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg ${errors.jabatan ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Pilih Jabatan</option>
              <option value="Staff">Staff</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Manager">Manager</option>
              <option value="Direktur">Direktur</option>
            </select>
            {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
            <select name="departemen" value={formData.departemen} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Pilih Departemen</option>
              <option value="HRD">HRD</option>
              <option value="Keuangan">Keuangan</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Operasional">Operasional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Masuk</label>
            <input type="date" name="tanggalMasuk" value={formData.tanggalMasuk} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status Karyawan</label>
            <select name="statusKaryawan" value={formData.statusKaryawan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="Tetap">Tetap</option>
              <option value="Kontrak">Kontrak</option>
              <option value="Magang">Magang</option>
              <option value="Harian">Harian</option>
            </select>
          </div>

          {/* ===== Pendidikan ===== */}
          <div className="col-span-3 mt-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Pendidikan</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pendidikan Terakhir</label>
            <select name="pendidikanTerakhir" value={formData.pendidikanTerakhir} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Pilih</option>
              <option value="SMA/SMK">SMA/SMK</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Institusi</label>
            <input type="text" name="institusi" value={formData.institusi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Lulus</label>
            <input type="number" name="tahunLulus" value={formData.tahunLulus} onChange={handleChange} min="1900" max="2100" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* ===== Kesehatan ===== */}
          <div className="col-span-3 mt-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Kesehatan</h3>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Riwayat Sakit / Penyakit Kronis</label>
            <textarea name="riwayatSakit" value={formData.riwayatSakit} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Misal: Asma, Diabetes, dll"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">BPJS Kesehatan</label>
            <input type="text" name="bpjsKesehatan" value={formData.bpjsKesehatan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">BPJS Ketenagakerjaan</label>
            <input type="text" name="bpjsKetenagakerjaan" value={formData.bpjsKetenagakerjaan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* ===== Keuangan ===== */}
          <div className="col-span-3 mt-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Data Keuangan</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NPWP</label>
            <input type="text" name="npwp" value={formData.npwp} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bank</label>
            <select name="bank" value={formData.bank} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="Mandiri">Mandiri</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="CIMB Niaga">CIMB Niaga</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Rekening</label>
            <input type="text" name="noRekening" value={formData.noRekening} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Atas Nama Rekening</label>
            <input type="text" name="namaRekening" value={formData.namaRekening} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center space-x-4 mt-8 pt-4 border-t">
          <Buttonv1 type="submit" variant="primary" size="lg">
            Simpan Data Karyawan
          </Buttonv1>
          <Buttonv1 type="button" variant="outline" size="lg" onClick={handleReset}>
            Reset Form
          </Buttonv1>
        </div>
      </form>
    </div>
  );
};

export default Formv1;