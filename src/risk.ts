import { clamp } from './scoring.js';
import type { StrategyMetrics } from './types.js';

export type RiskGateResult = {
  allowed: boolean;
  score: number;
  reasons: string[];
};

export function evaluateRiskGate(strategy: StrategyMetrics): RiskGateResult {
  let score = 100;
  const reasons: string[] = [];

  if (strategy.maxDrawdown > 0.35) {
    score -= 35;
    reasons.push('drawdown exceeds threshold');
  }

  if (strategy.winRate < 0.45) {
    score -= 20;
    reasons.push('win rate is weak');
  }

  if (strategy.sharpeRatio < 0.4) {
    score -= 20;
    reasons.push('sharpe is poor');
  }

  if (strategy.status === 'failed') {
    score = 0;
    reasons.push('strategy failed');
  }

  if (strategy.status === 'paused') {
    score *= 0.5;
    reasons.push('strategy paused');
  }

  const allowed = score >= 55;
  return {
    allowed,
    score: clamp(score, 0, 100),
    reasons,
  };
}
