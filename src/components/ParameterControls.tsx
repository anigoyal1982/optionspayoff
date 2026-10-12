import React from 'react';
import { Sliders, DollarSign, Percent, Layers } from 'lucide-react';

interface ParameterControlsProps {
  currentPrice: number;
  strikePrice: number;
  premium: number;
  priceRangePct: number;
  contractSize: number;
  isContractView: boolean;
  onCurrentPriceChange: (val: number) => void;
  onStrikePriceChange: (val: number) => void;
  onPremiumChange: (val: number) => void;
  onPriceRangePctChange: (val: number) => void;
  onContractSizeChange: (val: number) => void;
  onToggleContractView: (val: boolean) => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  currentPrice,
  strikePrice,
  premium,
  priceRangePct,
  contractSize,
  isContractView,
  onCurrentPriceChange,
  onStrikePriceChange,
  onPremiumChange,
  onPriceRangePctChange,
  onContractSizeChange,
  onToggleContractView,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs" id="simulator">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Strategy Parameters</h3>
        </div>

        {/* View Mode Toggle: Per Contract vs Per Share */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => onToggleContractView(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              isContractView
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            100-Share Contract
          </button>
          <button
            type="button"
            onClick={() => onToggleContractView(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              !isContractView
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Per Share ($1)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Current Stock Price (S_0) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="s0-input" className="font-semibold text-slate-700">
              Current Stock Price (S₀)
            </label>
            <span className="font-bold text-slate-900 tabular-nums">
              ${currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-medium">
              $
            </span>
            <input
              id="s0-input"
              type="number"
              min="1"
              max="2000"
              step="0.5"
              value={currentPrice}
              onChange={(e) => onCurrentPriceChange(Math.max(0.1, Number(e.target.value) || 0.1))}
              className="w-full pl-6 pr-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
            />
          </div>

          <input
            type="range"
            min={Math.max(5, currentPrice * 0.5)}
            max={currentPrice * 1.5}
            step="0.5"
            value={currentPrice}
            onChange={(e) => onCurrentPriceChange(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* 2. Strike Price (K) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="k-input" className="font-semibold text-slate-700">
              Call Strike Price (K)
            </label>
            <span className="font-bold text-amber-600 tabular-nums">
              ${strikePrice.toFixed(2)}{' '}
              <span className="text-[11px] font-normal text-slate-500">
                ({strikePrice >= currentPrice ? `+${((strikePrice / currentPrice - 1) * 100).toFixed(1)}% OTM` : `${((1 - strikePrice / currentPrice) * 100).toFixed(1)}% ITM`})
              </span>
            </span>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-medium">
              $
            </span>
            <input
              id="k-input"
              type="number"
              min="1"
              max="2500"
              step="0.5"
              value={strikePrice}
              onChange={(e) => onStrikePriceChange(Math.max(0.1, Number(e.target.value) || 0.1))}
              className="w-full pl-6 pr-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
            />
          </div>

          <input
            type="range"
            min={Math.max(5, currentPrice * 0.7)}
            max={currentPrice * 1.3}
            step="0.5"
            value={strikePrice}
            onChange={(e) => onStrikePriceChange(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* 3. Call Option Premium (C) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="c-input" className="font-semibold text-slate-700">
              Call Premium Received (C)
            </label>
            <span className="font-bold text-emerald-600 tabular-nums">
              ${premium.toFixed(2)}{' '}
              <span className="text-[11px] font-normal text-slate-500">
                ({currentPrice > 0 ? ((premium / currentPrice) * 100).toFixed(1) : 0}% yield)
              </span>
            </span>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-medium">
              $
            </span>
            <input
              id="c-input"
              type="number"
              min="0"
              max="500"
              step="0.1"
              value={premium}
              onChange={(e) => onPremiumChange(Math.max(0, Number(e.target.value) || 0))}
              className="w-full pl-6 pr-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
            />
          </div>

          <input
            type="range"
            min="0.1"
            max={Math.max(10, currentPrice * 0.15)}
            step="0.1"
            value={premium}
            onChange={(e) => onPremiumChange(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Secondary Controls: Chart Price Range & Number of Contracts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-600 font-medium">Chart Price Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="15"
              max="50"
              step="5"
              value={priceRangePct}
              onChange={(e) => onPriceRangePctChange(Number(e.target.value))}
              className="w-28 accent-indigo-600 cursor-pointer"
            />
            <span className="font-semibold text-slate-900 tabular-nums">
              ±{priceRangePct}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-600 font-medium">Contracts:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onContractSizeChange(num * 100)}
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  contractSize === num * 100
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {num}x ({num * 100} sh)
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
