import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Area,
} from 'recharts';
import { PayoffPoint, KeyMetrics } from '../types/options';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface PayoffChartProps {
  points: PayoffPoint[];
  metrics: KeyMetrics;
  currentPrice: number;
  strikePrice: number;
  premium: number;
  isContractView: boolean;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  points,
  metrics,
  currentPrice,
  strikePrice,
  premium,
  isContractView,
}) => {
  const [showStockLeg, setShowStockLeg] = useState(true);
  const [showOptionLeg, setShowOptionLeg] = useState(true);

  // Transform points based on contract view vs per-share view
  const chartData = points.map((p) => ({
    stock_price: p.stock_price,
    total_pnl: isContractView ? p.total_pnl : p.total_pnl_per_share,
    stock_pnl: isContractView ? p.stock_pnl : p.stock_pnl / 100,
    option_pnl: isContractView ? p.option_pnl : p.option_pnl / 100,
    is_profit: p.is_profit,
  }));

  // Min and max for domain
  const pnlValues = chartData.map((d) => d.total_pnl);
  const minPnl = Math.min(...pnlValues, 0);
  const maxPnl = Math.max(...pnlValues, 0);
  const paddingPnl = (maxPnl - minPnl) * 0.15 || 50;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs" id="payoff-chart">
      {/* Top Header of Chart */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Expiration Payoff Curve</span>
            <span className="text-xs font-normal text-slate-500">
              ({isContractView ? 'Total 100-Share Contract' : 'Per Share'})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive visual simulation of Strategy P&L vs Underlying Stock Price at Expiration (S_T)
          </p>
        </div>

        {/* Legend / Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700">
            <span className="w-2.5 h-0.5 bg-indigo-600 rounded"></span>
            <span>Total Covered Call</span>
          </div>

          <button
            type="button"
            onClick={() => setShowStockLeg(!showStockLeg)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              showStockLeg
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                : 'bg-slate-50 text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-slate-400 border-dashed rounded"></span>
            <span>Stock Leg</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOptionLeg(!showOptionLeg)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              showOptionLeg
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-amber-500 border-dashed rounded"></span>
            <span>Call Leg</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[380px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="stock_price"
              tickFormatter={(val) => `$${val}`}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              label={{
                value: 'Stock Price at Expiration ($S_T)',
                position: 'insideBottom',
                offset: -15,
                fill: '#475569',
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            <YAxis
              tickFormatter={(val) => (val >= 0 ? `+$${val}` : `-$${Math.abs(val)}`)}
              domain={[Math.floor(minPnl - paddingPnl), Math.ceil(maxPnl + paddingPnl)]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              label={{
                value: `Profit / Loss (${isContractView ? '$ Total' : '$ / Share'})`,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#475569',
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            {/* Zero P&L Reference Line */}
            <ReferenceLine
              y={0}
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: '$0 Breakeven Line',
                position: 'right',
                fill: '#64748b',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Current Price Marker */}
            <ReferenceLine
              x={currentPrice}
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: `S₀: $${currentPrice.toFixed(2)}`,
                position: 'top',
                fill: '#2563eb',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Strike Price Marker */}
            <ReferenceLine
              x={strikePrice}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: `Strike (K): $${strikePrice.toFixed(2)}`,
                position: 'top',
                fill: '#d97706',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Breakeven Price Marker */}
            <ReferenceLine
              x={metrics.breakeven_price}
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              label={{
                value: `BE: $${metrics.breakeven_price.toFixed(2)}`,
                position: 'bottom',
                fill: '#059669',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Stock Leg Line */}
            {showStockLeg && (
              <Line
                type="monotone"
                dataKey="stock_pnl"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="Stock Leg (Long 100)"
                isAnimationActive={false}
              />
            )}

            {/* Call Leg Line */}
            {showOptionLeg && (
              <Line
                type="monotone"
                dataKey="option_pnl"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Call Leg (Short 1 Call)"
                isAnimationActive={false}
              />
            )}

            {/* Total Covered Call Payoff Line */}
            <Line
              type="monotone"
              dataKey="total_pnl"
              stroke="#4f46e5"
              strokeWidth={2.8}
              dot={false}
              name="Covered Call Payoff"
              isAnimationActive={false}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const st = d.stock_price;
                const total = d.total_pnl;
                const isAssigned = st >= strikePrice;
                const isProfit = total >= 0;

                return (
                  <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-800 text-xs min-w-[210px]">
                    <div className="font-semibold text-slate-300 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                      <span>Expiration Price (S_T):</span>
                      <span className="font-bold text-white tabular-nums">${st.toFixed(2)}</span>
                    </div>

                    <div className="py-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Strategy P&L:</span>
                        <span
                          className={`font-bold tabular-nums ${
                            isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {total >= 0 ? '+' : ''}${total.toFixed(2)}
                        </span>
                      </div>

                      {showStockLeg && (
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Stock P&L (S_T - S₀):</span>
                          <span className="tabular-nums text-slate-300">
                            {d.stock_pnl >= 0 ? '+' : ''}${d.stock_pnl.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {showOptionLeg && (
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Call P&L (C - max(0,S-K)):</span>
                          <span className="tabular-nums text-slate-300">
                            {d.option_pnl >= 0 ? '+' : ''}${d.option_pnl.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Assignment:</span>
                      <span
                        className={
                          isAssigned
                            ? 'text-amber-300 font-semibold'
                            : 'text-slate-300'
                        }
                      >
                        {isAssigned ? 'Yes (Called away @ K)' : 'No (Option expired)'}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Educational Annotation Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Current Price: ${currentPrice.toFixed(2)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Strike Price: ${strikePrice.toFixed(2)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Breakeven: ${metrics.breakeven_price.toFixed(2)}</span>
          </span>
        </div>
        <div className="text-slate-500 italic">
          Max profit is capped at ${(strikePrice - currentPrice + premium).toFixed(2)}/share above strike.
        </div>
      </div>
    </div>
  );
};
