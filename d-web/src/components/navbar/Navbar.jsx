import { useState } from 'react';
import { Menu, X, Bell, User, LayoutDashboard } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Home', href: '#' },
    { label: 'Laporan', href: '#' },
    { label: 'Kalender', href: '#' },
  ];

  return (
    <nav className="sticky top-0 z-30 bg-white text-slate-800 shadow-sm border-b border-gray-200">
      <div className="px-6 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Kiri: Hamburger + Judul (judul hanya desktop) */}
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
            <LayoutDashboard className="w-6 h-6 text-slate-700 hidden md:block" />
          </div>

          {/* Desktop menu kanan */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition"
              >
                {item.label}
              </a>
            ))}
            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </div>
            </button>
          </div>

          {/* Mobile: tombol bell untuk dropdown kanan */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Bell size={24} />}
          </button>
        </div>

        {/* Dropdown menu mobile (notifikasi & profil) */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex flex-col p-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 rounded-lg text-slate-700 hover:bg-cyan-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <hr className="my-2" />
              <button className="flex items-center space-x-2 px-4 py-3 text-slate-700">
                <Bell size={20} />
                <span>Notifikasi</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-3 text-slate-700">
                <User size={20} />
                <span>Profil</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;