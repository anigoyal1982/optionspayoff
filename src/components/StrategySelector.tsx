import React from 'react';
import { Shield, TrendingUp, SlidersHorizontal, Lock, Check } from 'lucide-react';

interface StrategySelectorProps {
  selectedStrategy: string;
  onSelectStrategy: (id: string) => void;
}

const STRATEGIES_LIST = [
  {
    id: 'covered_call',
    name: 'Covered Call',
    status: 'Active',
    sentiment: 'Neutral / Moderately Bullish',
    badgeColor: 'bg-emerald-50 text-emerald-700',
    description: 'Long Stock + Short Call. Generates income & lowers cost basis.',
    isAvailable: true,
  },
  {
    id: 'bull_call_spread',
    name: 'Bull Call Spread',
    status: 'Modular Plugin',
    sentiment: 'Moderately Bullish',
    badgeColor: 'bg-indigo-50 text-indigo-700',
    description: 'Debit spread: Buy low strike call & sell high strike call.',
    isAvailable: true,
  },
  {
    id: 'protective_put',
    name: 'Protective Put',
    status: 'Modular Plugin',
    sentiment: 'Bullish + Crash Protection',
    badgeColor: 'bg-sky-50 text-sky-700',
    description: 'Long stock + Long put. Enforces a guaranteed loss floor.',
    isAvailable: true,
  },
  {
    id: 'long_straddle',
    name: 'Long Straddle',
    status: 'Catalog Roadmap',
    sentiment: 'High Volatility / Direction Agnostic',
    badgeColor: 'bg-purple-50 text-purple-700',
    description: 'Long Call + Long Put at same strike. Profits on volatility spikes.',
    isAvailable: false,
  },
  {
    id: 'iron_condor',
    name: 'Iron Condor',
    status: 'Catalog Roadmap',
    sentiment: 'Range-Bound / Neutral',
    badgeColor: 'bg-slate-100 text-slate-700',
    description: '4-leg neutral credit strategy profiting in sideways markets.',
    isAvailable: false,
  },
];

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Modular Strategy Framework</span>
            <span className="text-[11px] font-semibold text-slate-500">
              Pluggable Architecture
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between implemented strategy modules or inspect framework extensibility
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STRATEGIES_LIST.map((strat) => {
          const isSelected = selectedStrategy === strat.id;
          return (
            <button
              key={strat.id}
              type="button"
              disabled={!strat.isAvailable}
              onClick={() => strat.isAvailable && onSelectStrategy(strat.id)}
              className={`text-left p-3.5 rounded-xl border transition relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30'
                  : strat.isAvailable
                  ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white cursor-pointer'
                  : 'border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{strat.name}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {!strat.isAvailable && (
                    <span className="w-4 h-4 text-slate-400 flex items-center justify-center shrink-0">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mb-2 ${strat.badgeColor}`}>
                  {strat.sentiment}
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {strat.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>{strat.status}</span>
                {isSelected && <span className="font-semibold text-indigo-600">Selected</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
