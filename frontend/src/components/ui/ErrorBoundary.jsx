import React from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary tertangkap:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    try {
      const userStr = localStorage.getItem('rojabiyyaah_user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (user?.role === 'ANGGOTA') {
        window.location.href = '/member';
      } else {
        window.location.href = '/login';
      }
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Kendala rendering komponen UI';

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Terjadi Kendala Tampilan</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Halaman mengalami kendala saat memuat komponen antarmuka. Silakan pilih opsi di bawah untuk memulihkan tampilan secara otomatis.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={this.handleGoDashboard}
              className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-2 shadow-glow active:scale-95 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Masuk ke Dashboard</span>
            </button>

            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Segarkan Halaman</span>
            </button>
          </div>

          {/* Collapsible Error Technical Detail */}
          <div className="w-full max-w-lg text-left">
            <button
              type="button"
              onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              className="mx-auto flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span>Detail Teknis Sistem</span>
              {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {this.state.showDetails && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-white/10 text-left font-mono text-[11px] text-rose-300 overflow-x-auto shadow-inner">
                <p className="font-bold mb-1 text-rose-400">{errorMessage}</p>
                <pre className="text-[10px] text-slate-400 whitespace-pre-wrap leading-tight">
                  {this.state.error?.stack || 'No stack trace available'}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

