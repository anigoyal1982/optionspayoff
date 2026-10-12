/**
 * OptiLearn - Educational Options Payoff Web Application
 * Master Covered Calls with Interactive Mathematical Modeling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TickerSelector } from './components/TickerSelector';
import { StrategyMetricsCards } from './components/StrategyMetricsCards';
import { PayoffChart } from './components/PayoffChart';
import { ParameterControls } from './components/ParameterControls';
import { InteractiveSimulator } from './components/InteractiveSimulator';
import { StrategySelector } from './components/StrategySelector';
import { EducationalModal } from './components/EducationalModal';
import { MarketQuote, StrategyCalculationResult } from './types/options';
import { calculateCoveredCall } from './utils/optionsMath';
import { BookOpen, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export default function App() {
  // Strategy State
  const [selectedStrategy, setSelectedStrategy] = useState<string>('covered_call');
  const [currentTicker, setCurrentTicker] = useState<string>('AAPL');
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);

  // Strategy Core Parameters
  const [currentPrice, setCurrentPrice] = useState<number>(232.15); // S_0
  const [strikePrice, setStrikePrice] = useState<number>(240.00);   // K
  const [premium, setPremium] = useState<number>(5.50);            // C
  const [priceRangePct, setPriceRangePct] = useState<number>(25);
  const [contractSize, setContractSize] = useState<number>(100);
  const [isContractView, setIsContractView] = useState<boolean>(true);

  // Modal State
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Fetch real-time market quote from FastAPI / Express endpoint
  const fetchQuote = async (ticker: string) => {
    setIsLoadingQuote(true);
    try {
      const res = await fetch(`/api/quote/${encodeURIComponent(ticker)}`);
      if (res.ok) {
        const data: MarketQuote = await res.json();
        setQuote(data);
        setCurrentTicker(data.ticker);
        setCurrentPrice(data.price);
        setStrikePrice(data.suggested_strike);
        setPremium(data.suggested_premium);
      } else {
        console.warn('API returned non-ok status, maintaining fallback state');
      }
    } catch (err) {
      console.warn('Network error fetching quote, utilizing educational defaults:', err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchQuote('AAPL');
  }, []);

  // Compute live mathematical payoff
  const calculationResult: StrategyCalculationResult = useMemo(() => {
    return calculateCoveredCall(
      currentPrice,
      strikePrice,
      premium,
      contractSize,
      priceRangePct
    );
  }, [currentPrice, strikePrice, premium, contractSize, priceRangePct]);

  const handleResetDefaults = () => {
    setCurrentPrice(232.15);
    setStrikePrice(240.00);
    setPremium(5.50);
    setPriceRangePct(25);
    setContractSize(100);
    setIsContractView(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header (Adhering to Top Bar Contract) */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Editorial Section Kicker & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>Financial Derivatives</span>
              <span aria-hidden="true">·</span>
              <span>Income Strategies</span>
              <span aria-hidden="true">·</span>
              <span>Covered Call Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Covered Call Options Payoff Visualizer
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Simulate expiration outcomes for a Covered Call position (Long 100 Shares + Short 1 Call Option).
              Explore downside buffer, capped max profits, and breakeven economics with live quotes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-3.5 py-2 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Inspect Mathematical Proof</span>
            </button>
          </div>
        </div>

        {/* 2. Modular Strategy Framework Selector */}
        <StrategySelector
          selectedStrategy={selectedStrategy}
          onSelectStrategy={(id) => setSelectedStrategy(id)}
        />

        {/* 3. Ticker Selection & Quote Bar */}
        <TickerSelector
          currentTicker={currentTicker}
          quote={quote}
          isLoading={isLoadingQuote}
          onFetchQuote={fetchQuote}
        />

        {/* 4. Key Summary Metrics Cards */}
        <StrategyMetricsCards
          metrics={calculationResult.metrics}
          isContractView={isContractView}
          contractSize={contractSize}
        />

        {/* 5. Parameter Controls Bar */}
        <ParameterControls
          currentPrice={currentPrice}
          strikePrice={strikePrice}
          premium={premium}
          priceRangePct={priceRangePct}
          contractSize={contractSize}
          isContractView={isContractView}
          onCurrentPriceChange={setCurrentPrice}
          onStrikePriceChange={setStrikePrice}
          onPremiumChange={setPremium}
          onPriceRangePctChange={setPriceRangePct}
          onContractSizeChange={setContractSize}
          onToggleContractView={setIsContractView}
        />

        {/* 6. Payoff Visualization Chart */}
        <PayoffChart
          points={calculationResult.points}
          metrics={calculationResult.metrics}
          currentPrice={currentPrice}
          strikePrice={strikePrice}
          premium={premium}
          isContractView={isContractView}
        />

        {/* 7. Interactive Expiration Scenario Simulator */}
        <InteractiveSimulator
          currentPrice={currentPrice}
          strikePrice={strikePrice}
          premium={premium}
          contractSize={contractSize}
          isContractView={isContractView}
        />

        {/* 8. Educational Strategy Mechanics Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
            Educational Principles & Invariants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>The Upside Cap</span>
              </h3>
              <p>
                Selling the call grants the buyer the legal right to purchase your shares at Strike $K.
                Any stock appreciation beyond $K is surrendered to the option buyer. In exchange, you retain
                the upfront cash premium $C regardless of what happens.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>The Downside Cushion</span>
              </h3>
              <p>
                The premium received $C immediately reduces your effective cost basis to $S_0 - C$.
                You only begin experiencing a net loss if the underlying stock falls below this Breakeven threshold.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Downside Risk Exposure</span>
              </h3>
              <p>
                A Covered Call does NOT provide complete downside insurance. If the stock drops sharply toward zero,
                you bear the full stock decline cushioned only by the option premium received ($S_0 - C$).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            OptiLearn Options Payoff Visualizer · Built for financial education & strategy analysis
          </div>
          <div className="flex items-center gap-4">
            <span>Covered Call Model</span>
            <span aria-hidden="true">·</span>
            <span>Yahoo Finance Quotes</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI & React</span>
          </div>
        </div>
      </footer>

      {/* Educational Modal */}
      <EducationalModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentPrice={currentPrice}
        strikePrice={strikePrice}
        premium={premium}
      />
    </div>
  );
}
