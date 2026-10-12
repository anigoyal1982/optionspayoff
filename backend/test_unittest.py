"""
Standard Python Unittest verification suite for Covered Call payoff logic.
Runs seamlessly with zero dependencies via: python3 -m unittest backend/test_unittest.py
"""

import unittest
from backend.models import StrategyCalculateRequest
from backend.strategies import CoveredCallStrategy, StrategyRegistry


class TestCoveredCallMath(unittest.TestCase):
    def setUp(self):
        self.strategy = CoveredCallStrategy()

    def test_covered_call_below_strike(self):
        """
        Stock Price at Expiry S_T is below Strike K:
        Stock P&L = S_T - S_0
        Call P&L = C - 0 = C
        Total P&L = S_T - S_0 + C
        """
        s0 = 100.0
        k = 105.0
        c = 3.50
        st = 95.0

        req = StrategyCalculateRequest(
            strategy_id="covered_call",
            current_price=s0,
            strike_price=k,
            premium=c,
            contract_size=100,
        )
        res = self.strategy.calculate(req)

        # Expected key metrics
        self.assertAlmostEqual(res.metrics.max_profit_per_share, (k - s0) + c, places=2)
        self.assertAlmostEqual(res.metrics.max_loss_per_share, s0 - c, places=2)
        self.assertAlmostEqual(res.metrics.breakeven_price, s0 - c, places=2)
        self.assertAlmostEqual(res.metrics.max_profit_total, ((k - s0) + c) * 100, places=2)
        self.assertAlmostEqual(res.metrics.max_loss_total, (s0 - c) * 100, places=2)

        # Expected payoff at ST = 95
        expected_stock_pnl = st - s0  # -5.00
        expected_call_pnl = c         # +3.50
        expected_total_pnl = expected_stock_pnl + expected_call_pnl  # -1.50

        # Direct evaluation test
        point = CoveredCallStrategy.evaluate_point(s0, k, c, st, 100)
        self.assertAlmostEqual(point.total_pnl_per_share, expected_total_pnl, places=2)
        self.assertAlmostEqual(point.total_pnl, expected_total_pnl * 100, places=2)

        # Check closest point in generated grid
        closest_grid = min(res.points, key=lambda p: abs(p.stock_price - st))
        self.assertAlmostEqual(closest_grid.total_pnl_per_share, (closest_grid.stock_price - s0) + c, delta=0.1)

    def test_covered_call_at_strike(self):
        """
        Stock Price at Expiry S_T is exactly at Strike K:
        Total P&L reaches maximum profit: (K - S_0) + C
        """
        s0 = 150.0
        k = 160.0
        c = 5.0
        st = 160.0

        req = StrategyCalculateRequest(
            strategy_id="covered_call",
            current_price=s0,
            strike_price=k,
            premium=c,
            contract_size=100,
        )
        res = self.strategy.calculate(req)

        expected_max_profit = (k - s0) + c  # 15.00
        self.assertAlmostEqual(res.metrics.max_profit_per_share, expected_max_profit, places=2)
        self.assertAlmostEqual(res.metrics.max_profit_total, 1500.0, places=2)

        point = next((p for p in res.points if abs(p.stock_price - st) < 0.1), None)
        self.assertIsNotNone(point)
        self.assertAlmostEqual(point.total_pnl_per_share, expected_max_profit, delta=0.2)

    def test_covered_call_well_above_strike(self):
        """
        Stock Price at Expiry S_T is well above Strike K:
        Upside is capped at (K - S_0) + C because call option is exercised by buyer.
        """
        s0 = 50.0
        k = 55.0
        c = 2.0
        st = 75.0

        req = StrategyCalculateRequest(
            strategy_id="covered_call",
            current_price=s0,
            strike_price=k,
            premium=c,
            contract_size=100,
            price_range_pct=60.0,
        )
        res = self.strategy.calculate(req)

        capped_profit = (k - s0) + c  # 7.00
        point = next((p for p in res.points if abs(p.stock_price - st) < 0.2), None)
        self.assertIsNotNone(point)
        self.assertAlmostEqual(point.total_pnl_per_share, capped_profit, delta=0.2)

    def test_covered_call_at_zero_stock_price(self):
        """
        Worst-case test when stock drops to 0:
        Loss = S_0 - C (cushioned by option premium)
        """
        s0 = 100.0
        k = 105.0
        c = 4.0

        req = StrategyCalculateRequest(
            strategy_id="covered_call",
            current_price=s0,
            strike_price=k,
            premium=c,
            contract_size=100,
            price_range_pct=100.0,
        )
        res = self.strategy.calculate(req)

        expected_max_loss = s0 - c  # 96.00
        self.assertAlmostEqual(res.metrics.max_loss_per_share, expected_max_loss, places=2)
        self.assertAlmostEqual(res.metrics.max_loss_total, 9600.0, places=2)

    def test_breakeven_point_calculation(self):
        """
        At S_T = S_0 - C, strategy P&L is exactly 0.
        """
        s0 = 200.0
        k = 210.0
        c = 7.50
        breakeven = s0 - c  # 192.50

        req = StrategyCalculateRequest(
            strategy_id="covered_call",
            current_price=s0,
            strike_price=k,
            premium=c,
            contract_size=100,
        )
        res = self.strategy.calculate(req)

        self.assertAlmostEqual(res.metrics.breakeven_price, breakeven, places=2)
        be_point = next((p for p in res.points if abs(p.stock_price - breakeven) < 0.1), None)
        self.assertIsNotNone(be_point)
        self.assertAlmostEqual(be_point.total_pnl_per_share, 0.0, delta=0.2)


class TestStrategyRegistry(unittest.TestCase):
    def test_registry_contains_strategies(self):
        definitions = StrategyRegistry.list_strategies()
        ids = [d.id for d in definitions]
        self.assertIn("covered_call", ids)
        self.assertIn("bull_call_spread", ids)
        self.assertIn("protective_put", ids)


if __name__ == "__main__":
    unittest.main()
