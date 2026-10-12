"""
Modular Strategy Framework for Options Payoff Calculations.
Enables pluggable option strategies without modifying the core execution framework.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Type
from backend.models import (
    StrategyCalculateRequest,
    StrategyCalculateResponse,
    PayoffPoint,
    KeyMetrics,
    StrategyDefinition,
)


def linspace(start: float, stop: float, num: int) -> List[float]:
    """Pure Python replacement for numpy.linspace."""
    if num <= 1:
        return [start]
    step = (stop - start) / (num - 1)
    return [start + i * step for i in range(num)]


class BaseStrategy(ABC):
    """Abstract base class that all option strategies must implement."""

    @abstractmethod
    def get_definition(self) -> StrategyDefinition:
        """Returns strategy metadata, classification, and educational formulas."""
        pass

    @abstractmethod
    def calculate(self, req: StrategyCalculateRequest) -> StrategyCalculateResponse:
        """Executes exact mathematical payoff calculations."""
        pass


class CoveredCallStrategy(BaseStrategy):
    """
    Covered Call Strategy:
    - Long 100 Shares of Stock at S_0
    - Short 1 Call Option at Strike K receiving premium C

    Formulas:
    - P&L_stock = S_T - S_0
    - P&L_call  = C - max(0, S_T - K)
    - P&L_total = P&L_stock + P&L_call
    - Max Profit = (K - S_0) + C
    - Max Loss   = S_0 - C (at S_T = 0)
    - Breakeven  = S_0 - C
    """

    def get_definition(self) -> StrategyDefinition:
        return StrategyDefinition(
            id="covered_call",
            name="Covered Call",
            category="Income / Neutral-to-Bullish",
            sentiment="Moderately Bullish / Neutral",
            description=(
                "A foundational income-generating strategy where an investor holds a long stock position "
                "and sells a call option against those shares. Provides downside buffer equal to the premium "
                "received while capping upside profit at the strike price."
            ),
            legs_description=[
                "Long 100 Shares of underlying stock at S_0",
                "Short 1 Call Option at Strike K receiving premium C",
            ],
            formula={
                "stock_pnl": "S_T - S_0",
                "call_pnl": "C - max(0, S_T - K)",
                "total_pnl": "(S_T - S_0) + C - max(0, S_T - K)",
                "max_profit": "(K - S_0) + C",
                "max_loss": "S_0 - C (occurs when S_T = 0)",
                "breakeven": "S_0 - C",
            },
            is_available=True,
        )

    @staticmethod
    def evaluate_point(s0: float, k: float, c: float, st: float, contract_size: int = 100) -> PayoffPoint:
        """Calculates exact payoff for an arbitrary expiration stock price S_T."""
        stock_pnl_share = st - s0
        call_pnl_share = c - max(0.0, st - k)
        total_pnl_share = stock_pnl_share + call_pnl_share

        total_pnl = total_pnl_share * contract_size
        stock_pnl = stock_pnl_share * contract_size
        option_pnl = call_pnl_share * contract_size

        return PayoffPoint(
            stock_price=round(st, 2),
            stock_pnl=round(stock_pnl, 2),
            option_pnl=round(option_pnl, 2),
            total_pnl=round(total_pnl, 2),
            total_pnl_per_share=round(total_pnl_share, 2),
            is_profit=(total_pnl >= 0),
        )

    def calculate(self, req: StrategyCalculateRequest) -> StrategyCalculateResponse:
        s0 = req.current_price
        k = req.strike_price
        c = req.premium
        contract_size = req.contract_size

        # Key Metrics (exact formulas)
        max_profit_per_share = (k - s0) + c
        max_profit_total = max_profit_per_share * contract_size

        max_loss_per_share = s0 - c
        max_loss_total = max_loss_per_share * contract_size

        breakeven_price = s0 - c
        net_debit_per_share = s0 - c

        # ROI & Cushion percentages
        max_roi_pct = (max_profit_per_share / net_debit_per_share * 100.0) if net_debit_per_share > 0 else 0.0
        downside_cushion_pct = (c / s0 * 100.0) if s0 > 0 else 0.0

        metrics = KeyMetrics(
            max_profit_per_share=round(max_profit_per_share, 4),
            max_profit_total=round(max_profit_total, 2),
            max_loss_per_share=round(max_loss_per_share, 4),
            max_loss_total=round(max_loss_total, 2),
            breakeven_price=round(breakeven_price, 4),
            max_roi_pct=round(max_roi_pct, 2),
            downside_cushion_pct=round(downside_cushion_pct, 2),
            assignment_threshold=k,
            net_debit_per_share=round(net_debit_per_share, 4),
        )

        # Generate price range around S_0
        range_pct = req.price_range_pct / 100.0
        min_p = max(0.0, s0 * (1.0 - range_pct))
        max_p = s0 * (1.0 + range_pct)

        # Ensure essential landmarks (min_p, breakeven, s0, k, max_p) are included
        landmark_prices = [p for p in [min_p, breakeven_price, s0, k, max_p] if p >= 0]
        regular_grid = linspace(min_p, max_p, req.num_points)
        combined_prices = sorted(list(set([round(p, 4) for p in (regular_grid + landmark_prices) if p >= 0])))

        points: List[PayoffPoint] = []
        for st in combined_prices:
            # Mathematical evaluation
            stock_pnl_share = st - s0
            call_pnl_share = c - max(0.0, st - k)
            total_pnl_share = stock_pnl_share + call_pnl_share

            total_pnl = total_pnl_share * contract_size
            stock_pnl = stock_pnl_share * contract_size
            option_pnl = call_pnl_share * contract_size

            points.append(
                PayoffPoint(
                    stock_price=round(st, 2),
                    stock_pnl=round(stock_pnl, 2),
                    option_pnl=round(option_pnl, 2),
                    total_pnl=round(total_pnl, 2),
                    total_pnl_per_share=round(total_pnl_share, 2),
                    is_profit=(total_pnl >= 0),
                )
            )

        summary_text = (
            f"Selling the ${k:.2f} call for ${c:.2f} yields a maximum return of "
            f"${max_profit_total:.2f} ({max_roi_pct:.1f}% ROI) if the stock finishes at or above ${k:.2f}. "
            f"The premium provides ${c:.2f} in downside cushion, lowering your breakeven to ${breakeven_price:.2f}."
        )

        return StrategyCalculateResponse(
            strategy_id="covered_call",
            strategy_name="Covered Call",
            current_price=s0,
            strike_price=k,
            premium=c,
            contract_size=contract_size,
            metrics=metrics,
            points=points,
            summary_text=summary_text,
            formula_breakdown={
                "Stock P&L Formula": "P&L_stock = S_T - S_0",
                "Call P&L Formula": "P&L_call = C - max(0, S_T - K)",
                "Combined Formula": "P&L_total = (S_T - S_0) + C - max(0, S_T - K)",
                "Max Profit Formula": "(K - S_0) + C",
                "Max Loss Formula": "S_0 - C",
                "Breakeven Formula": "S_0 - C",
            },
        )


class BullCallSpreadStrategy(BaseStrategy):
    """
    Extensible module: Bull Call Spread
    - Buy Call at Strike K1 (pay premium C1)
    - Sell Call at Strike K2 (receive premium C2), where K2 > K1
    """

    def get_definition(self) -> StrategyDefinition:
        return StrategyDefinition(
            id="bull_call_spread",
            name="Bull Call Spread",
            category="Vertical Spread",
            sentiment="Moderately Bullish",
            description="Buy a lower strike call and sell a higher strike call to reduce capital outlay while capping maximum gain.",
            legs_description=[
                "Long Call at Strike K1 (Debit C1)",
                "Short Call at Strike K2 (Credit C2)",
            ],
            formula={
                "net_debit": "C1 - C2",
                "max_profit": "(K2 - K1) - (C1 - C2)",
                "max_loss": "C1 - C2",
                "breakeven": "K1 + (C1 - C2)",
            },
            is_available=True,
        )

    def calculate(self, req: StrategyCalculateRequest) -> StrategyCalculateResponse:
        s0 = req.current_price
        k1 = req.strike_price
        k2 = req.strike_price_2 or (k1 * 1.05)
        c1 = req.premium
        c2 = req.premium_2 or (c1 * 0.4)
        contract_size = req.contract_size

        net_debit = max(0.01, c1 - c2)
        max_profit_per_share = (k2 - k1) - net_debit
        max_loss_per_share = net_debit
        breakeven_price = k1 + net_debit

        metrics = KeyMetrics(
            max_profit_per_share=round(max_profit_per_share, 4),
            max_profit_total=round(max_profit_per_share * contract_size, 2),
            max_loss_per_share=round(max_loss_per_share, 4),
            max_loss_total=round(max_loss_per_share * contract_size, 2),
            breakeven_price=round(breakeven_price, 4),
            max_roi_pct=round((max_profit_per_share / net_debit) * 100, 2),
            downside_cushion_pct=0.0,
            assignment_threshold=k2,
            net_debit_per_share=round(net_debit, 4),
        )

        range_pct = req.price_range_pct / 100.0
        min_p = max(0.0, s0 * (1.0 - range_pct))
        max_p = s0 * (1.0 + range_pct)
        regular_grid = linspace(min_p, max_p, req.num_points)
        combined_prices = sorted(list(set([round(p, 4) for p in (regular_grid + [min_p, breakeven_price, k1, k2, max_p]) if p >= 0])))

        points: List[PayoffPoint] = []
        for st in combined_prices:
            long_call_pnl = max(0.0, st - k1) - c1
            short_call_pnl = c2 - max(0.0, st - k2)
            total_pnl_share = long_call_pnl + short_call_pnl
            points.append(
                PayoffPoint(
                    stock_price=round(st, 2),
                    stock_pnl=round(long_call_pnl * contract_size, 2),
                    option_pnl=round(short_call_pnl * contract_size, 2),
                    total_pnl=round(total_pnl_share * contract_size, 2),
                    total_pnl_per_share=round(total_pnl_share, 2),
                    is_profit=(total_pnl_share >= 0),
                )
            )

        return StrategyCalculateResponse(
            strategy_id="bull_call_spread",
            strategy_name="Bull Call Spread",
            current_price=s0,
            strike_price=k1,
            premium=c1,
            contract_size=contract_size,
            metrics=metrics,
            points=points,
            summary_text=f"Defined risk debit spread. Max gain ${metrics.max_profit_total:.2f}, Max loss ${metrics.max_loss_total:.2f}.",
            formula_breakdown={
                "Net Debit": "C1 - C2",
                "Max Profit": "(K2 - K1) - Net Debit",
                "Max Loss": "Net Debit",
                "Breakeven": "K1 + Net Debit",
            },
        )


class ProtectivePutStrategy(BaseStrategy):
    """
    Extensible module: Protective Put (Married Put)
    - Long 100 Shares of Stock at S_0
    - Long 1 Put Option at Strike K paying premium P
    """

    def get_definition(self) -> StrategyDefinition:
        return StrategyDefinition(
            id="protective_put",
            name="Protective Put",
            category="Hedging / Capital Preservation",
            sentiment="Bullish with Floor Protection",
            description="Holds underlying stock and buys a put option to place an absolute floor against market crashes.",
            legs_description=[
                "Long 100 Shares of underlying stock at S_0",
                "Long 1 Put Option at Strike K (Premium P)",
            ],
            formula={
                "stock_pnl": "S_T - S_0",
                "put_pnl": "max(0, K - S_T) - P",
                "max_loss": "(S_0 - K) + P",
                "breakeven": "S_0 + P",
            },
            is_available=True,
        )

    def calculate(self, req: StrategyCalculateRequest) -> StrategyCalculateResponse:
        s0 = req.current_price
        k = req.strike_price
        p = req.premium
        contract_size = req.contract_size

        max_loss_per_share = (s0 - k) + p
        breakeven_price = s0 + p

        metrics = KeyMetrics(
            max_profit_per_share=float("inf"),
            max_profit_total=float("inf"),
            max_loss_per_share=round(max_loss_per_share, 4),
            max_loss_total=round(max_loss_per_share * contract_size, 2),
            breakeven_price=round(breakeven_price, 4),
            max_roi_pct=0.0,
            downside_cushion_pct=0.0,
            assignment_threshold=k,
            net_debit_per_share=round(s0 + p, 4),
        )

        range_pct = req.price_range_pct / 100.0
        min_p = max(0.0, s0 * (1.0 - range_pct))
        max_p = s0 * (1.0 + range_pct)
        regular_grid = linspace(min_p, max_p, req.num_points)
        combined_prices = sorted(list(set([round(price, 4) for price in (regular_grid + [min_p, breakeven_price, k, s0, max_p]) if price >= 0])))

        points: List[PayoffPoint] = []
        for st in combined_prices:
            stock_pnl_share = st - s0
            put_pnl_share = max(0.0, k - st) - p
            total_pnl_share = stock_pnl_share + put_pnl_share
            points.append(
                PayoffPoint(
                    stock_price=round(st, 2),
                    stock_pnl=round(stock_pnl_share * contract_size, 2),
                    option_pnl=round(put_pnl_share * contract_size, 2),
                    total_pnl=round(total_pnl_share * contract_size, 2),
                    total_pnl_per_share=round(total_pnl_share, 2),
                    is_profit=(total_pnl_share >= 0),
                )
            )

        return StrategyCalculateResponse(
            strategy_id="protective_put",
            strategy_name="Protective Put",
            current_price=s0,
            strike_price=k,
            premium=p,
            contract_size=contract_size,
            metrics=metrics,
            points=points,
            summary_text=f"Protected long position. Floor set at ${k:.2f}. Maximum loss capped at ${metrics.max_loss_total:.2f}.",
            formula_breakdown={
                "Stock P&L Formula": "P&L_stock = S_T - S_0",
                "Put P&L Formula": "P&L_put = max(0, K - S_T) - P",
                "Total P&L Formula": "P&L_total = (S_T - S_0) + max(0, K - S_T) - P",
                "Max Loss": "(S_0 - K) + P",
                "Breakeven": "S_0 + P",
            },
        )


class StrategyRegistry:
    """Registry coordinating all available strategy modules."""

    _strategies: Dict[str, Type[BaseStrategy]] = {
        "covered_call": CoveredCallStrategy,
        "bull_call_spread": BullCallSpreadStrategy,
        "protective_put": ProtectivePutStrategy,
    }

    @classmethod
    def get_strategy(cls, strategy_id: str) -> BaseStrategy:
        strategy_class = cls._strategies.get(strategy_id)
        if not strategy_class:
            raise ValueError(f"Unknown strategy '{strategy_id}'. Available: {list(cls._strategies.keys())}")
        return strategy_class()

    @classmethod
    def list_strategies(cls) -> List[StrategyDefinition]:
        return [strat().get_definition() for strat in cls._strategies.values()]
