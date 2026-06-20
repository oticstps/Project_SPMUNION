import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  DollarSign,
  Briefcase,
  Megaphone,
  FileText,
  Archive,
  GraduationCap,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import logo from '../../assets/spmunion.jpeg';

const Sidebar = ({ collapsed, onToggle, setActiveMenu, isMobileOpen, onMobileClose }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Dashboard ASN', icon: LayoutDashboard, key: 'dashboard-asn' },
    { name: 'Monitoring Produksi', icon: LayoutDashboard, key: 'monitoring-produksi' },
    { name: 'Karyawan', icon: Users, key: 'karyawan' },
    { name: 'Absensi', icon: ClipboardList, key: 'absensi' },
    { name: 'Cuti / Izin', icon: Clock, key: 'cuti' },
    { name: 'Penggajian', icon: DollarSign, key: 'penggajian' },
    { name: 'Proyek', icon: Briefcase, key: 'proyek' },
    { name: 'Pengumuman', icon: Megaphone, key: 'pengumuman' },
    { name: 'Laporan', icon: FileText, key: 'laporan' },
    { name: 'Arsip', icon: Archive, key: 'arsip' },
    { name: 'Training', icon: GraduationCap, key: 'training' },
    { name: 'Pengaturan', icon: Settings, key: 'pengaturan' },
    { name: 'Bantuan', icon: HelpCircle, key: 'bantuan' },
  ];

  // Base classes
  const baseClasses = "bg-gradient-to-b from-slate-800 to-slate-900 text-white h-screen fixed left-0 top-0 z-50 shadow-xl transition-all duration-300 ease-in-out";

  // Desktop
  const desktopClasses = "hidden md:block";
  const desktopWidth = collapsed ? 'w-24' : 'w-64';

  // Mobile
  const mobileClasses = "block md:hidden w-64";
  const mobileTransform = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className={`${baseClasses} ${desktopClasses} ${desktopWidth}`}>
        {/* Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-5 py-6 border-b border-slate-700`}>
          <img src={logo} alt="SPM Union Logo" className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-xl font-bold tracking-tight whitespace-nowrap">SPM Union</h2>
              <p className="text-xs text-slate-400 whitespace-nowrap">Management System</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="p-3 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-slate-600">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveMenu(item.key)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-slate-200 hover:bg-cyan-600 hover:text-white transition-all duration-200 group`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon size={22} className="text-slate-400 group-hover:text-white flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle collapse */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-white rounded-full p-1.5 shadow-lg hover:bg-cyan-600 transition z-50"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Footer user */}
        {!collapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3 px-2 py-2">
              <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">A</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin</p>
                <p className="text-xs text-slate-400 truncate">trieka@company.com</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE SIDEBAR */}
      <div className={`${baseClasses} ${mobileClasses} ${mobileTransform}`}>
        {/* Header dengan tombol close */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="SPM Union Logo" className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">SPM Union</h2>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-3 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-slate-600">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveMenu(item.key)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-200 hover:bg-cyan-600 hover:text-white transition-all duration-200"
                >
                  <item.icon size={22} className="text-slate-400 group-hover:text-white flex-shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer user mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">A</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-slate-400 truncate">trieka@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;