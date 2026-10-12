import React, { useState } from 'react';
import { Search, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketQuote } from '../types/options';

interface TickerSelectorProps {
  currentTicker: string;
  quote: MarketQuote | null;
  isLoading: boolean;
  onFetchQuote: (ticker: string) => void;
}

const COMMON_TICKERS = ['AAPL', 'SPY', 'TSLA', 'QQQ', 'MSFT', 'NVDA', 'AMZN'];

export const TickerSelector: React.FC<TickerSelectorProps> = ({
  currentTicker,
  quote,
  isLoading,
  onFetchQuote,
}) => {
  const [inputTicker, setInputTicker] = useState(currentTicker);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      onFetchQuote(inputTicker.trim().toUpperCase());
    }
  };

  const handleSelectPreset = (ticker: string) => {
    setInputTicker(ticker);
    onFetchQuote(ticker);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search Form */}
        <div className="flex-1 max-w-xl">
          <label htmlFor="ticker-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Underlying Asset
          </label>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="ticker-input"
                type="text"
                value={inputTicker}
                onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
                placeholder="Enter symbol (e.g. AAPL, SPY, TSLA)"
                className="w-full pl-9 pr-3 py-2 text-sm font-semibold tracking-wide border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase transition"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputTicker.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load Quote</span>
              )}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-xs text-slate-500 mr-1">Presets:</span>
            {COMMON_TICKERS.map((t) => {
              const isActive = (quote?.ticker || currentTicker) === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectPreset(t)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Market Data Snapshot */}
        {quote && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 pt-3 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
            <div>
              <div className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                {quote.company_name}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  ${quote.price.toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center text-xs font-semibold tabular-nums ${
                    quote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {quote.change >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {quote.change >= 0 ? '+' : ''}
                  {quote.change.toFixed(2)} ({quote.change_percent >= 0 ? '+' : ''}
                  {quote.change_percent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex flex-col gap-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
              <div>
                <span>Suggested Strike:</span>{' '}
                <span className="font-semibold text-slate-800 tabular-nums">${quote.suggested_strike.toFixed(2)}</span>
              </div>
              <div>
                <span>Est. Call Premium:</span>{' '}
                <span className="font-semibold text-slate-800 tabular-nums">${quote.suggested_premium.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
