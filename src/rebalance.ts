import type { AllocationDecision, StrategyMetrics } from './types.js';
import { allocateCapital } from './allocator.js';

export function suggestRebalance(
  strategies: StrategyMetrics[],
  currentAllocations: Record<string, number>,
  totalCapital: number,
  tolerancePct: number,
): AllocationDecision[] {
  const desired = allocateCapital(strategies, {
    totalCapital,
    riskProfile: 'moderate',
    minStrategyCapital: 10,
    rebalancingTolerancePct: tolerancePct,
  });

  return strategies.map((strategy) => {
    const current = currentAllocations[strategy.name] ?? 0;
    const recommended = desired[strategy.name] ?? 0;
    const delta = current === 0 ? 0 : ((recommended - current) / current) * 100;

    let reason = 'stable';
    if (Math.abs(delta) > tolerancePct) {
      reason = delta > 0 ? 'strong performance' : 'weak performance';
    }

    return {
      strategy: strategy.name,
      currentAllocation: current,
      recommendedAllocation: recommended,
      reason,
      adjustmentPercent: delta,
    };
  });
}
