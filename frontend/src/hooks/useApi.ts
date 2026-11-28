'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDataStore, useUIStore } from '@/store';
import type { Token, Agent, AgentDecision, Position, Portfolio, PortfolioConfig, WebSocketMessage, ValidationStatus, ValidationReport, Heartbeat, Uptime, PerformanceMetrics, AgentPerformance, StrategyPerformance, PortfolioReconciliation, Snapshot } from '@/types';

// Mock data generators for development
const generateMockTokens = (): Token[] => [
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Wrapped SOL', price: 142.50, liquidity: 50000000, updated_at: new Date().toISOString(), volume24h: 1200000000, priceChange24h: 2.3, holders: 1500000, marketCap: 68000000000 },
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', price: 1.00, liquidity: 25000000, updated_at: new Date().toISOString(), volume24h: 800000000, priceChange24h: 0.01, holders: 800000, marketCap: 28000000000 },
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xNBRDg8JnPw45t', symbol: 'BONK', name: 'Bonk', price: 0.000023, liquidity: 5000000, updated_at: new Date().toISOString(), volume24h: 150000000, priceChange24h: -5.2, holders: 650000, marketCap: 1400000000 },
  { mint: '7dHbWXydEwvJ6kZkPQdQ2rVbRqvVwN9dE8jKmP2zQwE', symbol: 'WIF', name: 'dogwifhat', price: 2.85, liquidity: 12000000, updated_at: new Date().toISOString(), volume24h: 350000000, priceChange24h: 12.7, holders: 280000, marketCap: 2800000000 },
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFjSYbKedZpDvDxJ', symbol: 'JUP', name: 'Jupiter', price: 1.23, liquidity: 8000000, updated_at: new Date().toISOString(), volume24h: 180000000, priceChange24h: 8.4, holders: 190000, marketCap: 1350000000 },
  { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7zZtZ7zZtZ7', symbol: 'mSOL', name: 'Marinade Staked SOL', price: 158.75, liquidity: 3000000, updated_at: new Date().toISOString(), volume24h: 45000000, priceChange24h: 1.8, holders: 45000, marketCap: 1200000000 },
  { mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yY9yY9yY9yY9', symbol: 'JTO', name: 'Jito', price: 3.45, liquidity: 6000000, updated_at: new Date().toISOString(), volume24h: 95000000, priceChange24h: -2.1, holders: 120000, marketCap: 450000000 },
  { mint: 'PNTxzDfKzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZz', symbol: 'PENDLE', name: 'Pendle', price: 4.67, liquidity: 4000000, updated_at: new Date().toISOString(), volume24h: 65000000, priceChange24h: 15.3, holders: 85000, marketCap: 720000000 },
];

const generateMockAgents = (): Agent[] => [
  { id: 'token-scout', name: 'Token Scout', role: 'Market Discovery', status: 'idle', currentTask: 'Scanning new token launches', lastActivity: new Date().toISOString() },
  { id: 'rug-detector', name: 'Rug Detector', role: 'Security Analysis', status: 'idle', currentTask: 'Analyzing contract risks', lastActivity: new Date().toISOString() },
  { id: 'technical-analyst', name: 'Technical Analyst', role: 'Price Action', status: 'idle', currentTask: 'Computing technical indicators', lastActivity: new Date().toISOString() },
  { id: 'social-intelligence', name: 'Social Intelligence', role: 'Narrative Detection', status: 'idle', currentTask: 'Monitoring social sentiment', lastActivity: new Date().toISOString() },
  { id: 'strategy-analyst', name: 'Strategy Analyst', role: 'Trade Strategy', status: 'idle', currentTask: 'Evaluating trade setups', lastActivity: new Date().toISOString() },
  { id: 'risk-manager', name: 'Risk Manager', role: 'Risk Authority', status: 'idle', currentTask: 'Assessing portfolio risk', lastActivity: new Date().toISOString() },
  { id: 'execution-trader', name: 'Execution Trader', role: 'Trade Execution', status: 'idle', currentTask: 'Optimizing order routing', lastActivity: new Date().toISOString() },
  { id: 'portfolio-manager', name: 'Portfolio Manager', role: 'Portfolio Ops', status: 'idle', currentTask: 'Rebalancing positions', lastActivity: new Date().toISOString() },
  { id: 'jarvis', name: 'JARVIS', role: 'Central Intelligence', status: 'idle', currentTask: 'Coordinating hive operations', lastActivity: new Date().toISOString() },
];

const generateMockDecisions = (): AgentDecision[] => [
  { id: 1, mint: 'So11111111111111111111111111111111111111112', agent: 'Token Scout', findings: 'Strong liquidity and volume metrics', confidence: 0.87, recommendation: 'BUY', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', agent: 'Rug Detector', findings: 'Verified contract, no mint authority', confidence: 0.95, recommendation: 'BUY', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xNBRDg8JnPw45t', agent: 'Technical Analyst', findings: 'Oversold on RSI, bullish divergence', confidence: 0.72, recommendation: 'BUY', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 4, mint: '7dHbWXydEwvJ6kZkPQdQ2rVbRqvVwN9dE8jKmP2zQwE', agent: 'Social Intelligence', findings: 'Viral narrative forming on social', confidence: 0.68, recommendation: 'HOLD', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 5, mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFjSYbKedZpDvDxJ', agent: 'Strategy Analyst', findings: 'Favorable risk/reward at current levels', confidence: 0.81, recommendation: 'BUY', created_at: new Date(Date.now() - 18000000).toISOString() },
];

const generateMockPositions = (): Position[] => [
  { id: 1, mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', qty: 0.5, entry_price: 140.00, sol_invested: 0.5, status: 'open', created_at: new Date(Date.now() - 86400000).toISOString(), current_price: 142.50, unrealized_pnl: 1.25, unrealized_pnl_pct: 1.79 },
  { id: 2, mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFjSYbKedZpDvDxJ', symbol: 'JUP', qty: 1500, entry_price: 1.15, sol_invested: 1.725, status: 'open', created_at: new Date(Date.now() - 172800000).toISOString(), current_price: 1.23, unrealized_pnl: 0.12, unrealized_pnl_pct: 6.96 },
];

const generateMockPortfolio = (): Portfolio => ({
  config: { id: 1, balance: 0.9, max_positions: 10, max_alloc: 0.2, stop_loss: 0.15, take_profit: 0.5 },
  openPositions: generateMockPositions(),
});

const generateMockPerformance = (): PerformanceMetrics => ({
  totalRealizedPnl: 0.45,
  totalUnrealizedPnl: 1.37,
  netROI: 23.4,
  winRate: 68.5,
  avgProfit: 0.18,
  avgLoss: -0.08,
  maxDrawdown: 12.3,
  profitFactor: 2.1,
  totalTrades: 47,
  winningTrades: 32,
  losingTrades: 15,
  feesPaid: 0.023,
  slippageCost: 0.012,
});

const generateMockAgentPerformance = (): AgentPerformance[] => [
  { agent: 'Token Scout', totalRecommendations: 156, buyRecommendations: 89, holdRecommendations: 45, rejectRecommendations: 22, successfulPredictions: 78, failedPredictions: 11, avgReturn: 0.14, avgReturnAfterFees: 0.12, accuracyByCondition: { trending: 0.82, ranging: 0.65, volatile: 0.58 }, strategyPerformance: { momentum: 0.18, mean_reversion: 0.09 } },
  { agent: 'Rug Detector', totalRecommendations: 203, buyRecommendations: 12, holdRecommendations: 156, rejectRecommendations: 35, successfulPredictions: 198, failedPredictions: 5, avgReturn: 0.02, avgReturnAfterFees: 0.01, accuracyByCondition: { trending: 0.95, ranging: 0.98, volatile: 0.92 }, strategyPerformance: { security: 0.02 } },
  { agent: 'Technical Analyst', totalRecommendations: 134, buyRecommendations: 67, holdRecommendations: 42, rejectRecommendations: 25, successfulPredictions: 58, failedPredictions: 24, avgReturn: 0.11, avgReturnAfterFees: 0.09, accuracyByCondition: { trending: 0.78, ranging: 0.55, volatile: 0.62 }, strategyPerformance: { trend_following: 0.15, breakout: 0.08 } },
];

const generateMockStrategyPerformance = (): StrategyPerformance[] => [
  { name: 'Momentum Breakout', totalTrades: 23, winRate: 72.4, avgReturn: 0.22, maxDrawdown: 8.5, profitFactor: 2.8, sharpeRatio: 1.9 },
  { name: 'Mean Reversion', totalTrades: 31, winRate: 65.2, avgReturn: 0.11, maxDrawdown: 12.1, profitFactor: 1.7, sharpeRatio: 1.3 },
  { name: 'Trend Following', totalTrades: 18, winRate: 58.3, avgReturn: 0.31, maxDrawdown: 15.6, profitFactor: 2.3, sharpeRatio: 1.6 },
];

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solana-hive-api.onrender.com';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://solana-hive-api.onrender.com';

// Generic fetch wrapper
async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`API fetch failed for ${endpoint}:`, error);
    return null;
  }
}

// WebSocket hook
export function useWebSocket() {
  const { setWsConnected, addWsMessage, setAgents, setTokens, setDecisions, setPositions, setPortfolio } = useDataStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [wsConnected, setWsConnectedState] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setWsConnectedState(true);
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          addWsMessage(message);

          // Handle different message types
          switch (message.type) {
            case 'token_discovered':
              // Update tokens
              break;
            case 'analysis_complete':
            case 'decision_made':
              // Update decisions/agents
              break;
            case 'trade_executed':
              // Update positions/portfolio
              break;
            case 'position_update':
              // Update positions
              break;
          }
        } catch (e) {
          console.warn('Failed to parse WS message:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setWsConnectedState(false);
        console.log('WebSocket disconnected');
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
      };
    } catch (error) {
      console.warn('WebSocket connection failed:', error);
      setWsConnected(false);
      setWsConnectedState(false);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [setWsConnected, addWsMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { wsConnected, send: (msg: any) => wsRef.current?.send(JSON.stringify(msg)) };
}

// Data fetching hooks
export function useTokens() {
  const { tokens, setTokens, lastUpdate } = useDataStore();
  const [loading, setLoading] = useState(!tokens.length);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchApi<Token[]>('/api/tokens');
    if (data) {
      setTokens(data);
    } else {
      // Fallback to mock data
      setTokens(generateMockTokens());
      setError('Using mock data - API unavailable');
    }
    setLoading(false);
  }, [setTokens]);

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchTokens]);

  return { tokens, loading, error, refetch: fetchTokens };
}

