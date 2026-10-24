import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  HandCoins,
  Compass,
  Users,
  Settings,
  Wallet,
  Sparkles,
  FolderOpen,
  Tv,
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';

const PRIMARY_NAV = [
  { name: 'Beranda', path: '/admin', icon: LayoutDashboard },
  { name: 'Inventaris', path: '/admin/inventory', icon: Boxes },
  { name: 'Pinjaman', path: '/admin/loans', icon: HandCoins },
  { name: 'Wilayah', path: '/admin/region-control', icon: Compass },
  { name: 'Anggota', path: '/admin/members', icon: Users },
];

const MORE_NAV = [
  { name: 'Penugasan', path: '/admin/duty-assignments', icon: Tv },
  { name: 'Google Drive', path: '/admin/drive', icon: FolderOpen },
  { name: 'Rekap Uang', path: '/admin/finance', icon: Wallet },
  { name: 'Foto Slider', path: '/admin/sliders', icon: Sparkles },
  { name: 'Pengaturan', path: '/admin/settings', icon: Settings },
];

export const AdminBottomNav = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More Menu Popup */}
      {showMore && (
        <div
          className="print:hidden md:hidden fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 mx-3 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 grid grid-cols-3 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-3 px-2 rounded-xl text-[11px] font-medium transition-all ${
                      isActive
                        ? 'text-amber-300 bg-[#800020]/40 font-bold border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1.5 rounded-lg mb-1 ${isActive ? 'bg-indigo-600/30' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="print:hidden md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-1 py-1.5 flex items-center justify-around shadow-2xl">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-medium transition-all ${
                  isActive
                    ? 'text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-[#800020] text-white shadow-glow scale-110' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="mt-0.5">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-medium transition-all ${
            showMore ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${showMore ? 'bg-[#800020] text-white scale-110' : ''}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="mt-0.5">Lainnya</span>
        </button>
      </nav>
    </>
  );
};

