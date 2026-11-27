import { useEffect, useCallback, useRef } from 'react';
import { api, queryKeys } from '@/lib/api';
import { useDataStore, useUIStore } from '@/store';
import type { WebSocketMessage, Snapshot } from '@/types';

export function useTokens() {
  const { tokens, setTokens, lastUpdate } = useDataStore();
  const { addNotification } = useUIStore();

  const fetchTokens = useCallback(async () => {
    try {
      const data = await api.getTokens();
      setTokens(data);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      addNotification({ type: 'error', message: 'Failed to fetch tokens' });
    }
  }, [setTokens, addNotification]);

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, [fetchTokens]);

  return { tokens, refetch: fetchTokens, lastUpdate };
}

export function useAgents() {
  const { agents, setAgents, updateAgentState } = useDataStore();
  const { addNotification } = useUIStore();

  const fetchAgents = useCallback(async () => {
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      addNotification({ type: 'error', message: 'Failed to fetch agents' });
    }
  }, [setAgents, addNotification]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  return { agents, refetch: fetchAgents, updateAgentState };
}

export function useDecisions() {
  const { decisions, setDecisions } = useDataStore();

  const fetchDecisions = useCallback(async () => {
    try {
      const data = await api.getDecisions(200);
      setDecisions(data);
    } catch (error) {
      console.error('Failed to fetch decisions:', error);
    }
  }, [setDecisions]);

  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, 5000);
    return () => clearInterval(interval);
  }, [fetchDecisions]);

  return { decisions, refetch: fetchDecisions };
}

export function usePortfolio() {
  const { portfolio, setPortfolio, positions, setPositions, portfolioConfig, setPortfolioConfig } = useDataStore();

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
      setPositions(data.openPositions);
      setPortfolioConfig(data.config);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  }, [setPortfolio, setPositions, setPortfolioConfig]);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  const paperTrade = useCallback(async (mint: string, solAmount?: number) => {
    const result = await api.paperTrade(mint, solAmount);
    await fetchPortfolio();
    return result;
  }, [fetchPortfolio]);

  const partialExit = useCallback(async (positionId: number, qty: number) => {
    const result = await api.partialExit(positionId, qty);
    await fetchPortfolio();
    return result;
  }, [fetchPortfolio]);

  const riskVeto = useCallback(async (mint: string, reason?: string) => {
    const result = await api.riskVeto(mint, reason);
    await fetchPortfolio();
    return result;
  }, [fetchPortfolio]);

  return { portfolio, positions, portfolioConfig, refetch: fetchPortfolio, paperTrade, partialExit, riskVeto };
}

export function useValidation() {
  const { addNotification } = useUIStore();

  const fetchStatus = useCallback(async () => {
    try {
      return await api.getValidationStatus();
    } catch (error) {
      console.error('Failed to fetch validation status:', error);
      return null;
    }
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      return await api.getValidationReport();
    } catch (error) {
      console.error('Failed to fetch validation report:', error);
      return null;
    }
  }, []);

  const fetchReconciliation = useCallback(async () => {
    try {
      return await api.getPortfolioReconciliation();
    } catch (error) {
      console.error('Failed to fetch reconciliation:', error);
      return null;
    }
  }, []);

  const fetchHeartbeat = useCallback(async () => {
    try {
      return await api.getHeartbeat();
    } catch (error) {
      console.error('Failed to fetch heartbeat:', error);
      return null;
    }
  }, []);

  const fetchUptime = useCallback(async () => {
    try {
      return await api.getUptime();
    } catch (error) {
      console.error('Failed to fetch uptime:', error);
      return null;
    }
  }, []);

  return { fetchStatus, fetchReport, fetchReconciliation, fetchHeartbeat, fetchUptime };
}

interface WSConnection {
  unsubscribe: () => void;
}

export function useWebSocket() {
  const { wsConnected, setWsConnected, addWsMessage } = useDataStore();
  const { agents, updateAgentState } = useDataStore();
  const { addNotification } = useUIStore();
  const wsRef = useRef<WSConnection | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Polling-only mode: WebSocket disabled for Render free tier
  // Polling in useTokens/useAgents/usePortfolio handles real-time updates
  const connect = useCallback(async () => {
    // Simulate connected state - polling handles data freshness
    setWsConnected(true);
    console.log('Polling mode active (WebSocket disabled for free tier)');
  }, [setWsConnected]);

  const scheduleReconnect = useCallback(() => {
    // No reconnect needed in polling mode
  }, []);

  const disconnect = useCallback(() => {
    setWsConnected(false);
  }, [setWsConnected]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const sendMessage = useCallback((message: any) => {
    // No-op in polling mode
  }, []);

  return { wsConnected, connect, disconnect, sendMessage };
}

export function useAnalysisCycle() {
  const { addNotification } = useUIStore();

  const runAnalysis = useCallback(async (mint: string) => {
    try {
      const result = await api.runAnalysisCycle(mint);
      addNotification({ type: 'success', message: `Analysis cycle started for ${mint}` });
      return result;
    } catch (error) {
      console.error('Failed to run analysis:', error);
      addNotification({ type: 'error', message: 'Failed to start analysis cycle' });
      throw error;
    }
  }, [addNotification]);

  return { runAnalysis };
}

export function usePerformance() {
  const fetchAgentPerformance = useCallback(async () => {
    try {
      return await api.getAgentPerformance();
    } catch (error) {
      console.error('Failed to fetch agent performance:', error);
      return [];
    }
  }, []);

  const fetchStrategyPerformance = useCallback(async () => {
    try {
      return await api.getStrategyPerformance();
    } catch (error) {
      console.error('Failed to fetch strategy performance:', error);
      return [];
    }
  }, []);

  return { fetchAgentPerformance, fetchStrategyPerformance };
}

export function useSnapshots() {
  const { setTokens } = useDataStore(); // Reuse tokens for snapshot storage or create separate
  const { addNotification } = useUIStore();

  const fetchSnapshots = useCallback(async () => {
    try {
      const data = await api.getSnapshots();
      return data;
    } catch (error) {
      console.error('Failed to fetch snapshots:', error);
      return [];
    }
  }, []);

  return { fetchSnapshots };
}