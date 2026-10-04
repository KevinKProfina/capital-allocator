export type StrategyStatus = 'active' | 'paused' | 'failed';

export type StrategyMetrics = {
  name: string;
  totalTrades: number;
  winRate: number;
  avgProfit: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  capital: number;
  status: StrategyStatus;
  lastUpdated: string;
};

export type AllocationDecision = {
  strategy: string;
  currentAllocation: number;
  recommendedAllocation: number;
  reason: string;
  adjustmentPercent: number;
};

export type PortfolioSnapshot = {
  totalCapital: number;
  allocations: Record<string, number>;
  strategies: StrategyMetrics[];
  timestamp: string;
  expectedReturn: number;
};

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export type AllocationConfig = {
  totalCapital: number;
  riskProfile: RiskProfile;
  minStrategyCapital: number;
  rebalancingTolerancePct: number;
};

export type StrategyEvaluation = {
  strategy: string;
  score: number;
  expectedReturn: number;
  riskWeight: number;
  rawWeight: number;
  recommendedCapital: number;
};
