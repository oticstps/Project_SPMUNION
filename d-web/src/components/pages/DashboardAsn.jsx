import logoSvg from '../../assets/logo-bimbel-asn.svg'
import badgeSvg from '../../assets/badge-lulus.svg'
import mascotSvg from '../../assets/illustration-mascot.svg'
import waveSvg from '../../assets/bg-merah-putih-wave.svg'
import { BookIcon, KisiKisiIcon, LiveClassIcon, TryoutIcon } from './FeatureIcons'

const mainMenus = [
  'Dashboard',
  'Materi Belajar',
  'Tryout & Analitik',
  'Live Class',
  'Bank Soal',
  'Roadmap SKD/SKB',
]

const metricCards = [
  {
    title: 'Skor Simulasi Terakhir',
    value: '486',
    delta: '+18 poin',
    note: 'Lebih tinggi dari rata-rata nasional batch ini',
  },
  {
    title: 'Progress Roadmap',
    value: '81%',
    delta: '+9%',
    note: '12 modul tersisa menuju fase final review',
  },
  {
    title: 'Akurasi TIU',
    value: '87%',
    delta: '+6%',
    note: 'Numerik dan logika menjadi area terkuat',
  },
  {
    title: 'Kehadiran Live Class',
    value: '94%',
    delta: 'Stabil',
    note: 'Konsistensi belajar berada di level ممتاز',
  },
]

const learningTracks = [
  {
    title: 'TWK • Nasionalisme, UUD 1945, Bhinneka Tunggal Ika',
    progress: 93,
    lessons: '24/26 topik selesai',
    status: 'Ready for final drill',
    Icon: BookIcon,
  },
  {
    title: 'TIU • Numerik, Analogi, Silogisme, Figural',
    progress: 84,
    lessons: '19/23 topik selesai',
    status: 'Butuh 2 sesi penguatan numerik',
    Icon: TryoutIcon,
  },
  {
    title: 'TKP • Pelayanan publik, jejaring kerja, profesionalisme',
    progress: 79,
    lessons: '18/22 topik selesai',
    status: 'Fokus pada pola jawaban prioritas',
    Icon: LiveClassIcon,
  },
  {
    title: 'SKB • Pendalaman jabatan dan kisi-kisi prioritas',
    progress: 61,
    lessons: '11/18 topik selesai',
    status: 'Perlu akselerasi 3 minggu ke depan',
    Icon: KisiKisiIcon,
  },
]

const schedule = [
  {
    time: '08.00',
    title: 'Review TWK: Integritas & Bela Negara',
    meta: 'Mentor: Ibu Rani • Durasi 60 menit',
  },
  {
    time: '13.00',
    title: 'Live Class TIU Numerik Intensif',
    meta: 'Mentor: Pak Faris • Zoom Room 03',
  },
  {
    time: '19.30',
    title: 'Bedah Tryout TKP + Strategi Passing Grade',
    meta: 'Mentor: Kak Alya • Sesi interaktif',
  },
]

const tryoutBars = [
  { label: 'TWK', value: 86 },
  { label: 'TIU', value: 89 },
  { label: 'TKP', value: 92 },
  { label: 'SKB', value: 74 },
]

const leaderboard = [
  { name: 'Alya Putri', score: 512, badge: 'Top nasional' },
  { name: 'Raka Pratama', score: 504, badge: 'Kelas intensif' },
  { name: 'Nadia Salsabila', score: 497, badge: 'Konsisten naik' },
  { name: 'Anda', score: 486, badge: 'On track' },
]

