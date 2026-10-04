import { evaluateStrategyPerformance, expectedReturnFromStrategy, recommendationWeight } from './scoring.js';
import type { AllocationConfig, StrategyEvaluation, StrategyMetrics } from './types.js';

export function scoreStrategy(strategy: StrategyMetrics, config: AllocationConfig): StrategyEvaluation {
  const score = evaluateStrategyPerformance(strategy);
  const riskWeight = strategy.maxDrawdown > 0.3 ? 0.6 : strategy.maxDrawdown > 0.2 ? 0.8 : 1;
  const expectedReturn = expectedReturnFromStrategy(strategy);
  const rawWeight = recommendationWeight(score, config.riskProfile) * riskWeight;

  return {
    strategy: strategy.name,
    score,
    expectedReturn,
    riskWeight,
    rawWeight,
    recommendedCapital: 0,
  };
}

export function calculatePortfolioWeights(strategies: StrategyMetrics[], config: AllocationConfig): StrategyEvaluation[] {
  const weighted = strategies.map((strategy) => scoreStrategy(strategy, config));
  const totalWeight = weighted.reduce((sum, item) => sum + item.rawWeight, 0) || 1;

  return weighted.map((item) => {
    const capital = (item.rawWeight / totalWeight) * config.totalCapital;
    return {
      ...item,
      recommendedCapital: Math.max(config.minStrategyCapital, capital),
    };
  });
}

export function allocateCapital(strategies: StrategyMetrics[], config: AllocationConfig): Record<string, number> {
  const evaluations = calculatePortfolioWeights(strategies, config);
  const total = evaluations.reduce((sum, item) => sum + item.recommendedCapital, 0) || 1;

  const result: Record<string, number> = {};
  for (const evaluation of evaluations) {
    const proportion = total === 0 ? 0 : evaluation.recommendedCapital / total;
    result[evaluation.strategy] = config.totalCapital * proportion;
  }

  const fallbackTotal = Object.values(result).reduce((sum, value) => sum + value, 0);
  if (fallbackTotal > 0 && Math.abs(fallbackTotal - config.totalCapital) > 0.001) {
    const diff = config.totalCapital - fallbackTotal;
    const lastStrategy = evaluations.at(-1)?.strategy;
    if (lastStrategy) {
      result[lastStrategy] = (result[lastStrategy] ?? 0) + diff;
    }
  }

  return result;
}

export function calculateExpectedReturn(strategies: StrategyMetrics[]): number {
  if (strategies.length === 0) return 0;
  const total = strategies.reduce((sum, strategy) => sum + strategy.totalReturn, 0);
  return (total / strategies.length) * 100;
}
