import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { AdminBottomNav } from './AdminBottomNav.jsx';

export const AdminLayout = ({ title = 'Dashboard Super Admin' }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 pb-16 md:pb-0 print:h-auto print:overflow-visible print:bg-white print:p-0">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 space-y-5 print:p-0 print:overflow-visible">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation for Admin */}
      <AdminBottomNav />
    </div>
  );
};

