import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  HandCoins,
  Users,
  Compass,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Layers,
  Sparkles,
  Building2,
  FolderOpen,
  Tv,
  UserCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { getImageUrl } from '../../lib/utils.js';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { branding } = useThemeStore();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const adminNavSections = [
    {
      title: 'RINGKASAN',
      items: [
        { name: 'Administrasi', path: '/admin', icon: LayoutDashboard },
        { name: 'Pembagian Penugasan', path: '/admin/duty-assignments', icon: Tv },
      ],
    },
    {
      title: 'LOGISTIK & OPERASIONAL',
      items: [
        { name: 'Data Inventaris Internal', path: '/admin/inventory', icon: Boxes },
        { name: 'Pinjaman Lembaga Mitra', path: '/admin/loans?tab=institution_loans', icon: Building2 },
        { name: 'Peminjaman Anggota', path: '/admin/loans', icon: HandCoins },
        { name: 'Data Anggota', path: '/admin/members', icon: Users },
        { name: 'Kontrol Wilayah', path: '/admin/region-control', icon: Compass },
        { name: 'Rekap Uang', path: '/admin/finance', icon: Wallet },
      ],
    },
    {
      title: 'PENGATURAN & SISTEM',
      items: [
        { name: 'Foto Slider Depan', path: '/admin/sliders', icon: Sparkles },
        { name: 'Google Drive Berkas', path: '/admin/drive', icon: FolderOpen },
        { name: 'Kelola Pengelola Admin', path: '/admin/users', icon: ShieldCheck },
        { name: 'Pengaturan Sistem', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const memberNavSections = [
    {
      title: 'RINGKASAN',
      items: [
        { name: 'Beranda Anggota', path: '/member', icon: LayoutDashboard },
        { name: 'Jadwal Penugasan', path: '/member/duty-assignments', icon: Tv },
      ],
    },
    {
      title: 'LAYANAN ANGGOTA',
      items: [
        { name: 'Katalog Inventaris', path: '/member/inventory', icon: Boxes },
        { name: 'Peminjaman Saya', path: '/member/loans', icon: HandCoins },
        { name: 'Kontrol Wilayah', path: '/member/region-control', icon: Compass },
        { name: 'Direktori Anggota', path: '/member/directory', icon: Users },
      ],
    },
    {
      title: 'BERKAS & DOKUMEN',
      items: [
        { name: 'Google Drive Unduhan', path: '/member/drive', icon: FolderOpen },
      ],
    },
    {
      title: 'PENGATURAN & AKUN',
      items: [
        { name: 'Pengaturan Profil', path: '/member/profile', icon: UserCircle2 },
      ],
    },
  ];

  const navSections = isSuperAdmin ? adminNavSections : memberNavSections;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`print:hidden relative hidden md:flex flex-col h-screen glass-panel border-r border-white/10 transition-all duration-300 z-30 select-none flex-shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/15 p-1 shadow-glow flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={branding?.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${branding.logoUrl}` : (branding?.logoUrl || '/logo-rojabiyyah.png')}
              alt={branding?.appName || 'Rojabiyyah'}
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm tracking-wide text-white truncate">
                {branding?.appName || 'ROJABIYYAAH'}
              </span>
              <span className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase">
                {isSuperAdmin ? 'Super Admin' : 'Portal Anggota'}
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Grouped by Section */}
      <nav className="flex-1 p-3 space-y-3.5 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={section.title || sIdx} className="space-y-1">
            {/* Section Header / Keterangan Kategori */}
            {!isCollapsed ? (
              <div className="px-3 pt-1 pb-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
                  {section.title}
                </span>
              </div>
            ) : (
              sIdx > 0 && <div className="my-2 mx-1 border-t border-white/10" />
            )}

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin' || item.path === '/member'}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-[#800020] via-[#94112e] to-[#ab1737] text-white shadow-glow border border-rose-400/30 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile summary */}
      <div className="p-3 border-t border-white/10">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-white/5 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#800020] to-amber-500 flex items-center justify-center text-white font-bold text-xs uppercase flex-shrink-0 shadow-glow overflow-hidden border border-white/10">
            {user?.member?.avatar ? (
              <img
                src={getImageUrl(user.member.avatar)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{(user?.member?.fullName || user?.username || 'AD').slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.member?.fullName || user?.username || 'Pengguna'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : (user?.member?.division || 'Anggota')}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

