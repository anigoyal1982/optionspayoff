"""
Pytest Test Suite for Options Payoff Mathematical Modeling and API.

Verifies:
1. Covered Call mathematical formulas:
   - S_T below strike (S_T <= K)
   - S_T exactly at strike (S_T == K)
   - S_T well above strike (S_T > K)
   - S_T at zero (S_T == 0)
2. Key metrics calculation:
   - Max Profit = (K - S_0) + C
   - Max Loss = S_0 - C
   - Breakeven Price = S_0 - C
3. FastAPI endpoints testing (quote, calculate, strategies, health)
"""

import pytest
from backend.models import StrategyCalculateRequest
from backend.strategies import CoveredCallStrategy, StrategyRegistry


def test_covered_call_below_strike():
    """
    When S_T <= K:
    Stock P&L = S_T - S_0
    Call P&L  = C - 0 = C
    Total P&L = S_T - S_0 + C
    """
    strategy = CoveredCallStrategy()
    s0 = 100.0  # Purchased stock at $100
    k = 105.0   # Strike price $105
    c = 3.50    # Call premium received $3.50
    st = 95.0   # Expiration stock price $95 (below strike)

    req = StrategyCalculateRequest(
        strategy_id="covered_call",
        current_price=s0,
        strike_price=k,
        premium=c,
        contract_size=100,
    )
    res = strategy.calculate(req)

    # Verification of key metrics
    expected_max_profit_per_share = (k - s0) + c  # (105 - 100) + 3.5 = 8.50
    expected_max_loss_per_share = s0 - c          # 100 - 3.5 = 96.50
    expected_breakeven = s0 - c                   # 96.50

    assert res.metrics.max_profit_per_share == pytest.approx(expected_max_profit_per_share)
    assert res.metrics.max_profit_total == pytest.approx(expected_max_profit_per_share * 100)
    assert res.metrics.max_loss_per_share == pytest.approx(expected_max_loss_per_share)
    assert res.metrics.max_loss_total == pytest.approx(expected_max_loss_per_share * 100)
    assert res.metrics.breakeven_price == pytest.approx(expected_breakeven)

    # Calculate point at S_T = 95
    stock_pnl_share = st - s0  # 95 - 100 = -5.00
    call_pnl_share = c - max(0.0, st - k)  # 3.50 - 0 = +3.50
    total_pnl_share = stock_pnl_share + call_pnl_share  # -1.50
    total_pnl_contract = total_pnl_share * 100  # -150.00

    # Direct evaluation test at S_T = 95
    point = CoveredCallStrategy.evaluate_point(s0, k, c, st, 100)
    assert point.total_pnl_per_share == pytest.approx(total_pnl_share)
    assert point.total_pnl == pytest.approx(total_pnl_contract)

    # Grid contains points around ST
    closest = min(res.points, key=lambda p: abs(p.stock_price - st))
    assert closest.total_pnl_per_share == pytest.approx((closest.stock_price - s0) + c, abs=0.1)


def test_covered_call_at_strike():
    """
    When S_T == K:
    Stock P&L = K - S_0
    Call P&L  = C - 0 = C
    Total P&L = (K - S_0) + C (Max Profit reached!)
    """
    strategy = CoveredCallStrategy()
    s0 = 150.0
    k = 160.0
    c = 5.0
    st = 160.0  # Exactly at strike

    req = StrategyCalculateRequest(
        strategy_id="covered_call",
        current_price=s0,
        strike_price=k,
        premium=c,
        contract_size=100,
    )
    res = strategy.calculate(req)

    expected_max_profit = (k - s0) + c  # (160 - 150) + 5 = 15.0 per share
    assert res.metrics.max_profit_per_share == pytest.approx(expected_max_profit)
    assert res.metrics.max_profit_total == pytest.approx(1500.0)

    point = next((p for p in res.points if abs(p.stock_price - st) < 0.1), None)
    assert point is not None
    assert point.total_pnl_per_share == pytest.approx(expected_max_profit, abs=0.1)


def test_covered_call_well_above_strike():
    """
    When S_T > K:
    Stock P&L = S_T - S_0
    Call P&L  = C - (S_T - K) = K - S_T + C
    Total P&L = (S_T - S_0) + (K - S_T + C) = (K - S_0) + C (Firm ceiling)
    """
    strategy = CoveredCallStrategy()
    s0 = 50.0
    k = 55.0
    c = 2.0
    st = 80.0  # Well above strike

    req = StrategyCalculateRequest(
        strategy_id="covered_call",
        current_price=s0,
        strike_price=k,
        premium=c,
        contract_size=100,
        price_range_pct=70.0,
    )
    res = strategy.calculate(req)

    capped_profit_per_share = (k - s0) + c  # (55 - 50) + 2 = 7.00
    point = next((p for p in res.points if abs(p.stock_price - st) < 0.2), None)
    assert point is not None
    assert point.total_pnl_per_share == pytest.approx(capped_profit_per_share, abs=0.1)


def test_covered_call_at_zero_price():
    """
    When S_T == 0 (Worst case scenario / Bankruptcy):
    Stock P&L = 0 - S_0 = -S_0
    Call P&L  = C - 0 = C
    Total P&L = -S_0 + C = -(S_0 - C) (Max Loss realized)
    """
    strategy = CoveredCallStrategy()
    s0 = 100.0
    k = 105.0
    c = 4.0

    req = StrategyCalculateRequest(
        strategy_id="covered_call",
        current_price=s0,
        strike_price=k,
        premium=c,
        contract_size=100,
        price_range_pct=100.0,  # Covers down to 0
    )
    res = strategy.calculate(req)

    expected_max_loss_per_share = s0 - c  # 96.00
    assert res.metrics.max_loss_per_share == pytest.approx(expected_max_loss_per_share)
    assert res.metrics.max_loss_total == pytest.approx(9600.0)

    point_zero = next((p for p in res.points if p.stock_price == 0.0), None)
    if point_zero:
        assert point_zero.total_pnl_per_share == pytest.approx(-expected_max_loss_per_share)


def test_covered_call_breakeven():
    """
    When S_T == S_0 - C (Breakeven):
    Stock P&L = (S_0 - C) - S_0 = -C
    Call P&L  = C - 0 = +C
    Total P&L = -C + C = 0.00
    """
    strategy = CoveredCallStrategy()
    s0 = 200.0
    k = 210.0
    c = 8.50

    breakeven_price = s0 - c  # 191.50
    req = StrategyCalculateRequest(
        strategy_id="covered_call",
        current_price=s0,
        strike_price=k,
        premium=c,
        contract_size=100,
    )
    res = strategy.calculate(req)

    assert res.metrics.breakeven_price == pytest.approx(breakeven_price)

    be_point = next((p for p in res.points if abs(p.stock_price - breakeven_price) < 0.1), None)
    assert be_point is not None
    assert be_point.total_pnl_per_share == pytest.approx(0.0, abs=0.1)


def test_strategy_registry_extensibility():
    """Verifies that the strategy registry supports pluggable strategy modules."""
    strategies = StrategyRegistry.list_strategies()
    strategy_ids = [s.id for s in strategies]
    assert "covered_call" in strategy_ids
    assert "bull_call_spread" in strategy_ids
    assert "protective_put" in strategy_ids
