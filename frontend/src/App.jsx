import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore.js';
import { useThemeStore } from './store/themeStore.js';
import { ToastContainer } from './components/ui/ToastContainer.jsx';
import { NotificationModal } from './components/ui/NotificationModal.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import { toast } from './store/toastStore.js';

// Layouts & Guards
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AdminLayout } from './components/layout/AdminLayout.jsx';
import { MemberLayout } from './components/layout/MemberLayout.jsx';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { PublicRegistrationPage } from './pages/public/PublicRegistrationPage.jsx';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage.jsx';
import { AdminLoansPage } from './pages/admin/AdminLoansPage.jsx';
import { AdminMembersPage } from './pages/admin/AdminMembersPage.jsx';
import { AdminRegionControlPage } from './pages/admin/AdminRegionControlPage.jsx';
import { AdminFinancePage } from './pages/admin/AdminFinancePage.jsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.jsx';
import { AdminSlidersPage } from './pages/admin/AdminSlidersPage.jsx';
import { AdminGoogleDrivePage } from './pages/admin/AdminGoogleDrivePage.jsx';
import { AdminDutyAssignmentsPage } from './pages/admin/AdminDutyAssignmentsPage.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';

// Member Pages
import { MemberDashboardPage } from './pages/anggota/MemberDashboardPage.jsx';
import { MemberInventoryPage } from './pages/anggota/MemberInventoryPage.jsx';
import { MemberLoansPage } from './pages/anggota/MemberLoansPage.jsx';
import { MemberRegionControlPage } from './pages/anggota/MemberRegionControlPage.jsx';
import { MemberDirectoryPage } from './pages/anggota/MemberDirectoryPage.jsx';
import { MemberGoogleDrivePage } from './pages/anggota/MemberGoogleDrivePage.jsx';
import { MemberDutyAssignmentsPage } from './pages/anggota/MemberDutyAssignmentsPage.jsx';
import { MemberProfilePage } from './pages/anggota/MemberProfilePage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App = () => {
  const { checkAuth, isAuthenticated, user, isLoading } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkAuth();

    // Global override untuk mengubah semua alert default browser menjadi notifikasi modern & profesional
    window.alert = (message) => {
      if (message === undefined || message === null) return;
      const msgStr = typeof message === 'string' ? message : String(message);
      const lower = msgStr.toLowerCase();

      if (
        lower.includes('berhasil') ||
        lower.includes('sukses') ||
        lower.includes('disimpan') ||
        lower.includes('disetujui') ||
        lower.includes('terkirim') ||
        lower.includes('dicatat')
      ) {
        toast.success(msgStr);
      } else if (
        lower.includes('gagal') ||
        lower.includes('error') ||
        lower.includes('salah') ||
        lower.includes('tidak valid') ||
        lower.includes('ditolak') ||
        lower.includes('kadaluarsa')
      ) {
        toast.error(msgStr);
      } else if (
        lower.includes('perhatian') ||
        lower.includes('peringatan') ||
        lower.includes('wajib') ||
        lower.includes('minimal') ||
        lower.includes('harap')
      ) {
        toast.warning(msgStr);
      } else {
        toast.info(msgStr);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <NotificationModal />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pendaftaran" element={<PublicRegistrationPage />} />
          <Route path="/daftar" element={<PublicRegistrationPage />} />

          {/* Root Redirect */}
          <Route
            path="/"
            element={
              isLoading ? (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isAuthenticated ? (
                <Navigate to={user?.role === 'SUPER_ADMIN' ? '/admin' : '/member'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Super Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout title="Administrasi Super Admin" />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="loans" element={<AdminLoansPage />} />
              <Route path="members" element={<AdminMembersPage />} />
              <Route path="region-control" element={<AdminRegionControlPage />} />
              <Route path="finance" element={<AdminFinancePage />} />
              <Route path="sliders" element={<AdminSlidersPage />} />
              <Route path="drive" element={<AdminGoogleDrivePage />} />
              <Route path="duty-assignments" element={<AdminDutyAssignmentsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Anggota Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ANGGOTA']} />}>
            <Route path="/member" element={<MemberLayout title="Portal Anggota" />}>
              <Route index element={<MemberDashboardPage />} />
              <Route path="inventory" element={<MemberInventoryPage />} />
              <Route path="loans" element={<MemberLoansPage />} />
              <Route path="region-control" element={<MemberRegionControlPage />} />
              <Route path="duty-assignments" element={<MemberDutyAssignmentsPage />} />
              <Route path="drive" element={<MemberGoogleDrivePage />} />
              <Route path="directory" element={<MemberDirectoryPage />} />
              <Route path="profile" element={<MemberProfilePage />} />
              <Route path="settings" element={<MemberProfilePage />} />
            </Route>
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

