# Capital Allocator

The capital allocator is the strategic layer that decides how much capital each autonomous strategy receives and when to rebalance.

## Core idea

This system evaluates every strategy by performance, stability, and risk. It then allocates capital proportionally to the strategy score, ensuring that strong strategies get more capital while weak or risky strategies are limited or paused.

## Why this matters

Without a capital allocator, all capital is effectively concentrated in a single strategy. That creates fragile behavior, poor resilience, and dangerous drawdowns. The allocator is what turns a collection of autonomous trading bots into a real multi-strategy capital engine.

## Architecture

- `src/types.ts` — core structure and app contracts
- `src/scoring.ts` — strategy performance scoring
- `src/allocator.ts` — score-to-capital conversion and allocation logic
- `src/rebalance.ts` — rebalance suggestions and thresholds
- `src/risk.ts` — risk gate checks
- `src/persistence.ts` — reading and writing JSON state
- `src/index.ts` — main orchestration and loop

## Allocation model

The allocator reads strategy metrics such as:

- total trades
- win rate
- average profit
- cumulative return
- Sharpe ratio
- max drawdown
- status (active / paused / failed)

Then it:

1. Scores each strategy
2. Applies risk penalty based on drawdown and score quality
3. Converts the weighted score into a capital allocation
4. Writes the target allocation to disk
5. Rebalances periodically based on performance drift

## Usage

```bash
npm install
npm run dev
```

## Important environment variables

```bash
TOTAL_CAPITAL=1000
RISK_PROFILE=moderate
STRATEGY_METRICS_PATH=.state/strategy-metrics.json
TARGET_ALLOCATION_PATH=.state/allocations.json
LEDGER_PATH=.state/allocation-ledger.json
REBALANCE_TOLERANCE_PCT=10
MIN_STRATEGY_CAPITAL=10
ALLOCATION_INTERVAL_MS=3600000
```

## Target behavior

The capital allocator should support:

- dynamic reallocation
- risk-aware scaling
- down-weighting underperforming strategies
- preserving diversification
- logic for pause / kill switches
- gradual capital growth through successful strategies

## Next stage

This allocator is the foundation for the orchestrator layer, which will sit above the trading strategies and automatically shift capital based on health, performance, and risk.

The long-term goal is to evolve this into an autonomous economic loop where profitable agents receive more capital, weaker ones are throttled, and the system self-improves without manual intervention.
