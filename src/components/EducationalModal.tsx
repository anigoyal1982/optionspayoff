import React from 'react';
import { X, BookOpen, Check, HelpCircle, Sigma } from 'lucide-react';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  strikePrice: number;
  premium: number;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  isOpen,
  onClose,
  currentPrice,
  strikePrice,
  premium,
}) => {
  if (!isOpen) return null;

  const maxProfitShare = (strikePrice - currentPrice) + premium;
  const maxLossShare = currentPrice - premium;
  const breakevenShare = currentPrice - premium;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sigma className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Covered Call Mathematical Architecture</h3>
              <p className="text-xs text-slate-500">Core formulas, variables, and expiration mechanics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* 1. Mathematical Definitions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              1. Mathematical Variables
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div><span className="font-bold text-indigo-700">S₀</span> : Initial / Current Stock Price</div>
              <div><span className="font-bold text-indigo-700">S_T</span> : Stock Price at Expiration</div>
              <div><span className="font-bold text-amber-600">K</span> : Strike Price of Sold Call</div>
              <div><span className="font-bold text-emerald-600">C</span> : Option Premium Received</div>
            </div>
          </div>

          {/* 2. Leg Payoff Formulas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              2. Core Expiration Formulas
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Stock Leg P&L (per share):</span>
                  <span className="font-mono text-indigo-600">P&L_stock = S_T - S₀</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard linear stock payoff. Profits if S_T &gt; S₀; loses if S_T &lt; S₀.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Call Option Leg P&L (per share):</span>
                  <span className="font-mono text-amber-600">P&L_call = C - max(0, S_T - K)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You collect premium C up front. If S_T exceeds strike K, you must fulfill the call at K, losing (S_T - K).
                </p>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                  <span>Total Strategy P&L:</span>
                  <span className="font-mono text-indigo-700">P&L_total = (S_T - S₀) + C - max(0, S_T - K)</span>
                </div>
                <p className="text-[11px] text-indigo-800/80 mt-1">
                  The summation of stock payoff and option obligation.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Key Metrics Formulas with Active Values */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              3. Key Boundary Metrics (Live Evaluated)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 border border-emerald-200 bg-emerald-50/40 rounded-lg">
                <div className="text-[11px] font-semibold text-emerald-800">Max Profit Formula</div>
                <div className="font-mono text-xs font-bold text-emerald-700 mt-0.5">(K - S₀) + C</div>
                <div className="text-xs font-bold text-slate-900 mt-2 tabular-nums">
                  = (${strikePrice.toFixed(2)} - ${currentPrice.toFixed(2)}) + ${premium.toFixed(2)}
                </div>
                <div className="text-xs font-semibold text-emerald-600 mt-0.5 tabular-nums">
                  = ${maxProfitShare.toFixed(2)} / share (${(maxProfitShare * 100).toFixed(2)} / contract)
                </div>
              </div>

              <div className="p-3 border border-rose-200 bg-rose-50/40 rounded-lg">
                <div className="text-[11px] font-semibold text-rose-800">Max Loss Formula</div>
                <div className="font-mono text-xs font-bold text-rose-700 mt-0.5">S₀ - C</div>
                <div className="text-xs font-bold text-slate-900 mt-2 tabular-nums">
                  = ${currentPrice.toFixed(2)} - ${premium.toFixed(2)}
                </div>
                <div className="text-xs font-semibold text-rose-600 mt-0.5 tabular-nums">
                  = ${maxLossShare.toFixed(2)} / share (${(maxLossShare * 100).toFixed(2)} / contract)
                </div>
              </div>

              <div className="p-3 border border-indigo-200 bg-indigo-50/40 rounded-lg">
                <div className="text-[11px] font-semibold text-indigo-800">Breakeven Formula</div>
                <div className="font-mono text-xs font-bold text-indigo-700 mt-0.5">S₀ - C</div>
                <div className="text-xs font-bold text-slate-900 mt-2 tabular-nums">
                  = ${currentPrice.toFixed(2)} - ${premium.toFixed(2)}
                </div>
                <div className="text-xs font-semibold text-indigo-600 mt-0.5 tabular-nums">
                  = ${breakevenShare.toFixed(2)} threshold
                </div>
              </div>
            </div>
          </div>

          {/* 4. Strategic Objectives */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Why Investors Use Covered Calls
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>
                <strong>Income Generation:</strong> Earn predictable yield on long stock holdings in flat or gently rising markets.
              </li>
              <li>
                <strong>Downside Cushion:</strong> Premium collected reduces cost basis, providing a buffer against minor price drops.
              </li>
              <li>
                <strong>Disciplined Exit:</strong> Lock in an attractive selling target at Strike K while earning cash to wait.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
