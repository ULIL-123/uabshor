
import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceScanner from './components/AttendanceScanner';
import AttendanceReport from './components/AttendanceReport';
import Settings from './components/Settings';
import Login from './components/Login';
import { CameraIcon, UsersIcon, ChartBarIcon, HomeIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

type Page = 'dashboard' | 'students' | 'scanner' | 'reports' | 'settings';

const AppLogoMini = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full">
    <rect x="22" y="22" width="76" height="76" rx="14" transform="rotate(45 60 60)" fill="#1e1b4b" stroke="#22d3ee" strokeWidth="6" />
    <g transform="translate(4, 0)">
        <path d="M32 42 V62 H48 M45 42 V72" fill="none" stroke="#22d3ee" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <g transform="translate(52, 45)" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M2 0 V15 M2 7.5 L10 0 M2 7.5 L10 15" />
            <path d="M16 0 V15 M16 0 H23 Q26 0 26 4 Q26 8 23 8 H16 M20 8 L26 15" />
            <circle cx="38" cy="7.5" r="7" stroke="#22d3ee" />
        </g>
    </g>
  </svg>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleLogout = () => {
    if (window.confirm("Selesaikan sesi admin?")) {
      logout();
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'students':
        return <StudentManagement />;
      case 'scanner':
        return <AttendanceScanner />;
      case 'reports':
        return <AttendanceReport />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  const NavItem = ({ page, label, icon }: { page: Page, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-all duration-300 ${currentPage === page ? 'text-slate-900 scale-105' : 'text-slate-400 opacity-60'}`}
    >
      <div className={`transition-all duration-300 ${currentPage === page ? 'bg-cyan-400 p-2 rounded-2xl text-slate-900 shadow-lg shadow-cyan-400/20' : ''}`}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-2">{label}</span>
    </button>
  );

  return (
      <div className="relative flex flex-col h-screen font-sans bg-slate-50 text-slate-800 overflow-hidden">
        
        {/* Subtle Watermark Logo */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.015]">
             <div className="w-[100vw] h-[100vw] rotate-12">
                <AppLogoMini />
             </div>
        </div>

        <div className="flex flex-col h-full z-10 relative">
            {/* App Header */}
            <header className="bg-white/80 backdrop-blur-2xl text-slate-800 shadow-sm z-30 relative border-b border-slate-100">
               <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-900 rounded-2xl shadow-xl p-2.5">
                    <AppLogoMini />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-[15px] font-black text-slate-950 leading-tight uppercase tracking-tight">
                      SDN 4 KRONGGEN
                    </h2>
                    <p className="text-[7px] font-black text-cyan-600 uppercase tracking-[0.2em] mt-0.5">
                      TOWARDS LITERATE SCHOOL
                    </p>
                  </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="p-3 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-2xl border border-slate-100"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            </header>
            
            <main className="flex-grow container mx-auto p-4 sm:p-8 overflow-y-auto scrollbar-hide">
              <div className="max-w-lg mx-auto w-full">
                {renderPage()}
              </div>
            </main>

            <footer className="bg-white/95 backdrop-blur-2xl shadow-[0_-15px_40px_rgba(0,0,0,0.04)] sticky bottom-0 border-t border-slate-100 z-20 pb-safe">
              <nav className="flex justify-around items-end h-20 max-w-lg mx-auto px-3">
                <NavItem page="dashboard" label="Home" icon={<HomeIcon className="w-5 h-5" />} />
                <NavItem page="students" label="Siswa" icon={<UsersIcon className="w-5 h-5" />} />
                
                <div className="relative -top-10">
                  <button 
                    onClick={() => setCurrentPage('scanner')}
                    className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-3xl shadow-2xl shadow-slate-300 border-[6px] border-white hover:scale-110 transition-transform group"
                  >
                    <CameraIcon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="text-center mt-2">
                     <span className={`text-[8px] font-black tracking-widest uppercase ${currentPage === 'scanner' ? 'text-slate-900' : 'text-slate-300'}`}>SCANNER</span>
                  </div>
                </div>

                <NavItem page="reports" label="Report" icon={<ChartBarIcon className="w-5 h-5" />} />
                <NavItem page="settings" label="System" icon={<Cog6ToothIcon className="w-5 h-5" />} />
              </nav>
            </footer>
        </div>
      </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
