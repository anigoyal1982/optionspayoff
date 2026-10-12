"""
Data models and Pydantic schemas for the Options Payoff Engine.
"""

from typing import List, Optional, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    # Graceful fallback to pure Python when running in minimal environments
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(default=None, **kwargs):
        return default


class QuoteResponse(BaseModel):
    ticker: str
    price: float
    change: float = 0.0
    change_percent: float = 0.0
    currency: str = "USD"
    company_name: str
    suggested_strike: float
    suggested_premium: float
    timestamp: str


class StrategyCalculateRequest(BaseModel):
    strategy_id: str = Field(default="covered_call", description="Identifier for strategy, e.g. covered_call")
    current_price: float = Field(gt=0, description="Initial stock price S_0")
    strike_price: float = Field(gt=0, description="Strike price K")
    premium: float = Field(ge=0, description="Option premium received C per share")
    price_range_pct: float = Field(default=25.0, ge=5.0, le=100.0, description="Percentage range around current price (+/- %)")
    num_points: int = Field(default=60, ge=10, le=300, description="Number of calculation sample points")
    contract_size: int = Field(default=100, ge=1, description="Shares per contract, default 100")
    # Extensible fields for multi-leg strategies
    strike_price_2: Optional[float] = Field(default=None, description="Optional secondary strike price for spreads/condors")
    strike_price_3: Optional[float] = Field(default=None, description="Optional tertiary strike price")
    strike_price_4: Optional[float] = Field(default=None, description="Optional quaternary strike price")
    premium_2: Optional[float] = Field(default=None, description="Optional secondary premium")


class PayoffPoint(BaseModel):
    stock_price: float
    stock_pnl: float
    option_pnl: float
    total_pnl: float
    total_pnl_per_share: float
    is_profit: bool


class KeyMetrics(BaseModel):
    max_profit_per_share: float
    max_profit_total: float
    max_loss_per_share: float
    max_loss_total: float
    breakeven_price: float
    max_roi_pct: float
    downside_cushion_pct: float
    assignment_threshold: float
    net_debit_per_share: float


class StrategyCalculateResponse(BaseModel):
    strategy_id: str
    strategy_name: str
    current_price: float
    strike_price: float
    premium: float
    contract_size: int
    metrics: KeyMetrics
    points: List[PayoffPoint]
    summary_text: str
    formula_breakdown: Dict[str, str]


class StrategyDefinition(BaseModel):
    id: str
    name: str
    category: str
    sentiment: str
    description: str
    legs_description: List[str]
    formula: Dict[str, str]
    is_available: bool = True
