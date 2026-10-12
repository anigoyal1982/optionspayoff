/**
 * Mathematical calculations for Options Payoff Strategies.
 * Exact Covered Call formulas:
 *   P&L_stock = S_T - S_0
 *   P&L_call  = C - max(0, S_T - K)
 *   P&L_total = P&L_stock + P&L_call
 *   Max Profit = (K - S_0) + C
 *   Max Loss   = S_0 - C (at S_T = 0)
 *   Breakeven  = S_0 - C
 */

import { KeyMetrics, PayoffPoint, StrategyCalculationResult } from '../types/options';

export function calculateCoveredCall(
  s0: number,
  k: number,
  c: number,
  contractSize = 100,
  rangePct = 25,
  numPoints = 60
): StrategyCalculationResult {
  // Key Metrics
  const maxProfitPerShare = (k - s0) + c;
  const maxProfitTotal = maxProfitPerShare * contractSize;

  const maxLossPerShare = s0 - c;
  const maxLossTotal = maxLossPerShare * contractSize;

  const breakevenPrice = s0 - c;
  const netDebitPerShare = s0 - c;

  const maxRoiPct = netDebitPerShare > 0 ? (maxProfitPerShare / netDebitPerShare) * 100 : 0;
  const downsideCushionPct = s0 > 0 ? (c / s0) * 100 : 0;

  const metrics: KeyMetrics = {
    max_profit_per_share: Number(maxProfitPerShare.toFixed(4)),
    max_profit_total: Number(maxProfitTotal.toFixed(2)),
    max_loss_per_share: Number(maxLossPerShare.toFixed(4)),
    max_loss_total: Number(maxLossTotal.toFixed(2)),
    breakeven_price: Number(breakevenPrice.toFixed(4)),
    max_roi_pct: Number(maxRoiPct.toFixed(2)),
    downside_cushion_pct: Number(downsideCushionPct.toFixed(2)),
    assignment_threshold: k,
    net_debit_per_share: Number(netDebitPerShare.toFixed(4)),
  };

  // Generate price range around S_0
  const rangeFraction = rangePct / 100;
  const minP = Math.max(0, s0 * (1 - rangeFraction));
  const maxP = s0 * (1 + rangeFraction);

  // Guarantee that landmark points are precisely included in the curve
  const landmarks = [minP, breakevenPrice, s0, k, maxP].filter((p) => p >= 0);
  const step = (maxP - minP) / (numPoints - 1);
  const regularGrid: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    regularGrid.push(minP + i * step);
  }

  const uniquePrices = Array.from(
    new Set([...regularGrid, ...landmarks].map((p) => Number(p.toFixed(2))))
  ).sort((a, b) => a - b);

  const points: PayoffPoint[] = uniquePrices.map((st) => {
    // 1. Stock P&L at expiration: S_T - S_0
    const stockPnlShare = st - s0;
    // 2. Call Option P&L at expiration: C - max(0, S_T - K)
    const callPnlShare = c - Math.max(0, st - k);
    // 3. Combined Strategy P&L: P&L_stock + P&L_call
    const totalPnlShare = stockPnlShare + callPnlShare;

    return {
      stock_price: Number(st.toFixed(2)),
      stock_pnl: Number((stockPnlShare * contractSize).toFixed(2)),
      option_pnl: Number((callPnlShare * contractSize).toFixed(2)),
      total_pnl: Number((totalPnlShare * contractSize).toFixed(2)),
      total_pnl_per_share: Number(totalPnlShare.toFixed(2)),
      is_profit: totalPnlShare >= 0,
    };
  });

  const summaryText =
    `Selling the $${k.toFixed(2)} strike call for $${c.toFixed(2)} premium yields a maximum return of ` +
    `$${maxProfitTotal.toFixed(2)} (${maxRoiPct.toFixed(1)}% ROI) if the stock expires at or above $${k.toFixed(2)}. ` +
    `The premium provides $${c.toFixed(2)} per share in downside cushion, setting your breakeven at $${breakevenPrice.toFixed(2)}.`;

  return {
    strategy_id: 'covered_call',
    strategy_name: 'Covered Call',
    current_price: s0,
    strike_price: k,
    premium: c,
    contract_size: contractSize,
    metrics,
    points,
    summary_text: summaryText,
    formula_breakdown: {
      'Stock P&L at Expiry': 'P&L_stock = S_T - S_0',
      'Call Option P&L at Expiry': 'P&L_call = C - max(0, S_T - K)',
      'Total Strategy P&L': 'P&L_total = (S_T - S_0) + C - max(0, S_T - K)',
      'Max Profit': '(K - S_0) + C',
      'Max Loss': 'S_0 - C (occurs when S_T = 0)',
      'Breakeven Price': 'S_0 - C',
    },
  };
}

/**
 * Calculates instantaneous point payoff at arbitrary simulated stock price S_T.
 */
export function evaluatePointPayoff(
  s0: number,
  k: number,
  c: number,
  st: number,
  contractSize = 100
) {
  const stockPnlShare = st - s0;
  const callPnlShare = c - Math.max(0, st - k);
  const totalPnlShare = stockPnlShare + callPnlShare;

  const isAssigned = st >= k;
  const isLoss = st < s0 - c;
  const isMaxProfit = st >= k;

  let outcomeCategory: 'max_profit' | 'partial_profit' | 'breakeven' | 'loss' = 'partial_profit';
  if (st >= k) {
    outcomeCategory = 'max_profit';
  } else if (Math.abs(st - (s0 - c)) < 0.01) {
    outcomeCategory = 'breakeven';
  } else if (st < s0 - c) {
    outcomeCategory = 'loss';
  }

  return {
    st,
    stockPnlShare: Number(stockPnlShare.toFixed(2)),
    callPnlShare: Number(callPnlShare.toFixed(2)),
    totalPnlShare: Number(totalPnlShare.toFixed(2)),
    stockPnlTotal: Number((stockPnlShare * contractSize).toFixed(2)),
    callPnlTotal: Number((callPnlShare * contractSize).toFixed(2)),
    totalPnlTotal: Number((totalPnlShare * contractSize).toFixed(2)),
    isAssigned,
    isMaxProfit,
    isLoss,
    outcomeCategory,
  };
}
