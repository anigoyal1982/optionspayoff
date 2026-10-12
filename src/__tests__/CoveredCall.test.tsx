import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { calculateCoveredCall, evaluatePointPayoff } from '../utils/optionsMath';
import { StrategyMetricsCards } from '../components/StrategyMetricsCards';
import { ParameterControls } from '../components/ParameterControls';
import { InteractiveSimulator } from '../components/InteractiveSimulator';

describe('Covered Call Mathematical Modeling', () => {
  it('correctly calculates max profit, max loss, and breakeven for standard position', () => {
    const s0 = 100;
    const k = 105;
    const c = 3.5;
    const contractSize = 100;

    const result = calculateCoveredCall(s0, k, c, contractSize);

    // Max Profit: (K - S_0) + C = (105 - 100) + 3.5 = 8.5 per share, 850 total
    expect(result.metrics.max_profit_per_share).toBeCloseTo(8.5, 2);
    expect(result.metrics.max_profit_total).toBeCloseTo(850, 2);

    // Max Loss: S_0 - C = 100 - 3.5 = 96.5 per share, 9650 total
    expect(result.metrics.max_loss_per_share).toBeCloseTo(96.5, 2);
    expect(result.metrics.max_loss_total).toBeCloseTo(9650, 2);

    // Breakeven: S_0 - C = 96.5
    expect(result.metrics.breakeven_price).toBeCloseTo(96.5, 2);

    // Downside cushion: C / S_0 * 100 = 3.5%
    expect(result.metrics.downside_cushion_pct).toBeCloseTo(3.5, 2);
  });

  it('correctly evaluates payoff across various expiration prices S_T', () => {
    const s0 = 100;
    const k = 105;
    const c = 3.5;

    // 1. Below Strike (S_T = 90) -> Loss cushioned by premium
    // Stock P&L: 90 - 100 = -10
    // Call P&L: 3.5 - 0 = +3.5
    // Total: -6.5
    const ptBelow = evaluatePointPayoff(s0, k, c, 90, 100);
    expect(ptBelow.stockPnlShare).toBeCloseTo(-10, 2);
    expect(ptBelow.callPnlShare).toBeCloseTo(3.5, 2);
    expect(ptBelow.totalPnlShare).toBeCloseTo(-6.5, 2);
    expect(ptBelow.isAssigned).toBe(false);

    // 2. Exactly at Strike (S_T = 105) -> Max Profit achieved
    // Stock P&L: 105 - 100 = +5
    // Call P&L: 3.5 - 0 = +3.5
    // Total: +8.5
    const ptStrike = evaluatePointPayoff(s0, k, c, 105, 100);
    expect(ptStrike.totalPnlShare).toBeCloseTo(8.5, 2);
    expect(ptStrike.isMaxProfit).toBe(true);

    // 3. Well Above Strike (S_T = 120) -> Capped at Max Profit
    // Stock P&L: 120 - 100 = +20
    // Call P&L: 3.5 - (120 - 105) = 3.5 - 15 = -11.5
    // Total: 20 - 11.5 = +8.5
    const ptAbove = evaluatePointPayoff(s0, k, c, 120, 100);
    expect(ptAbove.totalPnlShare).toBeCloseTo(8.5, 2);
    expect(ptAbove.isAssigned).toBe(true);
  });
});

describe('StrategyMetricsCards Component', () => {
  it('renders correct calculated metrics in contract mode', () => {
    const metrics = {
      max_profit_per_share: 8.5,
      max_profit_total: 850,
      max_loss_per_share: 96.5,
      max_loss_total: 9650,
      breakeven_price: 96.5,
      max_roi_pct: 8.81,
      downside_cushion_pct: 3.5,
      assignment_threshold: 105,
      net_debit_per_share: 96.5,
    };

    render(
      <StrategyMetricsCards
        metrics={metrics}
        isContractView={true}
        contractSize={100}
      />
    );

    // Verify Max Profit rendered
    expect(screen.getByText('+$850.00')).toBeInTheDocument();
    // Verify Max Loss rendered
    expect(screen.getByText('-$9,650.00')).toBeInTheDocument();
    // Verify Breakeven Price rendered
    expect(screen.getByText('$96.50')).toBeInTheDocument();
    // Verify Downside cushion rendered
    expect(screen.getByText('3.50%')).toBeInTheDocument();
  });

  it('renders correct calculated metrics in per-share mode', () => {
    const metrics = {
      max_profit_per_share: 8.5,
      max_profit_total: 850,
      max_loss_per_share: 96.5,
      max_loss_total: 9650,
      breakeven_price: 96.5,
      max_roi_pct: 8.81,
      downside_cushion_pct: 3.5,
      assignment_threshold: 105,
      net_debit_per_share: 96.5,
    };

    render(
      <StrategyMetricsCards
        metrics={metrics}
        isContractView={false}
        contractSize={100}
      />
    );

    // In per-share mode, should render +$8.50 and -$96.50
    expect(screen.getByText('+$8.50')).toBeInTheDocument();
    expect(screen.getByText('-$96.50')).toBeInTheDocument();
  });
});

describe('ParameterControls Component', () => {
  it('triggers callbacks when inputs change', () => {
    const onPriceChange = vi.fn();
    const onStrikeChange = vi.fn();
    const onPremiumChange = vi.fn();

    render(
      <ParameterControls
        currentPrice={100}
        strikePrice={105}
        premium={3.5}
        priceRangePct={25}
        contractSize={100}
        isContractView={true}
        onCurrentPriceChange={onPriceChange}
        onStrikePriceChange={onStrikeChange}
        onPremiumChange={onPremiumChange}
        onPriceRangePctChange={vi.fn()}
        onContractSizeChange={vi.fn()}
        onToggleContractView={vi.fn()}
      />
    );

    const s0Input = screen.getByLabelText(/Current Stock Price/i);
    fireEvent.change(s0Input, { target: { value: '110' } });
    expect(onPriceChange).toHaveBeenCalledWith(110);

    const kInput = screen.getByLabelText(/Call Strike Price/i);
    fireEvent.change(kInput, { target: { value: '115' } });
    expect(onStrikeChange).toHaveBeenCalledWith(115);

    const cInput = screen.getByLabelText(/Call Premium Received/i);
    fireEvent.change(cInput, { target: { value: '4.5' } });
    expect(onPremiumChange).toHaveBeenCalledWith(4.5);
  });
});

describe('InteractiveSimulator Component', () => {
  it('displays accurate outcome and leg breakdowns for simulated expiration price', () => {
    render(
      <InteractiveSimulator
        currentPrice={100}
        strikePrice={105}
        premium={3.5}
        contractSize={100}
        isContractView={true}
      />
    );

    expect(screen.getByText(/Expiration Scenario Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Leg 1: Stock P&L/i)).toBeInTheDocument();
    expect(screen.getByText(/Leg 2: Short Call P&L/i)).toBeInTheDocument();
    expect(screen.getByText(/Combined Total P&L/i)).toBeInTheDocument();
  });
});
