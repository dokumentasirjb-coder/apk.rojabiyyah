import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  HandCoins,
  Compass,
  FolderOpen,
  Users,
  Tv,
} from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { name: 'Beranda', path: '/member', icon: LayoutDashboard },
    { name: 'Tugas', path: '/member/duty-assignments', icon: Tv },
    { name: 'Inventaris', path: '/member/inventory', icon: Boxes },
    { name: 'Pinjaman', path: '/member/loans', icon: HandCoins },
    { name: 'Wilayah', path: '/member/region-control', icon: Compass },
    { name: 'Drive', path: '/member/drive', icon: FolderOpen },
    { name: 'Anggota', path: '/member/directory', icon: Users },
  ];

  return (
    <nav className="print:hidden md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-1 py-1.5 flex items-center justify-around shadow-2xl overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/member'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-0.5 px-1.5 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
                isActive
                  ? 'text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-[#800020] text-white shadow-glow scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="mt-0.5">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

