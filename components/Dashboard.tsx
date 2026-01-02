
import React from 'react';
import { useData } from '../context/DataContext';
import { getTodayDateString } from '../utils/dateUtils';
import { CameraIcon, UsersIcon, ChartBarIcon, ArrowRightIcon, CheckCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const CreativeLogoSmall = () => (
  <div className="w-16 h-16 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-transform hover:scale-105">
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <defs>
        <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect x="22" y="22" width="76" height="76" rx="14" transform="rotate(45 60 60)" fill="#0f172a" stroke="url(#dashGrad)" strokeWidth="2" />
      <g transform="translate(4, 0)">
        <path d="M32 42 V62 H48 M45 42 V72" fill="none" stroke="#22d3ee" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
        <g transform="translate(52, 45)" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M2 0 V15 M2 7.5 L10 0 M2 7.5 L10 15" />
            <path d="M16 0 V15 M16 0 H23 Q26 0 26 4 Q26 8 23 8 H16 M20 8 L26 15" />
            <circle cx="38" cy="7.5" r="7.5" stroke="#22d3ee" />
        </g>
      </g>
    </svg>
  </div>
);

const MiniRobot = () => (
  <div className="w-12 h-12 animate-float opacity-70">
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect x="60" y="80" width="80" height="70" rx="15" fill="#1e1b4b" />
      <rect x="70" y="90" width="60" height="50" rx="10" fill="#4338ca" />
      <rect x="55" y="30" width="90" height="65" rx="25" fill="#1e1b4b" />
      <circle cx="85" cy="62" r="6" fill="#22d3ee" />
      <circle cx="115" cy="62" r="6" fill="#22d3ee" />
    </svg>
  </div>
);

const Dashboard: React.FC<{ setCurrentPage: (page: any) => void }> = ({ setCurrentPage }) => {
  const { getAttendanceForDate } = useData();
  const today = getTodayDateString();
  const attendanceToday = getAttendanceForDate(today);

  const presentCount = attendanceToday.filter(a => a.status === 'Present').length;
  const totalStudents = attendanceToday.length;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      <div className="relative w-full bg-slate-950 border border-white/5 rounded-[2.8rem] shadow-2xl shadow-indigo-950/20 overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
        
        <div className="relative z-10 p-10 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-8 mb-6">
                <CreativeLogoSmall />
                <div className="w-px h-12 bg-white/10"></div>
                <MiniRobot />
            </div>
            
            <h1 className="text-2xl font-black tracking-[0.25em] text-white uppercase mb-1">
               HADIRKU<span className="text-cyan-400 ml-2 font-sans tracking-tighter">4KRO</span>
            </h1>
            <p className="text-base font-black tracking-[0.3em] text-white/50 uppercase mb-1">
                SD Negeri 4 Kronggen
            </p>
            <p className="text-[9px] font-bold tracking-[0.25em] text-cyan-400/40 uppercase mb-8 italic">
                TOWARDS LITERATE SCHOOL
            </p>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-8 py-3 border border-white/10 shadow-inner">
                 <p className="text-xs font-bold text-cyan-100 tracking-[0.2em] uppercase">
                    {new Date(today).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                 </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 px-1">
          <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-slate-100 flex flex-col items-center group hover:border-cyan-100 transition-all">
             <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mb-4 text-cyan-600 transition-transform group-hover:scale-110">
                <AcademicCapIcon className="w-6 h-6" />
             </div>
             <span className="text-3xl font-black text-slate-900 block leading-none">{totalStudents}</span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Siswa Aktif</p>
          </div>
          <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-slate-100 flex flex-col items-center group hover:border-indigo-100 transition-all">
             <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 transition-transform group-hover:scale-110">
                <CheckCircleIcon className="w-6 h-6" />
             </div>
             <span className="text-3xl font-black text-slate-900 block leading-none">{presentCount}</span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Hadir Hari Ini</p>
          </div>
      </div>
      
      <div className="space-y-4 px-1">
          <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Menu</h3>
              <div className="h-px flex-1 bg-slate-100 ml-4"></div>
          </div>
          
          <button onClick={() => setCurrentPage('scanner')} className="group w-full bg-slate-900 p-6 rounded-[2.2rem] shadow-xl shadow-slate-200 flex items-center justify-between hover:bg-black transition-all active:scale-[0.98]">
              <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-400 flex items-center justify-center text-slate-900 shadow-lg shadow-cyan-400/20">
                      <CameraIcon className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                      <h3 className="font-bold text-white text-base">SCAN QR CODE</h3>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide">Input kehadiran otomatis</p>
                  </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-cyan-400 group-hover:text-slate-900 transition-all">
                 <ArrowRightIcon className="w-5 h-5" />
              </div>
          </button>
          
          <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCurrentPage('students')} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-start gap-4 hover:bg-slate-50 transition-all active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <UsersIcon className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900 text-sm">Database</h3>
                      <p className="text-[9px] text-slate-400 font-medium">Manajemen Siswa</p>
                  </div>
              </button>

              <button onClick={() => setCurrentPage('reports')} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-start gap-4 hover:bg-slate-50 transition-all active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <ChartBarIcon className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900 text-sm">Laporan</h3>
                      <p className="text-[9px] text-slate-400 font-medium">Rekapitulasi Data</p>
                  </div>
              </button>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
