import React from 'react';
import { KeyMetrics } from '../types/options';
import { ArrowUpRight, ArrowDownRight, ShieldCheck, Target, Percent } from 'lucide-react';

interface StrategyMetricsCardsProps {
  metrics: KeyMetrics;
  isContractView: boolean;
  contractSize: number;
}

export const StrategyMetricsCards: React.FC<StrategyMetricsCardsProps> = ({
  metrics,
  isContractView,
  contractSize,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Max Profit Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">Max Profit</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
          +${isContractView ? metrics.max_profit_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : metrics.max_profit_per_share.toFixed(2)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-700 tabular-nums">+{metrics.max_roi_pct.toFixed(1)}% Max ROI</span>
          <span aria-hidden="true">·</span>
          <span>Formula: (K - S₀) + C</span>
        </div>
      </div>

      {/* 2. Max Loss Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">Max Loss (At $0)</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
          -${isContractView ? metrics.max_loss_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : metrics.max_loss_per_share.toFixed(2)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600">Occurs if stock drops to $0</span>
          <span aria-hidden="true">·</span>
          <span>Formula: S₀ - C</span>
        </div>
      </div>

      {/* 3. Breakeven Price Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">Breakeven Price</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          ${metrics.breakeven_price.toFixed(2)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600">0 P&L threshold</span>
          <span aria-hidden="true">·</span>
          <span>Formula: S₀ - C</span>
        </div>
      </div>

      {/* 4. Downside Protection Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">Downside Cushion</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-indigo-600 tabular-nums">
          {metrics.downside_cushion_pct.toFixed(2)}%
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600">Premium buffer</span>
          <span aria-hidden="true">·</span>
          <span>Formula: C / S₀</span>
        </div>
      </div>
    </div>
  );
};
