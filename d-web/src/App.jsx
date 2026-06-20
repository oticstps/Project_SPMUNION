import React, { useState } from 'react';
import Navbar from './components/navbar/Navbar';
import Sidebar from './components/sidebar/Sidebar';
import Karyawan from './components/pages/Karyawan';
import Dashboard from './components/pages/Dashboard';
import DashboardAsn from './components/pages/DashboardAsn';
import MonitoringProduksi from './components/pages/MonitoringProduksi';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  const renderContent = () => {
    switch (activeMenu) {
      case 'karyawan':
        return <Karyawan />;
      case 'dashboard':
        return <Dashboard />;
      case 'dashboard-asn':
        return <DashboardAsn />;
      case 'monitoring-produksi':
        return <MonitoringProduksi />;
      default:
        return <h1 className="text-2xl font-bold text-slate-800">Dalam proses pengerjaan</h1>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      


      
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        setActiveMenu={(menu) => {
          setActiveMenu(menu);
          closeMobileSidebar();
        }}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />




      <div className={`flex flex-col w-full transition-all duration-300 ${sidebarCollapsed ? 'md:ml-24' : 'md:ml-64'} ml-0`}>
        <Navbar onMenuClick={toggleMobileSidebar} />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>




      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}



    </div>
  );
}

export default App;