export function normalizeWinRate(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizeDrawdown(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function evaluateStrategyPerformance(
  strategy: {
    totalReturn: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    status: 'active' | 'paused' | 'failed';
  },
): number {
  let score = 0;

  if (strategy.totalReturn > 0.5) score += 35;
  else if (strategy.totalReturn > 0.2) score += 25;
  else if (strategy.totalReturn > 0.05) score += 15;
  else if (strategy.totalReturn > 0) score += 8;

  if (strategy.winRate > 0.7) score += 25;
  else if (strategy.winRate > 0.6) score += 18;
  else if (strategy.winRate > 0.5) score += 10;

  if (strategy.sharpeRatio > 2) score += 20;
  else if (strategy.sharpeRatio > 1) score += 12;
  else if (strategy.sharpeRatio > 0.5) score += 7;

  if (strategy.maxDrawdown > 0.3) score -= 20;
  else if (strategy.maxDrawdown > 0.2) score -= 12;
  else if (strategy.maxDrawdown > 0.1) score -= 6;

  if (strategy.status === 'failed') score = 0;
  if (strategy.status === 'paused') score *= 0.5;

  return clamp(score, 0, 100);
}

export function expectedReturnFromStrategy(strategy: { totalReturn: number; winRate: number; sharpeRatio: number }): number {
  return (strategy.totalReturn * 100) + (strategy.winRate * 25) + (strategy.sharpeRatio * 5);
}

export function recommendationWeight(strategyScore: number, riskProfile: 'conservative' | 'moderate' | 'aggressive'): number {
  const factorMap = {
    conservative: 0.75,
    moderate: 1,
    aggressive: 1.25,
  };

  return strategyScore * factorMap[riskProfile];
}
