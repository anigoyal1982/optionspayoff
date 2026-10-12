# OptiLearn — Educational Options Payoff Application

An educational web application for options payoff modeling, interactive simulation, and real-time market quote analysis. Inspired by modern edtech platforms, OptiLearn features mathematical precision for the **Covered Call** strategy, interactive Recharts visualizations, and a pluggable architecture designed to scale seamlessly to multi-leg strategies (e.g., Bull Call Spreads, Protective Puts, Iron Condors).

---

## 1. System Architecture

```
                       ┌───────────────────────────────────────────┐
                       │           React Frontend (Vite)           │
                       │  - Tailwind CSS Styling (Outskill Theme)  │
                       │  - Recharts Payoff Curve Visualization    │
                       │  - Interactive Settlement Simulator       │
                       │  - State Management & Boundary Metrics    │
                       └─────────────────────┬─────────────────────┘
                                             │ HTTP / JSON
                       ┌─────────────────────▼─────────────────────┐
                       │     Backend Layer (FastAPI / Express)     │
                       │  - CORS Middleware & Input Validation     │
                       │  - Market Data Engine (yfinance)          │
                       │  - Mathematical Payoff Engine             │
                       └─────────────────────┬─────────────────────┘
                                             │
                       ┌─────────────────────▼─────────────────────┐
                       │          Modular Strategy Framework        │
                       │  - BaseStrategy (Abstract Base Class)     │
                       │  - CoveredCallStrategy                    │
                       │  - BullCallSpreadStrategy                 │
                       │  - ProtectivePutStrategy                  │
                       │  - StrategyRegistry (Extensible Catalog)  │
                       └───────────────────────────────────────────┘
```

---

## 2. Mathematical Modeling (Covered Call Strategy)

A Covered Call consists of **Long 100 Shares of Stock** plus **Short 1 Call Option**:

### Variables
- $S_0$: Initial / Current purchase price of the underlying stock
- $S_T$: Stock price at option expiration
- $K$: Strike price of the sold call option
- $C$: Call option premium received per share (immediate credit)
- $N$: Contract multiplier (standard US options contract = 100 shares)

### Core Payoff Formulas
1. **Stock Leg P&L at Expiration ($P\&L_{stock}$)**:
   $$P\&L_{stock} = S_T - S_0$$

2. **Short Call Leg P&L at Expiration ($P\&L_{call}$)**:
   $$P\&L_{call} = C - \max(0, S_T - K)$$

3. **Total Strategy P&L ($P\&L_{total}$)**:
   $$P\&L_{total} = P\&L_{stock} + P\&L_{call} = (S_T - S_0) + C - \max(0, S_T - K)$$

### Key Boundary Metrics
- **Max Profit**:
  $$\text{Max Profit} = (K - S_0) + C \quad (\text{occurs when } S_T \ge K)$$
  *(Multiplied by 100 for a standard contract)*
- **Max Loss**:
  $$\text{Max Loss} = S_0 - C \quad (\text{occurs if stock drops to } S_T = 0)$$
- **Breakeven Stock Price**:
  $$\text{Breakeven} = S_0 - C$$
- **Downside Cushion**:
  $$\text{Downside Cushion \%} = \frac{C}{S_0} \times 100\%$$
- **Max Return on Investment (ROI)**:
  $$\text{Max ROI \%} = \frac{(K - S_0) + C}{S_0 - C} \times 100\%$$

---

## 3. Repository Structure

```
├── backend/
│   ├── main.py             # Complete FastAPI application with CORS and yfinance
│   ├── models.py           # Pydantic schemas (Quote, Payoff, CalculateRequest)
│   ├── strategies.py       # Pluggable modular strategy engine (BaseStrategy)
│   ├── test_main.py        # Pytest test suite for Covered Call payoff mathematics
│   ├── test_unittest.py    # Standard library unittest suite (zero dependencies)
│   └── requirements.txt    # Python backend dependencies
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Top Bar Contract header
│   │   ├── TickerSelector.tsx      # Ticker dropdown & yfinance live quote fetcher
│   │   ├── StrategyMetricsCards.tsx# Max Profit, Max Loss, Breakeven cards
│   │   ├── ParameterControls.tsx   # S_0, Strike, Premium sliders & inputs
│   │   ├── PayoffChart.tsx         # Recharts interactive curve with landmarks
│   │   ├── InteractiveSimulator.tsx# Real-time expiration scenario tester (S_T scrubber)
│   │   ├── StrategySelector.tsx    # Modular strategy switcher
│   │   └── EducationalModal.tsx    # Formula & proof inspection modal
│   ├── types/
│   │   └── options.ts              # TypeScript interfaces
│   ├── utils/
│   │   └── optionsMath.ts          # Exact client-side mathematical model
│   ├── __tests__/
│   │   └── CoveredCall.test.tsx    # Vitest / React Testing Library component tests
│   ├── App.tsx                     # Main layout & state orchestrator
│   └── index.css                   # Tailwind CSS styles
├── server.ts                       # Full-stack Node/Express dev & production server
├── main.py                         # Root entry point for FastAPI backend
├── package.json                    # Frontend & fullstack scripts and dependencies
├── vitest.config.ts                # Vitest testing configuration
└── README.md                       # System architecture and documentation
```

