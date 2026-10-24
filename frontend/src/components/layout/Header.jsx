import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { getImageUrl } from '../../lib/utils.js';
import api from '../../api/axios.js';

export const Header = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif.id}/read`);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      }
      setShowNotifications(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="print:hidden h-16 glass-panel border-b border-white/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <img
          src="/logo-rojabiyyah.png"
          alt="Rojabiyyah"
          className="md:hidden w-9 h-9 rounded-lg object-contain bg-[#5c0017] border border-rose-500/30 p-1 shadow-glow"
        />
        <h1 className="text-base md:text-lg font-bold text-white tracking-wide truncate">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card border border-white/20 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                <span className="font-bold text-sm text-white">Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi baru</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                        notif.isRead
                          ? 'bg-slate-900/30 border-transparent text-slate-400'
                          : 'bg-indigo-950/40 border-indigo-500/30 text-slate-200'
                      } hover:bg-white/10`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'URGENT' || notif.type === 'WARNING' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{notif.title}</p>
                          <p className="line-clamp-2 mt-0.5 text-slate-300">{notif.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#800020] via-rose-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-glow overflow-hidden border border-white/10">
              {user?.member?.avatar ? (
                <img
                  src={getImageUrl(user.member.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(user?.member?.fullName || user?.username || 'US').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-white hidden sm:inline-block max-w-[100px] truncate">
              {user?.member?.fullName || user?.username || 'Pengguna'}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-card border border-white/20 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.member?.fullName || user?.username || 'Pengguna'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || '-'}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                  {user?.role || 'ANGGOTA'}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate(user?.role === 'SUPER_ADMIN' ? '/admin/settings' : '/member/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <User className="w-4 h-4 text-rose-400" />
                <span>Pengaturan Profil & Foto</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Aplikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

