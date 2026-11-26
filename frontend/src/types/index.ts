export interface Token {
  mint: string;
  symbol: string;
  name: string;
  price: number;
  liquidity: number;
  updated_at: string;
  volume24h?: number;
  priceChange24h?: number;
  holders?: number;
  marketCap?: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'analyzing' | 'communicating' | 'approving' | 'rejecting' | 'executing';
  currentTask?: string;
  latestFindings?: string;
  lastActivity: string;
}

export interface AgentDecision {
  id: number;
  mint: string;
  agent: string;
  findings: string;
  confidence: number;
  recommendation: 'BUY' | 'HOLD' | 'REJECT';
  created_at: string;
}

export interface Position {
  id: number;
  mint: string;
  symbol?: string;
  qty: number;
  entry_price: number;
  sol_invested: number;
  status: 'open' | 'closed';
  created_at: string;
  exit_price?: number;
  exit_qty?: number;
  current_price?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
}

export interface PortfolioConfig {
  id: number;
  balance: number;
  max_positions: number;
  max_alloc: number;
  stop_loss: number;
  take_profit: number;
}

export interface Portfolio {
  config: PortfolioConfig;
  openPositions: Position[];
}

export interface PerformanceMetrics {
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  netROI: number;
  winRate: number;
  avgProfit: number;
  avgLoss: number;
  maxDrawdown: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  feesPaid: number;
  slippageCost: number;
}

export interface AgentPerformance {
  agent: string;
  totalRecommendations: number;
  buyRecommendations: number;
  holdRecommendations: number;
  rejectRecommendations: number;
  successfulPredictions: number;
  failedPredictions: number;
  avgReturn: number;
  avgReturnAfterFees: number;
  accuracyByCondition: Record<string, number>;
  strategyPerformance: Record<string, number>;
}

export interface StrategyPerformance {
  name: string;
  totalTrades: number;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  profitFactor: number;
  sharpeRatio: number;
}

export interface ValidationStatus {
  start: string;
  tokens: number;
  now: string;
}

export interface ValidationReport {
  tokens: number;
  decisions: number;
  positions: number;
  generatedAt: string;
}

export interface Heartbeat {
  lastHeartbeat: string | null;
}

export interface Uptime {
  uptimeMs: number;
  start: string;
  now: string;
}

export interface PortfolioReconciliation {
  balance: number;
  ledger: LedgerEntry[];
}

export interface LedgerEntry {
  id: number;
  type: string;
  amount: number;
  balance: number;
  created_at: string;
}

export interface Snapshot {
  id: number;
  ts: string;
  balance: number;
  tokens: number;
  positions: number;
}

export interface WebSocketMessage {
  type: 'welcome' | 'token_discovered' | 'analysis_started' | 'analysis_complete' | 'decision_made' | 'trade_executed' | 'position_update' | 'risk_alert' | 'heartbeat';
  payload: any;
  timestamp: string;
}

export interface SpiderNode {
  id: string;
  name: string;
  role: string;
  position: [number, number, number];
  state: 'idle' | 'active' | 'thinking' | 'communicating' | 'approving' | 'rejecting' | 'executing';
  connections: string[];
  color: string;
  pulseIntensity: number;
}

export interface SpiderEdge {
  source: string;
  target: string;
  particles: Particle[];
  intensity: number;
}

export interface Particle {
  id: string;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

export type TabId = 
  | 'command-center'
  | 'hive-network'
  | 'agent-hq'
  | 'live-chat'
  | 'token-scanner'
  | 'token-intelligence'
  | 'open-positions'
  | 'trade-history'
  | 'portfolio-analytics'
  | 'risk-management'
  | 'wallet'
  | 'strategy-lab'
  | 'system-logs'
  | 'validation-progress'
  | 'settings';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}