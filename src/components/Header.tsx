import React from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onResetDefaults: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onResetDefaults }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a href="/" className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            Ω
          </span>
          <span>OptiLearn</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#simulator" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Simulator
          </a>
          <a href="#payoff-chart" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Payoff Chart
          </a>
          <a href="#strategy-guide" onClick={(e) => { e.preventDefault(); onOpenGuide(); }} className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Formulas
          </a>
          <a href="#scenarios" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Scenarios
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onResetDefaults}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Reset parameters to AAPL standard"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Strategy Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
