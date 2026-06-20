import React, { useState, useEffect, useRef } from 'react';
import Buttonv1 from '../button/Buttonv1';

const API_URL = '/api/karyawan';

// ==================== KOMPONEN PEMBANTU FILTER ====================

// Input teks dengan debounce (NIK, Nama)
const DebouncedInput = ({ name, placeholder, value, onChange, delay = 300 }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== value) {
        onChange({ target: { name, value: inputValue } });
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [inputValue, delay, name, onChange, value]);

  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="border border-gray-300 rounded-md p-3 w-full"
    />
  );
};

// Dropdown dengan pencarian (untuk plant, bagian, jabatan, dll)
const SearchableSelect = ({ name, placeholder, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="border border-gray-300 rounded-md p-3 w-full flex justify-between items-center cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center">
          {value && (
            <button
              onClick={handleClear}
              className="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              type="button"
            >
              ✕
            </button>
          )}
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b">
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded p-2 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`px-4 py-2 cursor-pointer hover:bg-cyan-50 ${
                    opt === value ? 'bg-cyan-100 text-cyan-700' : 'text-gray-900'
                  }`}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">Tidak ada opsi</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== KOMPONEN UTAMA KARYAWAN ====================

const Karyawan = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [karyawan, setKaryawan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedKaryawan, setSelectedKaryawan] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // State untuk nilai unik (dropdown filter)
    const [uniqueValues, setUniqueValues] = useState({
        jabatan: [],
        departemen: [],
        plant: [],
        bagian: [],
        status_karyawan: []
    });

    // State untuk form
    const [formData, setFormData] = useState({
        foto: '', nik: '', nama: '', tempat_lahir: '', tanggal_lahir: '',
        jenis_kelamin: 'Laki-laki', golongan_darah: 'A', agama: '',
        status_perkawinan: 'Belum Kawin', jumlah_anak: 0,
        alamat_ktp: '', alamat_domisili: '', no_telepon: '', email: '',
        kontak_darurat: '', pendidikan_terakhir: '', institusi_pendidikan: '',
        tahun_lulus: '', jurusan: '', nip: '', jabatan: '', departemen: '',
        tanggal_masuk: '', status_karyawan: 'Kontrak', gaji_pokok: '', tunjangan: '',
        no_rekening: '', bank: '', bpjs_kesehatan: '', bpjs_ketenagakerjaan: '',
        riwayat_sakit: '', catatan_lain: ''
    });

    // State untuk filter
    const [filters, setFilters] = useState({
        nik: '',
        nama: '',
        jabatan: '',
        departemen: '',
        status_karyawan: '',
        plant: '',
        bagian: ''
    });

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch data
    const fetchKaryawan = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setKaryawan(data);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKaryawan();
    }, []);

    // Hitung nilai unik untuk dropdown filter
    useEffect(() => {
        if (karyawan.length > 0) {
            const jabatanSet = new Set(karyawan.map(item => item.jabatan).filter(Boolean));
            const departemenSet = new Set(karyawan.map(item => item.departemen).filter(Boolean));
            const plantSet = new Set(karyawan.map(item => item.plant).filter(Boolean));
            const bagianSet = new Set(karyawan.map(item => item.bagian).filter(Boolean));
            const statusSet = new Set(karyawan.map(item => item.status_karyawan).filter(Boolean));

            setUniqueValues({
                jabatan: Array.from(jabatanSet).sort(),
                departemen: Array.from(departemenSet).sort(),
                plant: Array.from(plantSet).sort(),
                bagian: Array.from(bagianSet).sort(),
                status_karyawan: Array.from(statusSet).sort()
            });
        }
    }, [karyawan]);

    // Filter data
    const filteredKaryawan = karyawan.filter(item => {
        return (
            (filters.nik === '' || (item.nik && item.nik.toLowerCase().includes(filters.nik.toLowerCase()))) &&
            (filters.nama === '' || (item.nama && item.nama.toLowerCase().includes(filters.nama.toLowerCase()))) &&
            (filters.jabatan === '' || (item.jabatan && item.jabatan.toLowerCase().includes(filters.jabatan.toLowerCase()))) &&
            (filters.departemen === '' || (item.departemen && item.departemen.toLowerCase().includes(filters.departemen.toLowerCase()))) &&
            (filters.status_karyawan === '' || (item.status_karyawan && item.status_karyawan.toLowerCase() === filters.status_karyawan.toLowerCase())) &&
            (filters.plant === '' || (item.plant && item.plant.toLowerCase().includes(filters.plant.toLowerCase()))) &&
            (filters.bagian === '' || (item.bagian && item.bagian.toLowerCase().includes(filters.bagian.toLowerCase())))
        );
    });

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredKaryawan.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredKaryawan.length / rowsPerPage);

    // Handlers filter
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // reset ke halaman pertama
    };

    const resetFilters = () => {
        setFilters({
            nik: '',
            nama: '',
            jabatan: '',
            departemen: '',
            status_karyawan: '',
            plant: '',
            bagian: ''
        });
        setCurrentPage(1);
    };

    // Handlers pagination
    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // Handler form dan lainnya
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId ? `${API_URL}/${editingId}` : API_URL;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert(editingId ? 'Data berhasil diupdate' : 'Data berhasil disimpan');
                resetForm();
                fetchKaryawan();
                setActiveTab('list');
            } else {
                const error = await res.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menyimpan data');
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditingId(item.id);
        setActiveTab('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus data ini?')) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert('Data dihapus');
                    fetchKaryawan();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleDetail = (item) => {
        setSelectedKaryawan(item);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedKaryawan(null);
    };

    const resetForm = () => {
        setFormData({
            foto: '', nik: '', nama: '', tempat_lahir: '', tanggal_lahir: '',
            jenis_kelamin: 'Laki-laki', golongan_darah: 'A', agama: '',
            status_perkawinan: 'Belum Kawin', jumlah_anak: 0,
            alamat_ktp: '', alamat_domisili: '', no_telepon: '', email: '',
            kontak_darurat: '', pendidikan_terakhir: '', institusi_pendidikan: '',
            tahun_lulus: '', jurusan: '', nip: '', jabatan: '', departemen: '',
            tanggal_masuk: '', status_karyawan: 'Kontrak', gaji_pokok: '', tunjangan: '',
            no_rekening: '', bank: '', bpjs_kesehatan: '', bpjs_ketenagakerjaan: '',
            riwayat_sakit: '', catatan_lain: ''
        });
        setEditingId(null);
    };

    return (
        <div className="p-4 md:p-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 md:flex-none px-4 py-3 font-medium text-sm focus:outline-none ${
                        activeTab === 'list'
                            ? 'border-b-2 border-cyan-500 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    📋 List Karyawan
                </button>
                <button
                    onClick={() => {
                        resetForm();
                        setActiveTab('form');
                    }}
                    className={`flex-1 md:flex-none px-4 py-3 font-medium text-sm focus:outline-none ${
                        activeTab === 'form'
                            ? 'border-b-2 border-cyan-500 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    ➕ Tambah Karyawan
                </button>
            </div>

            {activeTab === 'list' ? (
                <div>
                    {/* Filter Section - Ditingkatkan */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-md font-semibold mb-3">Filter Karyawan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <DebouncedInput
                                name="nik"
                                placeholder="NIK"
                                value={filters.nik}
                                onChange={handleFilterChange}
                            />
                            <DebouncedInput
                                name="nama"
                                placeholder="Nama"
                                value={filters.nama}
                                onChange={handleFilterChange}
                            />
                            <SearchableSelect
                                name="plant"
                                placeholder="Semua Plant"
                                options={uniqueValues.plant}
                                value={filters.plant}
                                onChange={handleFilterChange}
                            />
                            <SearchableSelect
                                name="bagian"
                                placeholder="Semua Bagian"
                                options={uniqueValues.bagian}
                                value={filters.bagian}
                                onChange={handleFilterChange}
                            />
                            <SearchableSelect
                                name="jabatan"
                                placeholder="Semua Jabatan"
                                options={uniqueValues.jabatan}
                                value={filters.jabatan}
                                onChange={handleFilterChange}
                            />
                            <SearchableSelect
                                name="departemen"
                                placeholder="Semua Departemen"
                                options={uniqueValues.departemen}
                                value={filters.departemen}
                                onChange={handleFilterChange}
                            />
                            <SearchableSelect
                                name="status_karyawan"
                                placeholder="Semua Status"
                                options={uniqueValues.status_karyawan}
                                value={filters.status_karyawan}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
                            <span className="text-sm text-gray-600">
                                {filteredKaryawan.length > 0 ? (
                                    <>Menampilkan {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredKaryawan.length)} dari {filteredKaryawan.length} data</>
                                ) : (
                                    'Menampilkan 0 data'
                                )}
                            </span>
                            <button
                                onClick={resetFilters}
                                className="text-sm text-cyan-600 hover:text-cyan-800 p-2"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>

                    {/* Tabel dengan scroll horizontal */}
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bagian</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
                                ) : currentRows.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center py-4">Tidak ada data</td></tr>
                                ) : (
                                    currentRows.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 whitespace-nowrap">{item.nik}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{item.nama}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{item.jabatan}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{item.departemen}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{item.plant}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{item.bagian}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    item.status_karyawan === 'Tetap' ? 'bg-green-100 text-green-800' :
                                                    item.status_karyawan === 'Kontrak' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status_karyawan}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDetail(item)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Detail"
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-cyan-600 hover:text-cyan-900 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Edit"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-900 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Hapus"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination dan Rows Per Page */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Tampilkan</span>
                            <select
                                value={rowsPerPage}
                                onChange={handleRowsPerPageChange}
                                className="border border-gray-300 rounded-md p-2 text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-gray-600">data</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1 || filteredKaryawan.length === 0}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    currentPage === 1 || filteredKaryawan.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-cyan-500 text-white hover:bg-cyan-600'
                                }`}
                            >
                                Prev
                            </button>
                            
                            <span className="text-sm text-gray-600">
                                Halaman {filteredKaryawan.length > 0 ? currentPage : 0} dari {totalPages || 0}
                            </span>
                            
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages || totalPages === 0 || filteredKaryawan.length === 0}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    currentPage === totalPages || totalPages === 0 || filteredKaryawan.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-cyan-500 text-white hover:bg-cyan-600'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // Form Tambah/Edit Karyawan (tetap sama seperti sebelumnya)
                <div className="bg-white rounded-lg shadow p-4 md:p-6 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? 'Edit Karyawan' : 'Tambah Karyawan'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                        {/* Foto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Foto (URL/Path)</label>
                            <input
                                type="text"
                                name="foto"
                                value={formData.foto}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                            />
                        </div>

                        {/* Data Pribadi */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIK *</label>
                                <input
                                    type="text"
                                    name="nik"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                                <input
                                    type="text"
                                    name="tempat_lahir"
                                    value={formData.tempat_lahir}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                <input
                                    type="date"
                                    name="tanggal_lahir"
                                    value={formData.tanggal_lahir}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                <select
                                    name="jenis_kelamin"
                                    value={formData.jenis_kelamin}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                >
                                    <option>Laki-laki</option>
                                    <option>Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Golongan Darah</label>
                                <select
                                    name="golongan_darah"
                                    value={formData.golongan_darah}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                >
                                    <option>A</option>
                                    <option>B</option>
                                    <option>AB</option>
                                    <option>O</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Agama</label>
                                <input
                                    type="text"
                                    name="agama"
                                    value={formData.agama}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Perkawinan</label>
                                <select
                                    name="status_perkawinan"
                                    value={formData.status_perkawinan}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                >
                                    <option>Belum Kawin</option>
                                    <option>Kawin</option>
                                    <option>Cerai Hidup</option>
                                    <option>Cerai Mati</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Anak</label>
                                <input
                                    type="number"
                                    name="jumlah_anak"
                                    value={formData.jumlah_anak}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                        </div>

                        {/* Alamat & Kontak */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alamat KTP</label>
                                <textarea
                                    name="alamat_ktp"
                                    value={formData.alamat_ktp}
                                    onChange={handleChange}
                                    rows="2"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alamat Domisili</label>
                                <textarea
                                    name="alamat_domisili"
                                    value={formData.alamat_domisili}
                                    onChange={handleChange}
                                    rows="2"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                                <input
                                    type="text"
                                    name="no_telepon"
                                    value={formData.no_telepon}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kontak Darurat</label>
                                <input
                                    type="text"
                                    name="kontak_darurat"
                                    value={formData.kontak_darurat}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                        </div>

                        {/* Pendidikan */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                                <input
                                    type="text"
                                    name="pendidikan_terakhir"
                                    value={formData.pendidikan_terakhir}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Institusi Pendidikan</label>
                                <input
                                    type="text"
                                    name="institusi_pendidikan"
                                    value={formData.institusi_pendidikan}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun Lulus</label>
                                <input
                                    type="number"
                                    name="tahun_lulus"
                                    value={formData.tahun_lulus}
                                    onChange={handleChange}
                                    min="1900"
                                    max="2099"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jurusan</label>
                                <input
                                    type="text"
                                    name="jurusan"
                                    value={formData.jurusan}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                        </div>

                        {/* Pekerjaan */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIP</label>
                                <input
                                    type="text"
                                    name="nip"
                                    value={formData.nip}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                                <input
                                    type="text"
                                    name="jabatan"
                                    value={formData.jabatan}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Departemen</label>
                                <input
                                    type="text"
                                    name="departemen"
                                    value={formData.departemen}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Masuk</label>
                                <input
                                    type="date"
                                    name="tanggal_masuk"
                                    value={formData.tanggal_masuk}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Karyawan</label>
                                <select
                                    name="status_karyawan"
                                    value={formData.status_karyawan}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                >
                                    <option>Tetap</option>
                                    <option>Kontrak</option>
                                    <option>Magang</option>
                                    <option>Resign</option>
                                </select>
                            </div>
                        </div>

                        {/* Keuangan */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gaji Pokok</label>
                                <input
                                    type="number"
                                    name="gaji_pokok"
                                    value={formData.gaji_pokok}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tunjangan</label>
                                <input
                                    type="number"
                                    name="tunjangan"
                                    value={formData.tunjangan}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No. Rekening</label>
                                <input
                                    type="text"
                                    name="no_rekening"
                                    value={formData.no_rekening}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bank</label>
                                <input
                                    type="text"
                                    name="bank"
                                    value={formData.bank}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">BPJS Kesehatan</label>
                                <input
                                    type="text"
                                    name="bpjs_kesehatan"
                                    value={formData.bpjs_kesehatan}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">BPJS Ketenagakerjaan</label>
                                <input
                                    type="text"
                                    name="bpjs_ketenagakerjaan"
                                    value={formData.bpjs_ketenagakerjaan}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                        </div>

                        {/* Kesehatan & Catatan */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Riwayat Sakit</label>
                                <textarea
                                    name="riwayat_sakit"
                                    value={formData.riwayat_sakit}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Catatan Lain</label>
                                <textarea
                                    name="catatan_lain"
                                    value={formData.catatan_lain}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                                />
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <Buttonv1 type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                                {editingId ? 'Update' : 'Simpan'}
                            </Buttonv1>
                            <Buttonv1
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                    resetForm();
                                    setActiveTab('list');
                                }}
                                className="w-full sm:w-auto"
                            >
                                Batal
                            </Buttonv1>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Detail Karyawan */}
            {showDetailModal && selectedKaryawan && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center z-10">
                            <h3 className="text-lg font-semibold text-gray-900">Detail Karyawan</h3>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Konten */}
                        <div className="p-4 space-y-6">
                            {/* Foto */}
                            {selectedKaryawan.foto && (
                                <div className="flex justify-center">
                                    <img 
                                        src={selectedKaryawan.foto} 
                                        alt="foto" 
                                        className="h-32 w-32 object-cover rounded-full border-4 border-cyan-100 shadow-md"
                                    />
                                </div>
                            )}

                            {/* Data Pribadi */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-cyan-50 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-cyan-700">Data Pribadi</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 p-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.nik || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.nama || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tempat Lahir</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.tempat_lahir || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lahir</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.tanggal_lahir || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.jenis_kelamin || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Golongan Darah</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.golongan_darah || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Agama</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.agama || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status Perkawinan</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.status_perkawinan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Anak</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.jumlah_anak ?? '-'}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Alamat & Kontak */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-cyan-50 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-cyan-700">Alamat & Kontak</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 p-4">
                                    <div className="md:col-span-2">
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat KTP</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.alamat_ktp || '-'}</dd>
                                    </div>
                                    <div className="md:col-span-2">
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat Domisili</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.alamat_domisili || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telepon</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.no_telepon || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</dt>
                                        <dd className="text-sm text-gray-900 mt-1 break-all">{selectedKaryawan.email || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak Darurat</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.kontak_darurat || '-'}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Pendidikan */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-cyan-50 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-cyan-700">Pendidikan</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 p-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pendidikan Terakhir</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.pendidikan_terakhir || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Institusi</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.institusi_pendidikan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Lulus</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.tahun_lulus || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jurusan</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.jurusan || '-'}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Pekerjaan */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-cyan-50 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-cyan-700">Pekerjaan</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 p-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.nip || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.jabatan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departemen</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.departemen || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Masuk</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.tanggal_masuk || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status Karyawan</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                selectedKaryawan.status_karyawan === 'Tetap' ? 'bg-green-100 text-green-800' :
                                                selectedKaryawan.status_karyawan === 'Kontrak' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {selectedKaryawan.status_karyawan}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Keuangan */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-cyan-50 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-cyan-700">Keuangan</h4>
                                </div>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 p-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Pokok</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {selectedKaryawan.gaji_pokok ? `Rp ${parseFloat(selectedKaryawan.gaji_pokok).toLocaleString()}` : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tunjangan</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {selectedKaryawan.tunjangan ? `Rp ${parseFloat(selectedKaryawan.tunjangan).toLocaleString()}` : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">No. Rekening</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.no_rekening || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.bank || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">BPJS Kesehatan</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.bpjs_kesehatan || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">BPJS Ketenagakerjaan</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedKaryawan.bpjs_ketenagakerjaan || '-'}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Kesehatan & Catatan */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-cyan-50 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-cyan-700">Kesehatan & Catatan</h4>
                                </div>
                                <dl className="grid grid-cols-1 gap-y-3 p-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Riwayat Sakit</dt>
                                        <dd className="text-sm text-gray-900 mt-1 whitespace-pre-line">{selectedKaryawan.riwayat_sakit || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan Lain</dt>
                                        <dd className="text-sm text-gray-900 mt-1 whitespace-pre-line">{selectedKaryawan.catatan_lain || '-'}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Timestamps */}
                            <div className="text-xs text-gray-400 border-t pt-3">
                                <div>Dibuat: {selectedKaryawan.created_at ? new Date(selectedKaryawan.created_at).toLocaleString() : '-'}</div>
                                <div>Diperbarui: {selectedKaryawan.updated_at ? new Date(selectedKaryawan.updated_at).toLocaleString() : '-'}</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
                            <Buttonv1 type="button" variant="outline" size="md" onClick={closeDetailModal}>
                                Tutup
                            </Buttonv1>
                        </div>
                    </div>
                </div>
            )}




        </div>
    );
};

export default Karyawan;