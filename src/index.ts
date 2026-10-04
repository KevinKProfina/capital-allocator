import 'dotenv/config';
import { readJson, writeJson } from './persistence.js';
import { allocateCapital, calculateExpectedReturn } from './allocator.js';
import { suggestRebalance } from './rebalance.js';
import { evaluateRiskGate } from './risk.js';
import type { AllocationConfig, StrategyMetrics } from './types.js';

const totalCapital = Number(process.env.TOTAL_CAPITAL ?? '1000');
const metricsPath = process.env.STRATEGY_METRICS_PATH ?? '.state/strategy-metrics.json';
const allocationPath = process.env.TARGET_ALLOCATION_PATH ?? '.state/allocations.json';
const ledgerPath = process.env.LEDGER_PATH ?? '.state/allocation-ledger.json';

const defaultMetrics: StrategyMetrics[] = [
  {
    name: 'solana-trader',
    totalTrades: 12,
    winRate: 0.66,
    avgProfit: 0.08,
    totalReturn: 0.22,
    sharpeRatio: 1.4,
    maxDrawdown: 0.18,
    capital: 350,
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    name: 'liquidation-hunter',
    totalTrades: 5,
    winRate: 0.8,
    avgProfit: 0.14,
    totalReturn: 0.31,
    sharpeRatio: 2.4,
    maxDrawdown: 0.12,
    capital: 300,
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    name: 'arbitrage-bot',
    totalTrades: 7,
    winRate: 0.7,
    avgProfit: 0.1,
    totalReturn: 0.18,
    sharpeRatio: 1.1,
    maxDrawdown: 0.21,
    capital: 200,
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
];

const config: AllocationConfig = {
  totalCapital,
  riskProfile: 'moderate',
  minStrategyCapital: Number(process.env.MIN_STRATEGY_CAPITAL ?? '10'),
  rebalancingTolerancePct: Number(process.env.REBALANCE_TOLERANCE_PCT ?? '10'),
};

const metrics = await readJson<StrategyMetrics[]>(metricsPath, defaultMetrics);
const currentAllocations = await readJson<Record<string, number>>(allocationPath, {
  'solana-trader': 350,
  'liquidation-hunter': 300,
  'arbitrage-bot': 200,
});

const desiredAllocations = allocateCapital(metrics, config);
const rebalance = suggestRebalance(metrics, currentAllocations, totalCapital, config.rebalancingTolerancePct);
const expectedReturn = calculateExpectedReturn(metrics);

console.log('📊 Capital allocator snapshot');
console.log(`Expected return: ${expectedReturn.toFixed(2)}%`);

for (const metric of metrics) {
  const gate = evaluateRiskGate(metric);
  console.log(`${metric.name}: risk=${gate.score} allowed=${gate.allowed}`);
}

for (const decision of rebalance) {
  console.log(`${decision.strategy}: ${decision.currentAllocation.toFixed(2)} -> ${decision.recommendedAllocation.toFixed(2)} (${decision.adjustmentPercent.toFixed(1)}%)`);
}

console.log('Desired allocation:');
for (const [strategy, amount] of Object.entries(desiredAllocations)) {
  console.log(`- ${strategy}: $${amount.toFixed(2)}`);
}

await writeJson(allocationPath, desiredAllocations);
await writeJson(ledgerPath, {
  timestamp: new Date().toISOString(),
  allocations: desiredAllocations,
  expectedReturn,
  strategies: metrics,
});
