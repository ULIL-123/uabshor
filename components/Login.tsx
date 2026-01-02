
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

const CreativeLogo = ({ size = "w-32 h-32" }: { size?: string }) => (
  <div className={`${size} relative z-40 mb-4 group perspective-1000`}>
    <style>{`
      @keyframes scan-line {
        0%, 100% { transform: translateY(0px); opacity: 0; }
        50% { transform: translateY(45px); opacity: 0.8; }
      }
      @keyframes pulse-hex {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
      }
      @keyframes data-flow {
        0% { stroke-dashoffset: 20; }
        100% { stroke-dashoffset: 0; }
      }
      .animate-scan { animation: scan-line 3.5s ease-in-out infinite; }
      .animate-pulse-hex { animation: pulse-hex 4s ease-in-out infinite; }
      .animate-flow { stroke-dasharray: 4; animation: data-flow 2s linear infinite; }
      .text-kro { font-family: 'Black Ops One', sans-serif; }
    `}</style>
    
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_0_25px_rgba(34,211,238,0.6)] transform transition-transform group-hover:rotate-y-12">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <pattern id="hexPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M5 0 L10 2.5 L10 7.5 L5 10 L0 7.5 L0 2.5 Z" fill="none" stroke="#22d3ee" strokeWidth="0.2" opacity="0.3" />
        </pattern>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Hexagonal Digital Background Grid */}
      <circle cx="60" cy="60" r="50" fill="url(#hexPattern)" className="animate-pulse-hex" />
      
      {/* Optimized Tech-Diamond Frame */}
      <rect x="22" y="22" width="76" height="76" rx="14" transform="rotate(45 60 60)" fill="#0f172a" stroke="url(#logoGrad)" strokeWidth="3" />
      
      {/* Digital Circuit Connectors with Flowing Data */}
      <g stroke="#22d3ee" strokeWidth="1" fill="none" opacity="0.6" className="animate-flow">
          <path d="M60 22 V5" />
          <path d="M60 98 V115" />
          <path d="M22 60 H5" />
          <path d="M98 60 H115" />
      </g>
      
      {/* 4KRO Digital Integrated Symbol */}
      <g filter="url(#neonGlow)" transform="translate(4, 0)">
        {/* Futuristic '4' */}
        <path d="M32 42 V62 H48 M45 42 V72" fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Integrated 'KRO' using paths for precision */}
        <g transform="translate(52, 45)" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round">
            {/* K */}
            <path d="M2 0 V15 M2 7.5 L10 0 M2 7.5 L10 15" strokeWidth="4.5" />
            {/* R */}
            <path d="M16 0 V15 M16 0 H23 Q26 0 26 4 Q26 8 23 8 H16 M20 8 L26 15" strokeWidth="4.5" />
            {/* O */}
            <circle cx="38" cy="7.5" r="7.5" stroke="#22d3ee" strokeWidth="5" />
        </g>
      </g>

      {/* Decorative Nodes */}
      <circle cx="60" cy="18" r="2" fill="#22d3ee" className="animate-pulse" />
      <circle cx="60" cy="102" r="2" fill="#22d3ee" className="animate-pulse" />
      <circle cx="18" cy="60" r="2" fill="#22d3ee" className="animate-pulse" />
      <circle cx="102" cy="60" r="2" fill="#22d3ee" className="animate-pulse" />

      {/* Scanner Beam */}
      <rect x="28" y="32" width="64" height="2" fill="rgba(34,211,238,0.7)" className="animate-scan" />
    </svg>
  </div>
);