---

## 4. Local Setup & Running Instructions

### Prerequisites
- **Node.js** (v18 or higher) and `npm`
- **Python** (v3.10 or higher) and `pip` (optional, for standalone FastAPI backend)

---

### Option A: Full-Stack Mode (Recommended)
This runs the full interactive application on port `3000` with the complete API proxy and live market data.

1. **Install Frontend & Server Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

### Option B: Running the Standalone FastAPI Backend
You can also run the Python FastAPI backend directly:

1. **Navigate to the Backend & Install Requirements**:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Run FastAPI with Uvicorn**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Interactive Swagger API docs will be available at: `http://localhost:8000/docs`.

---

## 5. Executing the Test Suites

### 1. Backend Mathematical Tests (Pytest)
Verifies Covered Call payoff logic at expiration prices below strike ($S_T < K$), at strike ($S_T = K$), well above strike ($S_T > K$), at zero ($S_T = 0$), and at breakeven ($S_0 - C$):
```bash
pytest backend/test_main.py -v
```

### 2. Backend Standard Library Unittest (Zero External Dependencies)
Runs in any standard Python environment without needing `pip` packages:
```bash
python3 -m unittest backend/test_unittest.py -v
```

### 3. Frontend Component & Math Tests (Vitest + React Testing Library)
Verifies component rendering, state updates, metric cards, and calculator math:
```bash
npm run test
```

---

## 6. API Reference

### `GET /api/quote/{ticker}`
Fetches market data for a given ticker symbol using `yfinance`.
- **Response**:
  ```json
  {
    "ticker": "AAPL",
    "price": 232.15,
    "change": 1.85,
    "change_percent": 0.80,
    "currency": "USD",
    "company_name": "Apple Inc.",
    "suggested_strike": 240.00,
    "suggested_premium": 5.50,
    "timestamp": "2026-10-12T16:45:00Z"
  }
  ```

### `POST /api/calculate`
Calculates payoff curves and metrics for the specified options strategy.
- **Request Body**:
  ```json
  {
    "strategy_id": "covered_call",
    "current_price": 100.0,
    "strike_price": 105.0,
    "premium": 3.5,
    "price_range_pct": 25.0,
    "num_points": 60,
    "contract_size": 100
  }
  ```
- **Response**:
  ```json
  {
    "strategy_id": "covered_call",
    "strategy_name": "Covered Call",
    "current_price": 100.0,
    "strike_price": 105.0,
    "premium": 3.5,
    "metrics": {
      "max_profit_per_share": 8.5,
      "max_profit_total": 850.0,
      "max_loss_per_share": 96.5,
      "max_loss_total": 9650.0,
      "breakeven_price": 96.5,
      "max_roi_pct": 8.81,
      "downside_cushion_pct": 3.5,
      "assignment_threshold": 105.0,
      "net_debit_per_share": 96.5
    },
    "points": [ ... ]
  }
  ```

### `GET /api/strategies`
Returns the catalog of available and roadmap strategy modules.

---

## 7. Scalability & Adding New Strategies

The backend uses the **Strategy Pattern**:
1. Subclass `BaseStrategy` in `backend/strategies.py`.
2. Implement `get_definition()` and `calculate(req: StrategyCalculateRequest)`.
3. Register the strategy in `StrategyRegistry._strategies`.
4. The API endpoints (`/api/strategies` and `/api/calculate`) instantly support the new strategy without changing core routing or controller logic.

---

## 8. Production Build

To build the optimized static bundle:
```bash
npm run build
```
To run the production server:
```bash
NODE_ENV=production node server.ts
```
