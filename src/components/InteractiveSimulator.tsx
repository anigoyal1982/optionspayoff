import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { evaluatePointPayoff } from '../utils/optionsMath';

interface InteractiveSimulatorProps {
  currentPrice: number;
  strikePrice: number;
  premium: number;
  contractSize: number;
  isContractView: boolean;
}

export const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({
  currentPrice,
  strikePrice,
  premium,
  contractSize,
  isContractView,
}) => {
  // Simulated stock price at expiration S_T (default to strikePrice)
  const [simulatedPrice, setSimulatedPrice] = useState<number>(strikePrice);

  const result = evaluatePointPayoff(
    currentPrice,
    strikePrice,
    premium,
    simulatedPrice,
    contractSize
  );

  const displayStockPnl = isContractView ? result.stockPnlTotal : result.stockPnlShare;
  const displayCallPnl = isContractView ? result.callPnlTotal : result.callPnlShare;
  const displayTotalPnl = isContractView ? result.totalPnlTotal : result.totalPnlShare;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs" id="scenarios">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Expiration Scenario Simulator</span>
            <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Step-by-Step Math
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Slide the expiration stock price ($S_T$) to observe how each leg behaves at settlement.
          </p>
        </div>

        {/* Quick Scenario Jumps */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSimulatedPrice(Number((currentPrice * 0.9).toFixed(2)))}
            className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            -10% Drop
          </button>
          <button
            type="button"
            onClick={() => setSimulatedPrice(Number((currentPrice - premium).toFixed(2)))}
            className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Breakeven (${(currentPrice - premium).toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => setSimulatedPrice(strikePrice)}
            className="px-2 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
          >
            At Strike (${strikePrice.toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => setSimulatedPrice(Number((currentPrice * 1.15).toFixed(2)))}
            className="px-2 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            +15% Rally
          </button>
        </div>
      </div>

      {/* Main Scrubber */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 mb-5">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-semibold text-slate-700">
            Simulated Expiration Stock Price (S_T):
          </span>
          <span className="text-base font-bold text-indigo-700 tabular-nums">
            ${simulatedPrice.toFixed(2)}
          </span>
        </div>

        <input
          type="range"
          min={Math.max(1, currentPrice * 0.6)}
          max={currentPrice * 1.4}
          step="0.5"
          value={simulatedPrice}
          onChange={(e) => setSimulatedPrice(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
          <span>Bearish Crash (${(currentPrice * 0.6).toFixed(2)})</span>
          <span className="font-medium text-slate-700">Initial S₀: ${currentPrice.toFixed(2)}</span>
          <span>Bullish Surge (${(currentPrice * 1.4).toFixed(2)})</span>
        </div>
      </div>

      {/* 3-Column Mathematical Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leg 1: Stock P&L */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
          <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
            <span>Leg 1: Stock P&L</span>
            <span className="text-[11px] text-slate-400">S_T - S₀</span>
          </div>
          <div
            className={`text-xl font-bold mt-2 tabular-nums ${
              displayStockPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {displayStockPnl >= 0 ? '+' : ''}${displayStockPnl.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {simulatedPrice >= currentPrice
              ? `Stock gained $${(simulatedPrice - currentPrice).toFixed(2)}/sh`
              : `Stock dropped $${(currentPrice - simulatedPrice).toFixed(2)}/sh`}
          </p>
        </div>

        {/* Leg 2: Call Option P&L */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
          <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
            <span>Leg 2: Short Call P&L</span>
            <span className="text-[11px] text-slate-400">C - max(0, S_T - K)</span>
          </div>
          <div
            className={`text-xl font-bold mt-2 tabular-nums ${
              displayCallPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {displayCallPnl >= 0 ? '+' : ''}${displayCallPnl.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {simulatedPrice <= strikePrice
              ? `Kept 100% of the $${premium.toFixed(2)}/sh premium`
              : `Intrinsic cost: -$${(simulatedPrice - strikePrice).toFixed(2)}/sh`}
          </p>
        </div>

        {/* Total Strategy P&L */}
        <div
          className={`p-3.5 rounded-lg border ${
            displayTotalPnl >= 0
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-rose-200 bg-rose-50/50'
          }`}
        >
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Combined Total P&L</span>
            <span className="text-[11px] font-mono">P&L_stock + P&L_call</span>
          </div>
          <div
            className={`text-2xl font-bold mt-2 tabular-nums ${
              displayTotalPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {displayTotalPnl >= 0 ? '+' : ''}${displayTotalPnl.toFixed(2)}
          </div>
          <p className="text-[11px] font-medium text-slate-600 mt-1">
            {isContractView ? 'Total on 100 shares' : 'Per share basis'}
          </p>
        </div>
      </div>

      {/* Outcome Analysis Box */}
      <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
        <div className="flex items-start gap-2.5">
          {result.outcomeCategory === 'max_profit' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          {result.outcomeCategory === 'partial_profit' && (
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          )}
          {result.outcomeCategory === 'loss' && (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          {result.outcomeCategory === 'breakeven' && (
            <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          )}

          <div>
            <span className="font-bold text-slate-900 block mb-0.5">
              {result.outcomeCategory === 'max_profit' && 'Option In-The-Money (Assigned at Strike K)'}
              {result.outcomeCategory === 'partial_profit' && 'Option Out-Of-The-Money (Expired Worthless)'}
              {result.outcomeCategory === 'loss' && 'Stock Below Breakeven Price'}
              {result.outcomeCategory === 'breakeven' && 'Exact Breakeven Point'}
            </span>
            <span className="text-slate-600 leading-relaxed">
              {result.outcomeCategory === 'max_profit' &&
                `Because S_T ($${simulatedPrice.toFixed(2)}) is ≥ Strike K ($${strikePrice.toFixed(2)}), the option buyer exercises their right. Your 100 shares are called away at $${strikePrice.toFixed(2)}. You pocket the stock appreciation up to strike plus the full $${premium.toFixed(2)} call premium for max profit!`}
              {result.outcomeCategory === 'partial_profit' &&
                `Because S_T ($${simulatedPrice.toFixed(2)}) is < Strike K ($${strikePrice.toFixed(2)}), the call option expires worthless. You retain full ownership of your 100 shares and keep 100% of the $${premium.toFixed(2)} premium as pure income!`}
              {result.outcomeCategory === 'loss' &&
                `The stock fell to $${simulatedPrice.toFixed(2)}, which is below your breakeven of $${(currentPrice - premium).toFixed(2)}. Although you are experiencing a paper loss, the $${premium.toFixed(2)} call premium cushioned what would have been an even steeper drop.`}
              {result.outcomeCategory === 'breakeven' &&
                `Stock price at expiration equals S₀ - C ($${(currentPrice - premium).toFixed(2)}). Stock decline (-$${premium.toFixed(2)}) is exactly balanced by the option premium received (+$${premium.toFixed(2)}). Net P&L is $0.00.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