export function useAgents() {
  const { agents, setAgents, updateAgentState } = useDataStore();
  const [loading, setLoading] = useState(!agents.length);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchApi<Agent[]>('/api/agents');
    if (data) {
      setAgents(data);
    } else {
      setAgents(generateMockAgents());
      setError('Using mock data - API unavailable');
    }
    setLoading(false);
  }, [setAgents]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchAgents]);

  return { agents, loading, error, refetch: fetchAgents, updateAgentState };
}

export function useDecisions() {
  const { decisions, setDecisions } = useDataStore();
  const [loading, setLoading] = useState(!decisions.length);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchApi<AgentDecision[]>('/api/decisions');
    if (data) {
      setDecisions(data);
    } else {
      setDecisions(generateMockDecisions());
      setError('Using mock data - API unavailable');
    }
    setLoading(false);
  }, [setDecisions]);

  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [fetchDecisions]);

  return { decisions, loading, error, refetch: fetchDecisions };
}

export function usePositions() {
  const { positions, setPositions } = useDataStore();
  const [loading, setLoading] = useState(!positions.length);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchApi<Position[]>('/api/positions');
    if (data) {
      setPositions(data);
    } else {
      setPositions(generateMockPositions());
      setError('Using mock data - API unavailable');
    }
    setLoading(false);
  }, [setPositions]);

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 10000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  return { positions, loading, error, refetch: fetchPositions };
}

