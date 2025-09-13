
import React from 'react';

const CarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16.5 L17.5 16.5 C18.3284 16.5 19 15.8284 19 15 L19 12 C19 10.8954 18.1046 10 17 10 L7 10 C5.89543 10 5 10.8954 5 12 L5 15 C5 15.8284 5.67157 16.5 6.5 16.5 L9.5 16.5" />
        <path d="M17 10 L15 6 L9 6 L7 10" />
        <circle cx="7.5" cy="16.5" r="1.5" />
        <circle cx="16.5" cy="16.5" r="1.5" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-center gap-4 mb-2">
        <CarIcon />
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
          Kaar Logo Generator
        </h1>
      </div>
      <p className="text-slate-400 text-lg">
        Craft the perfect identity for your automotive brand with AI.
      </p>
    </header>
  );
};