const RobotMascot = () => (
  <div className="relative w-16 h-16 mb-[-10px] z-50 animate-float opacity-90">
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
      <ellipse cx="100" cy="185" rx="45" ry="8" fill="black" opacity="0.15" />
      <rect x="60" y="80" width="80" height="70" rx="18" fill="#1e1b4b" />
      <rect x="70" y="90" width="60" height="50" rx="12" fill="#4338ca" />
      <rect x="55" y="25" width="90" height="70" rx="30" fill="#1e1b4b" />
      <rect x="65" y="35" width="70" height="50" rx="20" fill="#020617" />
      <circle cx="85" cy="60" r="7" fill="#22d3ee" className="animate-pulse" />
      <circle cx="115" cy="60" r="7" fill="#22d3ee" className="animate-pulse" />
      <circle cx="100" cy="10" r="6" fill="#f43f5e" className="animate-bounce" />
    </svg>
  </div>
);

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
        if (login(username, password)) {
        } else {
          setError('Akses ditolak. Cek Username/Password.');
        }
        setIsLoading(false);
    }, 800);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-end items-center p-4 font-sans relative overflow-hidden">
      
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .text-glow { text-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .e-absence-glow { text-shadow: 0 0 10px rgba(34, 211, 238, 0.8); }
      `}</style>

      <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.4)] w-full max-w-sm border border-white/10 animate-fade-in relative overflow-hidden flex flex-col z-10 mb-6 sm:mb-12">
        
        <div className="bg-gradient-to-b from-indigo-950/40 to-transparent pt-14 pb-10 px-6 text-center relative overflow-hidden flex flex-col items-center justify-end min-h-[420px]">
            
            <CreativeLogo />
            <RobotMascot />

            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                 <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 bg-cyan-400/10 px-6 py-2 rounded-full border border-cyan-400/20 backdrop-blur-sm uppercase">
                    SYSTEM ENCRYPTION ACTIVE
                 </span>
            </div>

            <div className="relative z-20 flex flex-col items-center mt-6">
                <h1 className="text-4xl font-black tracking-[0.1em] leading-none text-white font-['Black_Ops_One'] mb-1 text-glow">
                  HADIRKU<span className="text-cyan-400">4KRO</span>
                </h1>
                {/* E-ABSENCE sub-header updated for clearer visibility */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-[2px] w-6 bg-gradient-to-r from-transparent to-cyan-400"></div>
                    <span className="text-sm font-black tracking-[0.5em] text-cyan-400 uppercase italic e-absence-glow">
                        E-ABSENCE
                    </span>
                    <div className="h-[2px] w-6 bg-gradient-to-l from-transparent to-cyan-400"></div>
                </div>

                <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-3 opacity-40"></div>
                <h3 className="text-lg font-bold tracking-[0.2em] text-white/80 uppercase">
                  SDN 4 Kronggen
                </h3>
                <p className="text-[10px] font-black tracking-[0.25em] text-cyan-400/50 uppercase mt-1 italic">
                  TOWARDS LITERATE SCHOOL
                </p>
            </div>
        </div>

        <div className="p-10 pt-4 pb-12">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-white/5 rounded-2xl focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 bg-white/5 backdrop-blur-md transition-all text-sm font-bold text-white placeholder-white/20"
                        placeholder="USERNAME"
                    />
                </div>
            </div>

            <div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-white/5 rounded-2xl focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 bg-white/5 backdrop-blur-md transition-all text-sm font-bold text-white placeholder-white/20"
                        placeholder="SECURITY KEY"
                    />
                </div>
            </div>
            
            {error && <div className="text-rose-400 text-[10px] bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 font-bold text-center">{error}</div>}

            <div className="space-y-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 rounded-2xl shadow-2xl shadow-cyan-950/20 text-xs font-black tracking-[0.4em] text-black bg-cyan-400 hover:bg-white transition-all duration-300 transform active:scale-[0.96]"
                >
                    {isLoading ? 'VERIFYING...' : 'AUTHORIZE LOGIN'}
                </button>

                {/* Updated Credible Branding Section with larger text */}
                <div className="text-center space-y-1.5 animate-fade-in">
                    <h4 className="text-[14px] font-black tracking-[0.5em] text-cyan-400 uppercase text-glow">
                        CREDIBLE
                    </h4>
                    <p className="text-[10px] font-bold tracking-[0.08em] text-white/40 uppercase max-w-[240px] mx-auto leading-relaxed">
                        Creative, Discipline, and Noble Character
                    </p>
                </div>
            </div>
            </form>
        </div>

        <div className="bg-black/30 p-6 text-center border-t border-white/5">
            <p className="text-[9px] font-black text-white/20 tracking-[0.5em] uppercase mb-2">
                Digital Portal • SDN 4 Kronggen
            </p>
            <div className="flex items-center justify-center gap-2">
                <div className="h-px w-4 bg-white/5"></div>
                <div className="flex items-center gap-1.5">
                    {/* Copyright Logo / Symbol Replacement */}
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-white/30" fill="currentColor">
                        <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm0,18c-4.41,0-8-3.59-8-8s3.59-8,8-8,8,3.59,8,8-3.59,8-8,8Zm0-13c-2.76,0-5,2.24-5,5s2.24,5,5,5c1.65,0,3.11-.8,4-2.04l-1.34-1c-.53.77-1.42,1.26-2.43,1.26-1.53,0-2.77-1.24-2.77-2.77s1.24-2.77,2.77-2.77c1.01,0,1.9.49,2.43,1.26l1.34-1C15.11,7.8,13.65,7,12,7Z" />
                    </svg>
                    <p className="text-[8px] font-bold text-white/10 tracking-[0.2em] uppercase">
                        {currentYear} SDN 4 KRONGGEN
                    </p>
                </div>
                <div className="h-px w-4 bg-white/5"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
