import React, { useState, useEffect } from 'react';

interface AnimatedScoreDialProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const AnimatedScoreDial: React.FC<AnimatedScoreDialProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 850; // ms

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [score]);

  // Dimension settings
  const config = {
    sm: { dimension: 56, strokeWidth: 4.5, fontSize: 'text-xs', subSize: 'text-[8px]' },
    md: { dimension: 84, strokeWidth: 6.5, fontSize: 'text-lg', subSize: 'text-[9px]' },
    lg: { dimension: 118, strokeWidth: 9, fontSize: 'text-2xl', subSize: 'text-[11px]' },
  }[size];

  const radius = (config.dimension - config.strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Color palette depending on score
  const getColorScheme = (val: number) => {
    if (val >= 90) {
      return {
        stroke: '#10b981', // emerald
        gradientId: 'grad-emerald',
        textColor: 'text-emerald-300',
        glow: 'rgba(16, 185, 129, 0.4)',
        tier: 'SQUAD SOULMATE',
        tierColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
    }
    if (val >= 80) {
      return {
        stroke: '#06b6d4', // cyan
        gradientId: 'grad-cyan',
        textColor: 'text-cyan-300',
        glow: 'rgba(6, 182, 212, 0.4)',
        tier: 'HIGH SYNERGY',
        tierColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      };
    }
    if (val >= 70) {
      return {
        stroke: '#ec4899', // pink/purple
        gradientId: 'grad-pink',
        textColor: 'text-pink-300',
        glow: 'rgba(236, 72, 153, 0.4)',
        tier: 'GREAT MATCH',
        tierColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      };
    }
    return {
      stroke: '#f59e0b', // amber
      gradientId: 'grad-amber',
      textColor: 'text-amber-300',
      glow: 'rgba(245, 158, 11, 0.4)',
      tier: 'GOOD FIT',
      tierColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  };

  const scheme = getColorScheme(score);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{
          width: config.dimension,
          height: config.dimension,
          filter: `drop-shadow(0 0 10px ${scheme.glow})`,
        }}
      >
        <svg
          width={config.dimension}
          height={config.dimension}
          className="-rotate-90 transform"
        >
          <defs>
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            stroke="#2e1065"
            strokeWidth={config.strokeWidth}
            fill="transparent"
            className="opacity-60"
          />

          {/* Animated Progress Ring */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            stroke={`url(#${scheme.gradientId})`}
            strokeWidth={config.strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.1s ease',
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className={`font-black ${config.fontSize} ${scheme.textColor} tracking-tight leading-none`}>
            {displayScore}%
          </span>
          {size !== 'sm' && (
            <span className={`text-slate-400 font-bold uppercase tracking-widest ${config.subSize} mt-0.5`}>
              Match
            </span>
          )}
        </div>
      </div>

      {showLabel && size !== 'sm' && (
        <span
          className={`mt-2 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border tracking-wider ${scheme.tierColor}`}
        >
          {scheme.tier}
        </span>
      )}
    </div>
  );
};
