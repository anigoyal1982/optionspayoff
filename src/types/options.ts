/**
 * Type definitions for Options Payoff Engine and Market Quotes.
 */

export interface MarketQuote {
  ticker: string;
  price: number;
  change: number;
  change_percent: number;
  currency: string;
  company_name: string;
  suggested_strike: number;
  suggested_premium: number;
  timestamp: string;
}

export interface PayoffPoint {
  stock_price: number;
  stock_pnl: number;
  option_pnl: number;
  total_pnl: number;
  total_pnl_per_share: number;
  is_profit: boolean;
}

export interface KeyMetrics {
  max_profit_per_share: number;
  max_profit_total: number;
  max_loss_per_share: number;
  max_loss_total: number;
  breakeven_price: number;
  max_roi_pct: number;
  downside_cushion_pct: number;
  assignment_threshold: number;
  net_debit_per_share: number;
}

export interface StrategyCalculationResult {
  strategy_id: string;
  strategy_name: string;
  current_price: number;
  strike_price: number;
  premium: number;
  contract_size: number;
  metrics: KeyMetrics;
  points: PayoffPoint[];
  summary_text: string;
  formula_breakdown: Record<string, string>;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  category: string;
  sentiment: string;
  description: string;
  legs: string[];
  formula: Record<string, string>;
  isAvailable: boolean;
}
