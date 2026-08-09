import React from 'react';

interface SilaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const SilaLogo: React.FC<SilaLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-base font-bold tracking-widest',
    md: 'text-xl font-extrabold tracking-widest',
    lg: 'text-2xl font-extrabold tracking-widest'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Hexagonal SILA icon with gold/teal geometric lines */}
      <div className={`relative flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 via-teal-500/20 to-neutral-900 border border-amber-500/30 shadow-sm ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className="w-full h-full p-1.5 text-amber-400 drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 4L30 11V25L18 32L6 25V11L18 4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12 14.5C12 13.1 14.5 12 18 12C21.5 12 24 13.1 24 14.5C24 16.5 12 17.5 12 19.5C12 21.5 14.5 22.5 18 22.5C21.5 22.5 24 21.4 24 20"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`${textSizes[size]} text-white font-mono uppercase tracking-[0.22em] drop-shadow-sm leading-none`}>
          SILA
        </span>
        {showSubtitle && (
          <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-400 font-medium leading-none mt-1">
            Digital Identity
          </span>
        )}
      </div>
    </div>
  );
};
