"""
FastAPI Backend for Educational Options Payoff Application.
Provides market data via yfinance and executes mathematical payoff models.
"""

from datetime import datetime
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import yfinance as yf

from backend.models import (
    QuoteResponse,
    StrategyCalculateRequest,
    StrategyCalculateResponse,
    StrategyDefinition,
)
from backend.strategies import StrategyRegistry

app = FastAPI(
    title="OptiLearn Options Payoff API",
    description="Educational Options Payoff Modeling and Market Quotes API",
    version="1.0.0",
)

# Enable CORS for local Vite development and iframe deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preset popular stock defaults in case of network restrictions
FALLBACK_PRESETS: Dict[str, Dict[str, Any]] = {
    "AAPL": {"price": 228.50, "change": 1.75, "change_percent": 0.77, "company_name": "Apple Inc."},
    "SPY": {"price": 585.20, "change": 2.40, "change_percent": 0.41, "company_name": "SPDR S&P 500 ETF Trust"},
    "TSLA": {"price": 242.80, "change": -3.20, "change_percent": -1.30, "company_name": "Tesla, Inc."},
    "QQQ": {"price": 492.10, "change": 3.10, "change_percent": 0.63, "company_name": "Invesco QQQ Trust"},
    "MSFT": {"price": 420.30, "change": 1.90, "change_percent": 0.45, "company_name": "Microsoft Corporation"},
    "NVDA": {"price": 134.60, "change": 4.10, "change_percent": 3.14, "company_name": "NVIDIA Corporation"},
    "AMZN": {"price": 186.40, "change": 0.85, "change_percent": 0.46, "company_name": "Amazon.com, Inc."},
}


def round_strike(price: float) -> float:
    """Rounds to reasonable next standard out-of-the-money strike price (~2.5% to 5% OTM)."""
    target = price * 1.035
    if price < 25:
        step = 0.5
    elif price < 50:
        step = 1.0
    elif price < 150:
        step = 2.5
    else:
        step = 5.0
    return round(round(target / step) * step, 2)


def estimate_call_premium(stock_price: float, strike_price: float) -> float:
    """Estimates realistic ~30-45 DTE call option premium based on moneyness."""
    moneyness = strike_price / stock_price
    # Roughly 2.5% to 3.5% of stock price for slightly OTM calls
    base_rate = 0.03
    if moneyness < 1.0:
        # In the money includes intrinsic value
        intrinsic = stock_price - strike_price
        extrinsic = stock_price * 0.02
        return round(intrinsic + extrinsic, 2)
    diff_pct = (moneyness - 1.0) * 100
    decay = max(0.01, base_rate - (diff_pct * 0.003))
    return round(stock_price * decay, 2)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OptiLearn Options Payoff API",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/strategies", response_model=List[StrategyDefinition])
def get_strategies():
    """Returns catalog of modular option strategies."""
    return StrategyRegistry.list_strategies()


@app.get("/api/quote/{ticker}", response_model=QuoteResponse)
def get_quote(ticker: str):
    """
    Fetches real-time / recent market price using yfinance.
    Falls back gracefully if symbol is invalid or network is unreachable.
    """
    clean_ticker = ticker.strip().upper()
    if not clean_ticker or len(clean_ticker) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ticker symbol '{ticker}'.",
        )

    current_price = 0.0
    change = 0.0
    change_pct = 0.0
    company_name = clean_ticker

    try:
        t = yf.Ticker(clean_ticker)
        # Attempt fast_info first (faster and less prone to scraping blocks)
        fast_info = getattr(t, "fast_info", None)
        if fast_info and hasattr(fast_info, "last_price") and fast_info.last_price is not None:
            current_price = float(fast_info.last_price)
            prev_close = float(getattr(fast_info, "previous_close", current_price))
            change = current_price - prev_close
            change_pct = (change / prev_close * 100) if prev_close else 0.0
        else:
            # Fallback to history 5d
            hist = t.history(period="5d")
            if not hist.empty:
                current_price = float(hist["Close"].iloc[-1])
                if len(hist) >= 2:
                    prev_close = float(hist["Close"].iloc[-2])
                    change = current_price - prev_close
                    change_pct = (change / prev_close * 100) if prev_close else 0.0

        # Retrieve company shortName if available
        try:
            info = t.info
            company_name = info.get("shortName") or info.get("longName") or clean_ticker
        except Exception:
            company_name = clean_ticker
    except Exception:
        # yfinance network issue or blocked
        pass

    # If yfinance failed or returned zero, use realistic preset if known
    if current_price <= 0:
        if clean_ticker in FALLBACK_PRESETS:
            preset = FALLBACK_PRESETS[clean_ticker]
            current_price = preset["price"]
            change = preset["change"]
            change_pct = preset["change_percent"]
            company_name = preset["company_name"]
        else:
            # Synthetic default for educational exploration
            current_price = 100.00
            change = 1.25
            change_pct = 1.25
            company_name = f"{clean_ticker} (Educational Quote)"

    suggested_strike = round_strike(current_price)
    suggested_premium = estimate_call_premium(current_price, suggested_strike)

    return QuoteResponse(
        ticker=clean_ticker,
        price=round(current_price, 2),
        change=round(change, 2),
        change_percent=round(change_pct, 2),
        currency="USD",
        company_name=company_name,
        suggested_strike=suggested_strike,
        suggested_premium=suggested_premium,
        timestamp=datetime.utcnow().isoformat(),
    )


@app.post("/api/calculate", response_model=StrategyCalculateResponse)
def calculate_payoff(request: StrategyCalculateRequest):
    """
    Executes options strategy payoff modeling with exact mathematical rigor.
    """
    try:
        strategy = StrategyRegistry.get_strategy(request.strategy_id)
        result = strategy.calculate(request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mathematical modeling failed: {str(e)}",
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
