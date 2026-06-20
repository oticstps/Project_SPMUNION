import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Calendar,
  AlertTriangle,
  Filter,
  X,
} from 'lucide-react';

const API_URL = '/api/karyawan';

// Warna untuk chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [karyawan, setKaryawan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    plant: '',
    bagian: '',
    jabatan: '',
  });
  const [availableFilters, setAvailableFilters] = useState({
    status: [],
    plant: [],
    bagian: [],
    jabatan: [],
  });
  const [selectedLimit, setSelectedLimit] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setKaryawan(response.data);
      // Ekstrak nilai unik untuk filter
      const statusSet = new Set();
      const plantSet = new Set();
      const bagianSet = new Set();
      const jabatanSet = new Set();
      response.data.forEach((k) => {
        if (k.status_karyawan) statusSet.add(k.status_karyawan);
        if (k.plant) plantSet.add(k.plant);
        if (k.bagian) bagianSet.add(k.bagian);
        if (k.jabatan) jabatanSet.add(k.jabatan);
      });
      setAvailableFilters({
        status: Array.from(statusSet).sort(),
        plant: Array.from(plantSet).sort(),
        bagian: Array.from(bagianSet).sort(),
        jabatan: Array.from(jabatanSet).sort(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Data setelah difilter
  const filteredKaryawan = useMemo(() => {
    return karyawan.filter((k) => {
      if (filters.status && k.status_karyawan !== filters.status) return false;
      if (filters.plant && k.plant !== filters.plant) return false;
      if (filters.bagian && k.bagian !== filters.bagian) return false;
      if (filters.jabatan && k.jabatan !== filters.jabatan) return false;
      return true;
    });
  }, [karyawan, filters]);

  // --- REKAP STATUS ---
  const rekapStatus = useMemo(() => {
    const counts = {};
    filteredKaryawan.forEach((k) => {
      const status = k.status_karyawan || 'Tidak Diketahui';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredKaryawan]);

  // --- STATUS TERBANYAK (dihitung dengan useMemo agar tidak sorting ulang tiap render)
  const topStatus = useMemo(() => {
    if (rekapStatus.length === 0) return '-';
    // Buat salinan array sebelum sorting
    return [...rekapStatus].sort((a, b) => b.value - a.value)[0]?.name || '-';
  }, [rekapStatus]);

  // --- REKAP MASA KERJA ---
  const hitungMasaKerja = (tanggalMasuk) => {
    if (!tanggalMasuk) return null;
    const masuk = new Date(tanggalMasuk);
    const sekarang = new Date();
    const diffTime = Math.abs(sekarang - masuk);
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  };

  const rekapMasaKerja = useMemo(() => {
    const groups = {
      '< 1 tahun': 0,
      '1 - 3 tahun': 0,
      '3 - 5 tahun': 0,
      '5 - 10 tahun': 0,
      '> 10 tahun': 0,
    };
    filteredKaryawan.forEach((k) => {
      const masa = hitungMasaKerja(k.tanggal_masuk);
      if (masa === null) return;
      if (masa < 1) groups['< 1 tahun']++;
      else if (masa >= 1 && masa < 3) groups['1 - 3 tahun']++;
      else if (masa >= 3 && masa < 5) groups['3 - 5 tahun']++;
      else if (masa >= 5 && masa < 10) groups['5 - 10 tahun']++;
      else groups['> 10 tahun']++;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [filteredKaryawan]);

  // --- KARYAWAN AKAN SELESAI ---
  const hitungTanggalSelesai = (karyawan) => {
    const { status_karyawan, tanggal_masuk, tanggal_lahir } = karyawan;
    if (!tanggal_masuk) return null;

    const masuk = new Date(tanggal_masuk);
    let selesai = null;

    switch (status_karyawan) {
      case 'Tetap':
        if (tanggal_lahir) {
          const lahir = new Date(tanggal_lahir);
          selesai = new Date(lahir);
          selesai.setFullYear(lahir.getFullYear() + 55);
        }
        break;
      case 'Kontrak':
        selesai = new Date(masuk);
        selesai.setFullYear(masuk.getFullYear() + 5);
        break;
      case 'Magang':
        selesai = new Date(masuk);
        selesai.setFullYear(masuk.getFullYear() + 1);
        break;
      default:
        return null;
    }
    return selesai;
  };

  const akanSelesai = useMemo(() => {
    const sekarang = new Date();
    const aktif = filteredKaryawan.filter(
      (k) => k.status_karyawan && k.status_karyawan !== 'Resign'
    );
    const denganSelesai = aktif
      .map((k) => {
        const tglSelesai = hitungTanggalSelesai(k);
        if (!tglSelesai) return null;
        return { ...k, tanggal_selesai: tglSelesai };
      })
      .filter((item) => item !== null && item.tanggal_selesai >= sekarang)
      .sort((a, b) => a.tanggal_selesai - b.tanggal_selesai);
    return denganSelesai;
  }, [filteredKaryawan]);

  // Format sisa waktu
  const formatSisaWaktu = (tanggalSelesai) => {
    const sekarang = new Date();
    const selesai = new Date(tanggalSelesai);
    const diffMs = selesai - sekarang;
    if (diffMs <= 0) return 'Sudah lewat';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const weeks = Math.floor(((diffDays % 365) % 30) / 7);
    const days = ((diffDays % 365) % 30) % 7;

    const parts = [];
    if (years > 0) parts.push(`${years} tahun`);
    if (months > 0) parts.push(`${months} bulan`);
    if (weeks > 0) parts.push(`${weeks} minggu`);
    if (days > 0) parts.push(`${days} hari`);

    return parts.join(' ') || '0 hari';
  };

  // Reset filter
  const resetFilters = () => {
    setFilters({
      status: '',
      plant: '',
      bagian: '',
      jabatan: '',
    });
  };

  // Komponen untuk filter chips
  const FilterChip = ({ label, value, onRemove }) => {
    if (!value) return null;
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-100 text-cyan-800">
        {label}: {value}
        <button onClick={onRemove} className="ml-2 text-cyan-600 hover:text-cyan-800">
          <X size={14} />
        </button>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p className="font-semibold">Error memuat data:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Karyawan</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
          <Users size={18} />
          <span>Total Karyawan: {filteredKaryawan.length}</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter size={20} />
          <h2 className="font-semibold">Filter Data</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Semua Status</option>
            {availableFilters.status.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={filters.plant}
            onChange={(e) => setFilters({ ...filters, plant: e.target.value })}
          >
            <option value="">Semua Plant</option>
            {availableFilters.plant.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={filters.bagian}
            onChange={(e) => setFilters({ ...filters, bagian: e.target.value })}
          >
            <option value="">Semua Bagian</option>
            {availableFilters.bagian.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={filters.jabatan}
            onChange={(e) => setFilters({ ...filters, jabatan: e.target.value })}
          >
            <option value="">Semua Jabatan</option>
            {availableFilters.jabatan.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="Status"
            value={filters.status}
            onRemove={() => setFilters({ ...filters, status: '' })}
          />
          <FilterChip
            label="Plant"
            value={filters.plant}
            onRemove={() => setFilters({ ...filters, plant: '' })}
          />
          <FilterChip
            label="Bagian"
            value={filters.bagian}
            onRemove={() => setFilters({ ...filters, bagian: '' })}
          />
          <FilterChip
            label="Jabatan"
            value={filters.jabatan}
            onRemove={() => setFilters({ ...filters, jabatan: '' })}
          />
          {(filters.status || filters.plant || filters.bagian || filters.jabatan) && (
            <button
              onClick={resetFilters}
              className="text-sm text-cyan-600 hover:text-cyan-800 underline"
            >
              Reset semua filter
            </button>
          )}
        </div>
      </div>

      {/* Rekap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Karyawan</p>
            <p className="text-2xl font-bold">{filteredKaryawan.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Calendar className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Rata-rata Masa Kerja</p>
            <p className="text-2xl font-bold">
              {(
                filteredKaryawan.reduce((acc, k) => {
                  const masa = hitungMasaKerja(k.tanggal_masuk);
                  return acc + (masa || 0);
                }, 0) / (filteredKaryawan.length || 1)
              ).toFixed(1)}{' '}
              tahun
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Akan Selesai (1 thn)</p>
            <p className="text-2xl font-bold">
              {akanSelesai.filter(
                (k) => (k.tanggal_selesai - new Date()) / (1000 * 60 * 60 * 24) <= 365
              ).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Status Terbanyak</p>
            <p className="text-2xl font-bold">{topStatus}</p> {/* menggunakan topStatus */}
          </div>
        </div>
      </div>

      {/* Grafik Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Distribusi Status Karyawan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rekapStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {rekapStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart Masa Kerja */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Rentang Masa Kerja</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rekapMasaKerja}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Karyawan Akan Selesai */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold">Karyawan Akan Selesai Masa Kerja</h2>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="text-sm text-gray-600">Tampilkan:</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              value={selectedLimit}
              onChange={(e) => setSelectedLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {akanSelesai.length === 0 ? (
          <p className="text-gray-600">Tidak ada karyawan yang akan selesai masa kerja.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Masuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Selesai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sisa Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {akanSelesai.slice(0, selectedLimit).map((k) => {
                  const sisaWaktuStr = formatSisaWaktu(k.tanggal_selesai);
                  const diffDays = Math.ceil((k.tanggal_selesai - new Date()) / (1000 * 60 * 60 * 24));
                  let bgColorClass = '';
                  if (diffDays <= 30) bgColorClass = 'bg-red-100 text-red-800';
                  else if (diffDays <= 90) bgColorClass = 'bg-yellow-100 text-yellow-800';
                  else bgColorClass = 'bg-green-100 text-green-800';
                  return (
                    <tr key={k.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{k.nik}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{k.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {k.status_karyawan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(k.tanggal_masuk).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {k.tanggal_selesai.toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColorClass}`}>
                          {sisaWaktuStr}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;