export function usePortfolio() {
  const { portfolio, setPortfolio } = useDataStore();
  const [loading, setLoading] = useState(!portfolio);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchApi<Portfolio>('/api/portfolio');
    if (data) {
      setPortfolio(data);
    } else {
      setPortfolio(generateMockPortfolio());
      setError('Using mock data - API unavailable');
    }
    setLoading(false);
  }, [setPortfolio]);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 10000);
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
}

export function useValidation() {
  const [status, setStatus] = useState<ValidationStatus | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchValidation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, reportData] = await Promise.all([
        fetchApi<ValidationStatus>('/api/validation/status'),
        fetchApi<ValidationReport>('/api/validation/report'),
      ]);
      if (statusData) setStatus(statusData);
      if (reportData) setReport(reportData);
    } catch (e) {
      setError('Failed to fetch validation data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchValidation();
    const interval = setInterval(fetchValidation, 30000);
    return () => clearInterval(interval);
  }, [fetchValidation]);

  return { status, report, loading, error, refetch: fetchValidation };
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [strategyPerformance, setStrategyPerformance] = useState<StrategyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, agentData, strategyData] = await Promise.all([
        fetchApi<PerformanceMetrics>('/api/analytics/performance'),
        fetchApi<AgentPerformance[]>('/api/analytics/agents'),
        fetchApi<StrategyPerformance[]>('/api/analytics/strategies'),
      ]);
      if (metricsData) setMetrics(metricsData);
      else setMetrics(generateMockPerformance());
      
      if (agentData) setAgentPerformance(agentData);
      else setAgentPerformance(generateMockAgentPerformance());
      
      if (strategyData) setStrategyPerformance(strategyData);
      else setStrategyPerformance(generateMockStrategyPerformance());
    } catch (e) {
      setError('Failed to fetch performance data');
      setMetrics(generateMockPerformance());
      setAgentPerformance(generateMockAgentPerformance());
      setStrategyPerformance(generateMockStrategyPerformance());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchPerformance]);

  return { metrics, agentPerformance, strategyPerformance, loading, error, refetch: fetchPerformance };
}

