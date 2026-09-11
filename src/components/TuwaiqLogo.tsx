import React from 'react';

interface TuwaiqLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const TuwaiqLogo: React.FC<TuwaiqLogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-xs' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-base' },
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Tuwaiq Mountains & Tech Geometric Icon */}
      <div className={`relative ${sizeMap[size].icon} rounded-xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-900 p-1.5 shadow-lg shadow-purple-950/60 ring-1 ring-purple-400/30 flex items-center justify-center overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/0 to-pink-500/30 opacity-80" />
        
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow"
        >
          {/* Tuwaiq Peak Geometric Path */}
          <path
            d="M8 38L24 10L40 38H8Z"
            fill="url(#tuwaiqGrad1)"
            opacity="0.9"
          />
          <path
            d="M16 38L24 22L32 38H16Z"
            fill="url(#tuwaiqGrad2)"
          />
          <circle cx="24" cy="9" r="3" fill="#06b6d4" />
          <circle cx="12" cy="30" r="2" fill="#10b981" />
          <circle cx="36" cy="30" r="2" fill="#ec4899" />
          
          <defs>
            <linearGradient id="tuwaiqGrad1" x1="8" y1="10" x2="40" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="0.6" stopColor="#6366f1" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="tuwaiqGrad2" x1="16" y1="22" x2="32" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-white ${sizeMap[size].text}`}>
              Tuwaiq <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent">TeamMatch</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Al-Baha Uni
            </span>
          </div>
          <span className={`text-slate-400 font-medium ${sizeMap[size].sub} flex items-center gap-1`}>
            <span>مسار ريادة الأعمال والتقنية</span>
            <span className="text-purple-400">•</span>
            <span className="text-slate-500">نادي طويق</span>
          </span>
        </div>
      )}
    </div>
  );
};