function NavDot() {
  return <span className="asn-nav-dot" aria-hidden="true" />
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9.5A6 6 0 1 1 18 9.5V14L20 17H4L6 14V9.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 19C10.4 20 11 20.5 12 20.5C13 20.5 13.6 20 14 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DashboardAsn() {
  return (
    <section className="asn-dashboard-shell">
      
      
      
      
      
      
      <style>{`
        .asn-dashboard-shell {
          min-height: 100vh;
          padding: 24px;
          background:
            radial-gradient(circle at top left, rgba(214, 40, 40, 0.08), transparent 28%),
            linear-gradient(180deg, #fffaf8 0%, #fff5f1 100%);
          color: #172033;
          font-family: Inter, Arial, sans-serif;
        }

        .asn-dashboard {
          width: min(1440px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 22px;
        }

        .asn-card,
        .asn-sidebar,
        .asn-topbar,
        .asn-hero {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(231, 221, 221, 0.95);
          box-shadow: 0 18px 40px rgba(28, 18, 18, 0.06);
        }

        .asn-sidebar {
          position: sticky;
          top: 24px;
          height: fit-content;
          border-radius: 28px;
          padding: 22px;
          display: grid;
          gap: 22px;
        }

        .asn-brand {
          padding-bottom: 18px;
          border-bottom: 1px solid #eee4e4;
        }

        .asn-brand img {
          width: 190px;
          height: auto;
        }

        .asn-brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff4f2;
          color: #b42318;
          font-size: 0.84rem;
          font-weight: 700;
          border: 1px solid #f6d3cf;
        }

        .asn-nav {
          display: grid;
          gap: 8px;
        }

        .asn-nav-title {
          margin: 0 0 2px;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8d7080;
        }

        .asn-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border-radius: 16px;
          color: #243143;
          font-weight: 600;
          background: transparent;
          transition: background .18s ease, transform .18s ease, color .18s ease;
        }

        .asn-nav-item:hover {
          background: #fff7f7;
          transform: translateX(2px);
        }

        .asn-nav-item.active {
          background: linear-gradient(135deg, #d62828 0%, #ea5455 100%);
          color: white;
          box-shadow: 0 14px 26px rgba(214, 40, 40, 0.22);
        }

        .asn-nav-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.8;
          flex: 0 0 auto;
        }

        .asn-user-card {
          display: grid;
          gap: 14px;
          padding: 18px;
          border-radius: 22px;
          background: linear-gradient(180deg, #fff8f6 0%, #ffffff 100%);
          border: 1px solid #f2dfdf;
        }

        .asn-user-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .asn-avatar {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #d62828 0%, #ef6b6b 100%);
          color: #fff;
          font-weight: 800;
          font-size: 1.05rem;
        }

        .asn-user-card h3,
        .asn-user-card p,
        .asn-content h1,
        .asn-content h2,
        .asn-content h3,
        .asn-content h4 {
          margin: 0;
        }

        .asn-user-role {
          margin-top: 4px;
          color: #677489;
          font-size: 0.92rem;
        }

        .asn-mini-progress {
          display: grid;
          gap: 8px;
        }

        .asn-mini-progress small,
        .asn-meta,
        .asn-muted {
          color: #6a7689;
        }

        .asn-progress-rail {
          width: 100%;
          height: 10px;
          border-radius: 999px;
          background: #f4e5e5;
          overflow: hidden;
        }

        .asn-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #d62828, #ff8a65);
        }

        .asn-main {
          display: grid;
          gap: 18px;
        }

        .asn-topbar {
          border-radius: 26px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .asn-search {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 18px;
          background: #fbf8f7;
          border: 1px solid #efe5e5;
          max-width: 520px;
          color: #6a7689;
        }

        .asn-search svg,
        .asn-top-action svg,
        .asn-info-icon svg {
          width: 18px;
          height: 18px;
        }

        .asn-search span {
          font-size: 0.96rem;
        }

        .asn-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .asn-top-action {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid #ece2e2;
          display: grid;
          place-items: center;
          color: #364152;
          background: #fff;
        }

        .asn-status-chip {
          padding: 11px 14px;
          border-radius: 14px;
          background: #0f766e;
          color: #fff;
          font-weight: 700;
          font-size: 0.92rem;
        }

        .asn-hero {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 28px;
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) 310px;
          gap: 20px;
          background-image:
            linear-gradient(135deg, rgba(214, 40, 40, 0.06), rgba(255, 182, 153, 0.10)),
            url(${waveSvg});
          background-size: cover;
          background-position: center;
        }

        .asn-hero::after {
          content: '';
          position: absolute;
          right: -70px;
          bottom: -70px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(214, 40, 40, 0.12), transparent 68%);
        }

        .asn-overline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          padding: 9px 13px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: #b42318;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid #f2d7d4;
        }

        .asn-content h1 {
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.04;
          letter-spacing: -0.03em;
          max-width: 760px;
        }

        .asn-hero-copy {
          margin-top: 14px;
          max-width: 760px;
          font-size: 1rem;
          line-height: 1.74;
          color: #546173;
        }

        .asn-hero-actions {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .asn-btn {
          border: 0;
          border-radius: 16px;
          padding: 14px 18px;
          font-weight: 800;
          font-size: 0.96rem;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .asn-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(19, 24, 34, 0.08);
        }

        .asn-btn.primary {
          color: #fff;
          background: linear-gradient(135deg, #d62828 0%, #ef4444 100%);
        }

        .asn-btn.secondary {
          color: #223044;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid #f0dcdc;
        }

        .asn-hero-side {
          display: grid;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .asn-side-card {
          padding: 18px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #efdfdf;
        }

        .asn-side-card img {
          width: 88px;
          height: auto;
        }

        .asn-side-card strong {
          display: block;
          margin-top: 10px;
          font-size: 1.05rem;
        }

        .asn-mascot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,243,240,0.96));
          border: 1px solid #f0dcdc;
        }

        .asn-mascot img {
          width: 88px;
          flex: 0 0 auto;
        }

        .asn-grid {
          display: grid;
          gap: 18px;
        }

        .asn-metrics {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .asn-metric-card {
          padding: 22px;
          border-radius: 24px;
          display: grid;
          gap: 12px;
        }

        .asn-kpi-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .asn-kpi-title {
          color: #6a7689;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .asn-kpi-value {
          font-size: clamp(1.8rem, 2.1vw, 2.3rem);
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 800;
        }

        .asn-kpi-delta {
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          background: #f0fdf4;
          color: #15803d;
          font-size: 0.82rem;
          font-weight: 800;
          border: 1px solid #d9f5df;
        }

        .asn-spark {
          display: flex;
          align-items: end;
          gap: 8px;
          height: 48px;
        }

        .asn-spark span {
          flex: 1 1 0;
          border-radius: 999px 999px 5px 5px;
          background: linear-gradient(180deg, rgba(214, 40, 40, 0.26), rgba(214, 40, 40, 0.86));
        }

        .asn-spark span:nth-child(1) { height: 38%; }
        .asn-spark span:nth-child(2) { height: 62%; }
        .asn-spark span:nth-child(3) { height: 50%; }
        .asn-spark span:nth-child(4) { height: 76%; }
        .asn-spark span:nth-child(5) { height: 68%; }
        .asn-spark span:nth-child(6) { height: 92%; }

        .asn-two-col {
          grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.92fr);
          align-items: start;
        }

        .asn-stack {
          display: grid;
          gap: 18px;
        }

        .asn-card {
          border-radius: 28px;
          padding: 24px;
        }

        .asn-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .asn-card-head p {
          margin: 6px 0 0;
          color: #697588;
          line-height: 1.6;
        }

        .asn-info-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #fff7f6;
          color: #d62828;
          border: 1px solid #f3dfdf;
          flex: 0 0 auto;
        }

        .asn-track-list {
          display: grid;
          gap: 16px;
        }

        .asn-track-item {
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr);
          gap: 16px;
          padding: 16px;
          border-radius: 20px;
          background: #fff;
          border: 1px solid #efe3e3;
        }

        .asn-track-icon {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          overflow: hidden;
        }

        .asn-track-meta {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          color: #6a7689;
          font-size: 0.92rem;
        }

        .asn-inline-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border-radius: 999px;
          background: #fff6eb;
          color: #b4690e;
          border: 1px solid #f7dfb5;
          font-weight: 700;
          width: fit-content;
          margin-top: 10px;
          font-size: 0.84rem;
        }

        .asn-chart-wrap {
          display: grid;
          gap: 16px;
        }

        .asn-bar-row {
          display: grid;
          grid-template-columns: 54px minmax(0, 1fr) 44px;
          align-items: center;
          gap: 14px;
        }

        .asn-bar-track {
          height: 12px;
          border-radius: 999px;
          background: #f4e7e7;
          overflow: hidden;
        }

        .asn-bar-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #d62828 0%, #f97316 100%);
        }

        .asn-roadmap {
          display: grid;
          gap: 14px;
        }

        .asn-roadmap-step {
          display: grid;
          grid-template-columns: 52px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .asn-roadmap-number {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-weight: 800;
          color: #d62828;
          background: #fff6f6;
          border: 1px solid #f3dddd;
        }

        .asn-roadmap-step p {
          margin: 6px 0 0;
          color: #6a7689;
          line-height: 1.6;
        }

        .asn-timeline {
          display: grid;
          gap: 14px;
        }

        .asn-timeline-item {
          display: grid;
          grid-template-columns: 62px minmax(0, 1fr);
          gap: 14px;
          padding: 14px;
          border-radius: 18px;
          background: #fff;
          border: 1px solid #efe5e5;
        }

        .asn-time {
          padding: 10px 8px;
          border-radius: 14px;
          text-align: center;
          font-weight: 800;
          color: #b42318;
          background: #fff5f4;
          border: 1px solid #f3dddd;
          height: fit-content;
        }

        .asn-highlight-box {
          padding: 18px;
          border-radius: 22px;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          color: white;
          display: grid;
          gap: 12px;
        }

        .asn-highlight-box .asn-progress-rail {
          background: rgba(255,255,255,0.16);
        }

        .asn-highlight-box .asn-progress-fill {
          background: linear-gradient(90deg, #f59e0b, #f97316);
        }

        .asn-highlight-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .asn-badge-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .asn-mini-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.9);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .asn-leaderboard {
          display: grid;
          gap: 12px;
        }

        .asn-leader-row {
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f1e8e8;
        }

        .asn-leader-row:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .asn-rank {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #fff7f4;
          border: 1px solid #f2dddd;
          color: #b42318;
          font-weight: 800;
        }

        .asn-score {
          text-align: right;
          font-weight: 800;
          color: #162033;
        }

        .asn-score small {
          display: block;
          margin-top: 4px;
          font-weight: 700;
          color: #7a8698;
        }

        .asn-footer-note {
          display: grid;
          gap: 14px;
          padding: 18px;
          border-radius: 20px;
          background: linear-gradient(180deg, #fff9f8 0%, #fff 100%);
          border: 1px solid #efe4e4;
        }

        .asn-footer-note strong {
          font-size: 1rem;
        }

        @media (max-width: 1220px) {
          .asn-dashboard {
            grid-template-columns: 1fr;
          }

          .asn-sidebar {
            position: static;
          }

          .asn-metrics,
          .asn-two-col,
          .asn-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .asn-dashboard-shell {
            padding: 14px;
          }

          .asn-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .asn-search {
            max-width: none;
          }

          .asn-topbar-right {
            justify-content: space-between;
          }

          .asn-metrics {
            grid-template-columns: 1fr;
          }

          .asn-track-item,
          .asn-timeline-item,
          .asn-roadmap-step {
            grid-template-columns: 1fr;
          }

          .asn-track-icon,
          .asn-time,
          .asn-roadmap-number {
            width: 100%;
            max-width: 72px;
          }
        }
      `}</style>











      <div className="asn-dashboard">
        <aside className="asn-sidebar">
          <div className="asn-brand">
            <img src={logoSvg} alt="Logo Bimbel ASN" />
            <div className="asn-brand-tag">Dashboard siswa • Premium learning suite</div>
          </div>

          <div className="asn-nav">
            <p className="asn-nav-title">Navigasi utama</p>
            {mainMenus.map((menu, index) => (
              <div className={`asn-nav-item ${index === 0 ? 'active' : ''}`} key={menu}>
                <NavDot />
                <span>{menu}</span>
              </div>
            ))}
          </div>

          <div className="asn-user-card">
            <div className="asn-user-top">
              <div className="asn-avatar">AP</div>
              <div>
                <h3>Adam Pratama</h3>
                <p className="asn-user-role">Peserta kelas intensif CPNS 2026</p>
              </div>
            </div>
            <div className="asn-mini-progress">
              <small>Target kelulusan batch ini</small>
              <div className="asn-progress-rail">
                <div className="asn-progress-fill" style={{ width: '81%' }} />
              </div>
              <strong>81% roadmap selesai</strong>
            </div>
          </div>
        </aside>

        <main className="asn-main asn-content">
          <div className="asn-topbar">
            <div className="asn-search">
              <SearchIcon />
              <span>Cari materi, tryout, mentor, atau kisi-kisi prioritas...</span>
            </div>
            <div className="asn-topbar-right">
              <div className="asn-top-action" aria-label="Notifikasi">
                <BellIcon />
              </div>
              <div className="asn-status-chip">Target lulus: On Track</div>
            </div>
          </div>

          <section className="asn-hero">
            <div>
              <div className="asn-overline">Platform belajar ASN • CPNS • PPPK • Sekolah kedinasan</div>
              <h1>Dashboard belajar yang lebih profesional untuk mengejar kelulusan ASN dengan strategi yang terukur.</h1>
              <p className="asn-hero-copy">
                Tampilan ini dirancang seperti produk edtech premium: fokus pada progres, performa tryout, agenda kelas,
                dan prioritas materi harian agar peserta langsung tahu apa yang harus dikerjakan berikutnya.
              </p>
              <div className="asn-hero-actions">
                <button className="asn-btn primary">Mulai tryout hari ini</button>
                <button className="asn-btn secondary">Lihat roadmap belajar</button>
              </div>
            </div>

            <div className="asn-hero-side">
              <div className="asn-side-card">
                <img src={badgeSvg} alt="Badge kelulusan" />
                <strong>Simulasi kelulusan meningkat</strong>
                <p className="asn-meta">Probabilitas lolos naik berdasarkan tren 6 tryout terakhir dan progres modul yang sudah selesai.</p>
              </div>

              <div className="asn-mascot">
                <div>
                  <strong>Mentor note</strong>
                  <p className="asn-meta">Fokuskan 3 hari ke depan pada TIU numerik dan penguatan pola jawaban TKP.</p>
                </div>
                <img src={mascotSvg} alt="Maskot belajar ASN" />
              </div>
            </div>
          </section>

          <section className="asn-grid asn-metrics">
            {metricCards.map((item) => (
              <article className="asn-card asn-metric-card" key={item.title}>
                <div className="asn-kpi-head">
                  <div>
                    <div className="asn-kpi-title">{item.title}</div>
                    <div className="asn-kpi-value">{item.value}</div>
                  </div>
                  <div className="asn-kpi-delta">{item.delta}</div>
                </div>
                <div className="asn-spark" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="asn-muted">{item.note}</div>
              </article>
            ))}
          </section>

          <section className="asn-grid asn-two-col">
            <div className="asn-stack">
              <article className="asn-card">
                <div className="asn-card-head">
                  <div>
                    <h2>Progress materi inti</h2>
                    <p>Setiap track ditampilkan dengan progres, beban belajar tersisa, dan status kesiapan menuju tryout final.</p>
                  </div>
                  <div className="asn-info-icon">
                    <TargetIcon />
                  </div>
                </div>

                <div className="asn-track-list">
                  {learningTracks.map(({ title, progress, lessons, status, Icon }) => (
                    <article className="asn-track-item" key={title}>
                      <div className="asn-track-icon">
                        <Icon />
                      </div>
                      <div>
                        <h3>{title}</h3>
                        <div className="asn-track-meta">
                          <span>{lessons}</span>
                          <span>Progres {progress}%</span>
                        </div>
                        <div className="asn-inline-badge">{status}</div>
                        <div className="asn-progress-rail" style={{ marginTop: 12 }}>
                          <div className="asn-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </article>

              <article className="asn-card">
                <div className="asn-card-head">
                  <div>
                    <h2>Analitik tryout per kompetensi</h2>
                    <p>Visual ini membantu peserta melihat mata uji yang sudah kuat dan area yang masih perlu akselerasi.</p>
                  </div>
                  <div className="asn-info-icon">
                    <BookIcon />
                  </div>
                </div>

                <div className="asn-chart-wrap">
                  {tryoutBars.map((bar) => (
                    <div className="asn-bar-row" key={bar.label}>
                      <strong>{bar.label}</strong>
                      <div className="asn-bar-track">
                        <div className="asn-bar-fill" style={{ width: `${bar.value}%` }} />
                      </div>
                      <strong>{bar.value}%</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="asn-card">
                <div className="asn-card-head">
                  <div>
                    <h2>Roadmap 14 hari ke depan</h2>
                    <p>Susunan target dibuat ringkas agar pengguna tahu urutan eksekusi belajar sampai simulasi akhir.</p>
                  </div>
                  <div className="asn-info-icon">
                    <ClockIcon />
                  </div>
                </div>

                <div className="asn-roadmap">
                  <div className="asn-roadmap-step">
                    <div className="asn-roadmap-number">01</div>
                    <div>
                      <h3>Penguatan TIU numerik</h3>
                      <p>Kerjakan paket drill numerik, fokus kecepatan hitung, dan evaluasi kesalahan paling sering.</p>
                    </div>
                  </div>

                  <div className="asn-roadmap-step">
                    <div className="asn-roadmap-number">02</div>
                    <div>
                      <h3>Review TKP berbasis prioritas nilai</h3>
                      <p>Latih pola memilih jawaban yang paling mencerminkan pelayanan publik, integritas, dan profesionalisme.</p>
                    </div>
                  </div>

                  <div className="asn-roadmap-step">
                    <div className="asn-roadmap-number">03</div>
                    <div>
                      <h3>Simulasi full set + pembahasan personal</h3>
                      <p>Masuk ke fase evaluasi total dengan pembacaan analitik hasil untuk menentukan sesi remedial berikutnya.</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="asn-stack">
              <article className="asn-card">
                <div className="asn-card-head">
                  <div>
                    <h2>Agenda belajar hari ini</h2>
                    <p>Jadwal kelas dan sesi latihan yang menjadi prioritas pada hari berjalan.</p>
                  </div>
                  <div className="asn-info-icon">
                    <ClockIcon />
                  </div>
                </div>

                <div className="asn-timeline">
                  {schedule.map((item) => (
                    <article className="asn-timeline-item" key={item.time + item.title}>
                      <div className="asn-time">{item.time}</div>
                      <div>
                        <h3>{item.title}</h3>
                        <p className="asn-meta" style={{ marginTop: 6 }}>{item.meta}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </article>

              <article className="asn-highlight-box">
                <div className="asn-highlight-top">
                  <div>
                    <div className="asn-mini-tag">Performance summary</div>
                    <h3 style={{ marginTop: 10 }}>Target kelulusan batch 2026</h3>
                  </div>
                  <img src={badgeSvg} alt="Badge kelulusan" style={{ width: 72, height: 'auto' }} />
                </div>
                <p style={{ margin: 0, lineHeight: 1.7, color: 'rgba(255,255,255,0.82)' }}>
                  Berdasarkan progres materi, intensitas tryout, dan tren skor terakhir, posisi peserta masih berada pada jalur yang sehat untuk mengejar passing grade.
                </p>
                <div>
                  <div className="asn-badge-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>Indeks kesiapan akhir</strong>
                    <span>84%</span>
                  </div>
                  <div className="asn-progress-rail">
                    <div className="asn-progress-fill" style={{ width: '84%' }} />
                  </div>
                </div>
              </article>

              <article className="asn-card">
                <div className="asn-card-head">
                  <div>
                    <h2>Leaderboard kelas intensif</h2>
                    <p>Panel ini memperkuat nuansa kompetitif sekaligus memberi konteks posisi pengguna di kelas.</p>
                  </div>
                </div>

                <div className="asn-leaderboard">
                  {leaderboard.map((user, index) => (
                    <div className="asn-leader-row" key={user.name}>
                      <div className="asn-rank">{index + 1}</div>
                      <div>
                        <strong>{user.name}</strong>
                        <div className="asn-muted" style={{ marginTop: 4 }}>{user.badge}</div>
                      </div>
                      <div className="asn-score">
                        {user.score}
                        <small>Skor</small>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="asn-footer-note">
                <strong>Catatan UI/UX</strong>
                <div className="asn-muted" style={{ lineHeight: 1.7 }}>
                  Versi ini sudah dibuat lebih profesional dengan struktur dashboard yang lebih realistis untuk produk bimbel: ada sidebar, topbar,
                  KPI, analytics, roadmap, leaderboard, dan jadwal harian. Cocok untuk dipakai sebagai basis dashboard siswa di React + Vite.
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </section>
  )
}