export function useAnalysisCycle() {
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [uptime, setUptime] = useState<Uptime | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCycle = useCallback(async () => {
    setLoading(true);
    try {
      const [hb, up] = await Promise.all([
        fetchApi<Heartbeat>('/api/heartbeat'),
        fetchApi<Uptime>('/api/uptime'),
      ]);
      if (hb) setHeartbeat(hb);
      if (up) setUptime(up);
    } catch (e) {
      // Use mock data
      setHeartbeat({ lastHeartbeat: new Date().toISOString() });
      setUptime({ uptimeMs: Date.now() - 86400000, start: new Date(Date.now() - 86400000).toISOString(), now: new Date().toISOString() });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCycle();
    const interval = setInterval(fetchCycle, 5000);
    return () => clearInterval(interval);
  }, [fetchCycle]);

  return { heartbeat, uptime, loading, refetch: fetchCycle };
}

// Additional hooks for reconciliation and snapshots
export function useReconciliation() {
  const [reconciliation, setReconciliation] = useState<PortfolioReconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReconciliation = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchApi<PortfolioReconciliation>('/api/portfolio/reconciliation');
    if (data) {
      setReconciliation(data);
    } else {
      setError('Failed to fetch reconciliation data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReconciliation();
  }, [fetchReconciliation]);

  return { reconciliation, loading, error, refetch: fetchReconciliation };
}

export function useSnapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchApi<Snapshot[]>('/api/portfolio/snapshots');
    if (data) {
      setSnapshots(data);
    } else {
      setError('Failed to fetch snapshots');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  return { snapshots, loading, error, refetch: fetchSnapshots };
}