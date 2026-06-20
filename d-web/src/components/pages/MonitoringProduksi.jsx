import React, { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL =
  import.meta.env.VITE_GAS_URL ||
  'https://script.google.com/macros/s/AKfycbyPwNk5TiPhC0RsCMcnoHqaOb4kKWgWdi-a5kwsH_8t18QqdHS0sdm-1mRABvWxOi8rgw/exec';

const numberFormat = new Intl.NumberFormat('id-ID');
const decimalFormat = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const defaultDummyForm = {
  line: 'Line A',
  shift: '1',
  target_pcs: 1000,
  loading_time_min: 480,
  trouble_time_max_min: 30,
  ideal_cycle_time_sec: 24,
  interval_sec: 5,
};

function MonitoringProduksiRealtime() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLine, setSelectedLine] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(5);
  const [actionLoading, setActionLoading] = useState('');
  const [dummyStatus, setDummyStatus] = useState({ running: false, interval_sec: 5 });
  const [dummyForm, setDummyForm] = useState(defaultDummyForm);
  const [formHydrated, setFormHydrated] = useState(false);
  const [lastDummyMessage, setLastDummyMessage] = useState('');

  const apiRequest = useCallback(async (type, payload = {}, method = 'GET') => {
    const upperMethod = String(method || 'GET').toUpperCase();

    if (upperMethod === 'GET') {
      const url = new URL(API_URL);
      url.searchParams.set('type', type);
      url.searchParams.set('_', String(Date.now()));

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== '' && value !== null && typeof value !== 'undefined') {
          url.searchParams.set(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Request gagal.');
      return result;
    }

    const response = await fetch(API_URL, {
      method: upperMethod,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ type, ...payload, _: Date.now() }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Request gagal.');
    return result;
  }, []);

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        setError('');

        const result = await apiRequest('dashboard');
        setDashboard(result);
        setDummyStatus(result.dummy || { running: false, interval_sec: 5 });

        if (!formHydrated && result.dummy) {
          setDummyForm((prev) => ({
            ...prev,
            line: result.dummy.line || prev.line,
            shift: result.dummy.shift || prev.shift,
            target_pcs: result.dummy.target_pcs || prev.target_pcs,
            loading_time_min: result.dummy.loading_time_min || prev.loading_time_min,
            trouble_time_max_min:
              result.dummy.trouble_time_max_min || prev.trouble_time_max_min,
            ideal_cycle_time_sec:
              result.dummy.ideal_cycle_time_sec || prev.ideal_cycle_time_sec,
            interval_sec: result.dummy.interval_sec || prev.interval_sec,
          }));
          setFormHydrated(true);
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat memuat dashboard.');
      } finally {
        setLoading(false);
      }
    },
    [apiRequest, formHydrated],
  );

  useEffect(() => {
    loadDashboard({ silent: false });
  }, [loadDashboard]);

  useEffect(() => {
    if (!autoRefresh) return undefined;

    const refreshMs = Math.max(3, Number(refreshIntervalSec) || 5) * 1000;
    const timer = setInterval(() => {
      loadDashboard({ silent: true });
    }, refreshMs);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshIntervalSec, loadDashboard]);

  useEffect(() => {
    if (!dummyStatus?.running) return undefined;

    const tickMs = Math.max(3, Number(dummyStatus.interval_sec || dummyForm.interval_sec || 5)) * 1000;

    const timer = setInterval(async () => {
      try {
        const result = await apiRequest('dummy_tick', {}, 'POST');
        if (result.dashboard) setDashboard(result.dashboard);
        if (result.dummy) setDummyStatus(result.dummy);
        setLastDummyMessage(
          `Dummy tick masuk ke sheet pada ${result.dummy?.last_generated_at || '-'}${
            result.row?.row_number ? ` • row ${result.row.row_number}` : ''
          }`,
        );
      } catch (err) {
        setError(err.message || 'Gagal menjalankan dummy tick.');
      }
    }, tickMs);

    return () => clearInterval(timer);
  }, [apiRequest, dummyStatus?.running, dummyStatus?.interval_sec, dummyForm.interval_sec]);

  const records = dashboard?.records || [];

  const lineOptions = useMemo(() => {
    return ['ALL', ...new Set(records.map((item) => item.line || 'Unknown'))];
  }, [records]);

  const shiftOptions = useMemo(() => {
    return ['ALL', ...new Set(records.map((item) => item.shift || '-'))];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchLine = selectedLine === 'ALL' || item.line === selectedLine;
      const matchShift = selectedShift === 'ALL' || item.shift === selectedShift;
      const matchStart = !startDate || (item.raw_date && item.raw_date >= startDate);
      const matchEnd = !endDate || (item.raw_date && item.raw_date <= endDate);
      return matchLine && matchShift && matchStart && matchEnd;
    });
  }, [records, selectedLine, selectedShift, startDate, endDate]);

  const summary = useMemo(() => aggregateRecords(filteredRecords), [filteredRecords]);

  const productionTrend = useMemo(() => {
    const grouped = filteredRecords.reduce((acc, item) => {
      const key = item.date_key || '-';
      if (!acc[key]) {
        acc[key] = {
          key,
          label: item.date_label || key,
          total_production_pcs: 0,
          total_good_pcs: 0,
          total_reject_pcs: 0,
          total_loading_time_min: 0,
          total_trouble_time_min: 0,
          total_operating_time_min: 0,
          idealCycleContribution: 0,
        };
      }

      acc[key].total_production_pcs += toNumber(item.total_pcs);
      acc[key].total_good_pcs += toNumber(item.good_pcs);
      acc[key].total_reject_pcs += toNumber(item.reject_pcs);
      acc[key].total_loading_time_min += toNumber(item.loading_time_min);
      acc[key].total_trouble_time_min += toNumber(item.trouble_time_min);
      acc[key].total_operating_time_min += toNumber(item.operating_time_min);
      acc[key].idealCycleContribution +=
        toNumber(item.ideal_cycle_time_sec) * toNumber(item.total_pcs);

      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((item) => {
        const availability = item.total_loading_time_min > 0
          ? item.total_operating_time_min / item.total_loading_time_min
          : 0;
        const performance = item.total_operating_time_min > 0
          ? clamp(item.idealCycleContribution / (item.total_operating_time_min * 60), 0, 1)
          : 0;
        const quality = item.total_production_pcs > 0
          ? item.total_good_pcs / item.total_production_pcs
          : 0;

        return {
          ...item,
          availability,
          performance,
          quality,
          oee: availability * performance * quality,
        };
      });
  }, [filteredRecords]);

  const breakdownByLine = useMemo(() => {
    const grouped = filteredRecords.reduce((acc, item) => {
      const key = item.line || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([line, items]) => ({
        line,
        summary: aggregateRecords(items),
      }))
      .sort((a, b) => a.line.localeCompare(b.line));
  }, [filteredRecords]);

  const maxTrendProduction = useMemo(() => {
    if (productionTrend.length === 0) return 1;
    return Math.max(...productionTrend.map((item) => item.total_production_pcs), 1);
  }, [productionTrend]);

  const handleDummyInputChange = (key, value) => {
    setDummyForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStartDummy = async () => {
    try {
      setActionLoading('start');
      setError('');

      const result = await apiRequest('dummy_start', normalizeDummyPayload(dummyForm), 'POST');
      setDummyStatus(result.dummy || { running: true, interval_sec: dummyForm.interval_sec });
      if (result.dashboard) setDashboard(result.dashboard);

      const tickResult = await apiRequest('dummy_tick', {}, 'POST');
      if (tickResult.dashboard) setDashboard(tickResult.dashboard);
      if (tickResult.dummy) setDummyStatus(tickResult.dummy);
      setLastDummyMessage(
        `Dummy mode aktif dan langsung menulis ke sheet pada ${tickResult.dummy?.last_generated_at || '-'}`,
      );
    } catch (err) {
      setError(err.message || 'Gagal mengaktifkan dummy mode.');
    } finally {
      setActionLoading('');
    }
  };

  const handleStopDummy = async () => {
    try {
      setActionLoading('stop');
      setError('');
      const result = await apiRequest('dummy_stop', {}, 'POST');
      setDummyStatus(result.dummy || { running: false, interval_sec: dummyForm.interval_sec });
      if (result.dashboard) setDashboard(result.dashboard);
      setLastDummyMessage('Dummy mode dihentikan.');
    } catch (err) {
      setError(err.message || 'Gagal menghentikan dummy mode.');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Realtime Monitoring Produksi & OEE
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Dashboard Produksi Sinkron ke Sheet
              </h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
                Semua data yang tampil di dashboard diambil dari sheet. Saat dummy mode aktif,
                data dummy tidak hanya tampil di layar, tetapi juga ditulis ke sheet sehingga
                dashboard dan sheet berubah bersamaan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => loadDashboard({ silent: false })}
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Refresh Sekarang
              </button>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                <div className="text-xs uppercase tracking-wide text-slate-400">Last Update</div>
                <div className="mt-1 font-medium text-white">{dashboard?.generated_at || '-'}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Mode Realtime</h2>
                <p className="text-sm text-slate-400">
                  Auto refresh membaca ulang data langsung dari sheet.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                  />
                  Auto refresh
                </label>

                <NumberInput
                  label="Interval Refresh (detik)"
                  value={refreshIntervalSec}
                  min={3}
                  onChange={(value) => setRefreshIntervalSec(value)}
                  compact
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <FilterSelect
                label="Line"
                value={selectedLine}
                onChange={setSelectedLine}
                options={lineOptions}
              />
              <FilterSelect
                label="Shift"
                value={selectedShift}
                onChange={setSelectedShift}
                options={shiftOptions}
              />
              <FilterDate label="Tanggal Awal" value={startDate} onChange={setStartDate} />
              <FilterDate label="Tanggal Akhir" value={endDate} onChange={setEndDate} />
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedLine('ALL');
                    setSelectedShift('ALL');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Dummy Mode</h2>
                <p className="text-sm text-slate-400">
                  Generator dummy menulis langsung ke sheet, bukan hanya ke state lokal.
                </p>
              </div>
              <StatusBadge active={Boolean(dummyStatus?.running)} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput
                label="Line"
                value={dummyForm.line}
                onChange={(value) => handleDummyInputChange('line', value)}
              />
              <TextInput
                label="Shift"
                value={dummyForm.shift}
                onChange={(value) => handleDummyInputChange('shift', value)}
              />
              <NumberInput
                label="Target PCS"
                value={dummyForm.target_pcs}
                min={1}
                onChange={(value) => handleDummyInputChange('target_pcs', value)}
              />
              <NumberInput
                label="Loading Time (min)"
                value={dummyForm.loading_time_min}
                min={1}
                onChange={(value) => handleDummyInputChange('loading_time_min', value)}
              />
              <NumberInput
                label="Max Trouble (min)"
                value={dummyForm.trouble_time_max_min}
                min={0}
                onChange={(value) => handleDummyInputChange('trouble_time_max_min', value)}
              />
              <NumberInput
                label="Ideal Cycle Time (sec)"
                value={dummyForm.ideal_cycle_time_sec}
                min={1}
                onChange={(value) => handleDummyInputChange('ideal_cycle_time_sec', value)}
              />
              <NumberInput
                label="Interval Dummy (detik)"
                value={dummyForm.interval_sec}
                min={3}
                onChange={(value) => handleDummyInputChange('interval_sec', value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleStartDummy}
                disabled={actionLoading === 'start'}
                className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === 'start' ? 'Menjalankan...' : 'Start Dummy'}
              </button>
              <button
                onClick={handleStopDummy}
                disabled={actionLoading === 'stop' || !dummyStatus?.running}
                className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === 'stop' ? 'Menghentikan...' : 'Stop Dummy'}
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span>Status</span>
                <span className="font-semibold text-white">
                  {dummyStatus?.running ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Interval Dummy</span>
                <span className="font-semibold text-white">{dummyStatus?.interval_sec || dummyForm.interval_sec} detik</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Last Generated</span>
                <span className="font-semibold text-white">{dummyStatus?.last_generated_at || '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Last Written Row</span>
                <span className="font-semibold text-white">{dummyStatus?.last_written_row || '-'}</span>
              </div>
              {lastDummyMessage && (
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-cyan-200">
                  {lastDummyMessage}
                </div>
              )}
            </div>
          </div>
        </section>

        {loading && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-300">
            Memuat dashboard produksi...
          </div>
        )}

        {!loading && error && (
          <div className="mb-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                title="Total Produksi"
                value={`${numberFormat.format(summary.total_production_pcs)} pcs`}
                subtitle={`Good ${numberFormat.format(summary.total_good_pcs)} pcs • Reject ${numberFormat.format(summary.total_reject_pcs)} pcs`}
              />
              <StatCard
                title="Loading Time"
                value={`${decimalFormat.format(summary.total_loading_time_min)} min`}
                subtitle={`Operating ${decimalFormat.format(summary.total_operating_time_min)} min`}
              />
              <StatCard
                title="Trouble Time"
                value={`${decimalFormat.format(summary.total_trouble_time_min)} min`}
                subtitle={`Reject rate ${toPercent(summary.reject_rate)}`}
              />
              <StatCard
                title="Actual Cycle Time"
                value={`${decimalFormat.format(summary.average_actual_cycle_time_sec)} sec/pcs`}
                subtitle={`Ideal ${decimalFormat.format(summary.average_ideal_cycle_time_sec)} sec/pcs`}
              />
              <StatCard
                title="Target Achievement"
                value={toPercent(summary.target_achievement)}
                subtitle={`Target ${numberFormat.format(summary.total_target_pcs)} pcs`}
              />
            </section>

            <section className="mb-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <MetricPanel
                title="Availability"
                value={summary.availability}
                caption="Operating Time / Loading Time"
                target={0.9}
              />
              <MetricPanel
                title="Performance"
                value={summary.performance}
                caption="(Ideal Cycle Time × Total Count) / Operating Time"
                target={0.95}
              />
              <MetricPanel
                title="Quality"
                value={summary.quality}
                caption="Good PCS / Total PCS"
                target={0.99}
              />
              <MetricPanel
                title="OEE"
                value={summary.oee}
                caption="Availability × Performance × Quality"
                target={0.85}
                highlight
              />
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white">Trend Produksi Harian</h2>
                  <p className="text-sm text-slate-400">
                    Output harian dan OEE berdasarkan data sheet yang sedang terbaca.
                  </p>
                </div>

                <div className="space-y-4">
                  {productionTrend.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-slate-400">
                      Tidak ada data pada filter yang dipilih.
                    </div>
                  )}

                  {productionTrend.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-slate-400">
                            Good {numberFormat.format(item.total_good_pcs)} pcs • Reject{' '}
                            {numberFormat.format(item.total_reject_pcs)} pcs
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-emerald-300">
                            {numberFormat.format(item.total_production_pcs)} pcs
                          </div>
                          <div className="text-xs text-slate-400">OEE {toPercent(item.oee)}</div>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{ width: `${(item.total_production_pcs / maxTrendProduction) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                <h2 className="text-lg font-semibold text-white">Breakdown per Line</h2>
                <p className="mb-4 text-sm text-slate-400">
                  Ringkasan performa setiap line berdasarkan baris yang ada di sheet.
                </p>

                <div className="space-y-4">
                  {breakdownByLine.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-slate-400">
                      Belum ada data line.
                    </div>
                  )}

                  {breakdownByLine.map((item) => (
                    <div key={item.line} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{item.line}</div>
                          <div className="text-xs text-slate-400">
                            Produksi {numberFormat.format(item.summary.total_production_pcs)} pcs
                          </div>
                        </div>
                        <div className="text-sm font-bold text-emerald-300">
                          {toPercent(item.summary.oee)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <MiniMetric label="Availability" value={item.summary.availability} />
                        <MiniMetric label="Performance" value={item.summary.performance} />
                        <MiniMetric label="Quality" value={item.summary.quality} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Detail Data Produksi</h2>
                  <p className="text-sm text-slate-400">
                    Tabel ini selalu menampilkan data hasil baca dari sheet.
                  </p>
                </div>
                <div className="text-sm text-slate-400">
                  Total baris: <span className="font-semibold text-white">{filteredRecords.length}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="px-3 py-3 font-medium">Tanggal</th>
                      <th className="px-3 py-3 font-medium">Line</th>
                      <th className="px-3 py-3 font-medium">Shift</th>
                      <th className="px-3 py-3 font-medium">Target</th>
                      <th className="px-3 py-3 font-medium">Total PCS</th>
                      <th className="px-3 py-3 font-medium">Good</th>
                      <th className="px-3 py-3 font-medium">Reject</th>
                      <th className="px-3 py-3 font-medium">Loading</th>
                      <th className="px-3 py-3 font-medium">Trouble</th>
                      <th className="px-3 py-3 font-medium">Cycle</th>
                      <th className="px-3 py-3 font-medium">A</th>
                      <th className="px-3 py-3 font-medium">P</th>
                      <th className="px-3 py-3 font-medium">Q</th>
                      <th className="px-3 py-3 font-medium">OEE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={14} className="px-3 py-8 text-center text-slate-400">
                          Tidak ada data pada filter yang dipilih.
                        </td>
                      </tr>
                    )}

                    {filteredRecords.map((item) => (
                      <tr key={`${item.row_number}-${item.line}-${item.date_key}`} className="hover:bg-slate-800/30">
                        <td className="whitespace-nowrap px-3 py-3">{item.date_label}</td>
                        <td className="whitespace-nowrap px-3 py-3">{item.line}</td>
                        <td className="whitespace-nowrap px-3 py-3">{item.shift}</td>
                        <td className="whitespace-nowrap px-3 py-3">{numberFormat.format(item.target_pcs)}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-white">
                          {numberFormat.format(item.total_pcs)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-emerald-300">
                          {numberFormat.format(item.good_pcs)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-rose-300">
                          {numberFormat.format(item.reject_pcs)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {decimalFormat.format(item.loading_time_min)} min
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {decimalFormat.format(item.trouble_time_min)} min
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {decimalFormat.format(item.actual_cycle_time_sec)} sec
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">{toPercent(item.availability)}</td>
                        <td className="whitespace-nowrap px-3 py-3">{toPercent(item.performance)}</td>
                        <td className="whitespace-nowrap px-3 py-3">{toPercent(item.quality)}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-emerald-300">
                          {toPercent(item.oee)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300'
          : 'border border-slate-700 bg-slate-800 text-slate-300'
      }`}
    >
      {active ? 'RUNNING' : 'STOPPED'}
    </span>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
      <div className="text-sm font-medium text-slate-400">{title}</div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{subtitle}</div>
    </div>
  );
}

function MetricPanel({ title, value, caption, target = 0, highlight = false }) {
  const passed = value >= target;

  return (
    <div
      className={`rounded-3xl border p-5 shadow-xl ${
        highlight
          ? 'border-emerald-500/30 bg-emerald-500/10'
          : 'border-slate-800 bg-slate-900/70'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-400">{title}</div>
          <div className="mt-3 text-3xl font-bold text-white">{toPercent(value)}</div>
          <div className="mt-2 text-sm text-slate-400">{caption}</div>
        </div>
        <div
          className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
            passed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
          }`}
        >
          Target {toPercent(target)}
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${passed ? 'bg-emerald-400' : 'bg-amber-400'}`}
          style={{ width: `${Math.min(value * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-medium text-slate-200">{toPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.min(value * 100, 100)}%` }} />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterDate({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
      />
    </label>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
      />
    </label>
  );
}

function NumberInput({ label, value, onChange, min = 0, compact = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className={`w-full rounded-2xl border border-slate-700 bg-slate-950 text-sm text-white outline-none transition focus:border-cyan-400 ${
          compact ? 'px-3 py-2' : 'px-4 py-3'
        }`}
      />
    </label>
  );
}

function normalizeDummyPayload(form) {
  return {
    line: String(form.line || 'Line A').trim(),
    shift: String(form.shift || '1').trim(),
    target_pcs: Math.max(1, toNumber(form.target_pcs) || 1),
    loading_time_min: Math.max(1, toNumber(form.loading_time_min) || 1),
    trouble_time_max_min: Math.max(0, toNumber(form.trouble_time_max_min)),
    ideal_cycle_time_sec: Math.max(1, toNumber(form.ideal_cycle_time_sec) || 1),
    interval_sec: Math.max(3, Math.round(toNumber(form.interval_sec) || 5)),
  };
}

function aggregateRecords(records) {
  if (!records || records.length === 0) {
    return {
      total_target_pcs: 0,
      total_good_pcs: 0,
      total_reject_pcs: 0,
      total_production_pcs: 0,
      total_loading_time_min: 0,
      total_trouble_time_min: 0,
      total_operating_time_min: 0,
      average_actual_cycle_time_sec: 0,
      average_ideal_cycle_time_sec: 0,
      availability: 0,
      performance: 0,
      quality: 0,
      oee: 0,
      reject_rate: 0,
      target_achievement: 0,
    };
  }

  const totalTarget = records.reduce((sum, item) => sum + toNumber(item.target_pcs), 0);
  const totalGood = records.reduce((sum, item) => sum + toNumber(item.good_pcs), 0);
  const totalReject = records.reduce((sum, item) => sum + toNumber(item.reject_pcs), 0);
  const totalProduction = records.reduce((sum, item) => sum + toNumber(item.total_pcs), 0);
  const totalLoading = records.reduce((sum, item) => sum + toNumber(item.loading_time_min), 0);
  const totalTrouble = records.reduce((sum, item) => sum + toNumber(item.trouble_time_min), 0);
  const totalOperating = records.reduce((sum, item) => sum + toNumber(item.operating_time_min), 0);
  const idealContribution = records.reduce(
    (sum, item) => sum + toNumber(item.ideal_cycle_time_sec) * toNumber(item.total_pcs),
    0,
  );

  const availability = totalLoading > 0 ? totalOperating / totalLoading : 0;
  const performance = totalOperating > 0 ? clamp(idealContribution / (totalOperating * 60), 0, 1) : 0;
  const quality = totalProduction > 0 ? totalGood / totalProduction : 0;
  const oee = availability * performance * quality;
  const averageActualCycleTimeSec = totalProduction > 0 ? (totalOperating * 60) / totalProduction : 0;
  const averageIdealCycleTimeSec = totalProduction > 0 ? idealContribution / totalProduction : 0;

  return {
    total_target_pcs: totalTarget,
    total_good_pcs: totalGood,
    total_reject_pcs: totalReject,
    total_production_pcs: totalProduction,
    total_loading_time_min: totalLoading,
    total_trouble_time_min: totalTrouble,
    total_operating_time_min: totalOperating,
    average_actual_cycle_time_sec: averageActualCycleTimeSec,
    average_ideal_cycle_time_sec: averageIdealCycleTimeSec,
    availability,
    performance,
    quality,
    oee,
    reject_rate: totalProduction > 0 ? totalReject / totalProduction : 0,
    target_achievement: totalTarget > 0 ? totalProduction / totalTarget : 0,
  };
}

function toPercent(value) {
  return `${decimalFormat.format(toNumber(value) * 100)}%`;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default MonitoringProduksiRealtime;
