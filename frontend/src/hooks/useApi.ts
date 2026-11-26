import { useEffect, useCallback, useRef } from 'react';
import { api, queryKeys } from '@/lib/api';
import { useDataStore, useUIStore } from '@/store';
import type { WebSocketMessage } from '@/types';

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

export function useWebSocket() {
  const { wsConnected, setWsConnected, addWsMessage } = useDataStore();
  const { agents, updateAgentState } = useDataStore();
  const { addNotification } = useUIStore();
  const wsRef = useRef<ReturnType<typeof api.connectWebSocket> | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    try {
      await api.connectWebSocket();
      setWsConnected(true);
      
      // Listen for various WebSocket events
      const unsubscribeWelcome = api.on('welcome', (data) => {
        console.log('WS Welcome:', data);
      });

      const unsubscribeToken = api.on('token_discovered', (data: any) => {
        addNotification({ type: 'info', message: `New token discovered: ${data.symbol || data.mint}` });
      });

      const unsubscribeAnalysis = api.on('analysis_started', (data: any) => {
        if (data.agent) {
          updateAgentState(data.agent, 'analyzing', data.task);
        }
      });

      const unsubscribeAnalysisComplete = api.on('analysis_complete', (data: any) => {
        if (data.agent) {
          updateAgentState(data.agent, 'idle');
        }
      });

      const unsubscribeDecision = api.on('decision_made', (data: any) => {
        if (data.agent) {
          updateAgentState(data.agent, data.recommendation === 'REJECT' ? 'rejecting' : 'approving');
          // Reset after animation
          setTimeout(() => updateAgentState(data.agent, 'idle'), 2000);
        }
      });

      const unsubscribeTrade = api.on('trade_executed', (data: any) => {
        addNotification({ type: 'success', message: `Paper trade executed: ${data.mint}` });
      });

      const unsubscribePosition = api.on('position_update', (data: any) => {
        // Position updates will be fetched via polling
      });

      const unsubscribeRisk = api.on('risk_alert', (data: any) => {
        addNotification({ type: 'warning', message: `Risk alert: ${data.message}` });
      });

      const unsubscribeHeartbeat = api.on('heartbeat', () => {
        // Heartbeat received
      });

      // Store cleanup functions
      wsRef.current = {
        unsubscribe: () => {
          unsubscribeWelcome();
          unsubscribeToken();
          unsubscribeAnalysis();
          unsubscribeAnalysisComplete();
          unsubscribeDecision();
          unsubscribeTrade();
          unsubscribePosition();
          unsubscribeRisk();
          unsubscribeHeartbeat();
        },
      } as any;

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setWsConnected(false);
      scheduleReconnect();
    }
  }, [setWsConnected, updateAgentState, addNotification]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (wsRef.current?.unsubscribe) {
      wsRef.current.unsubscribe();
    }
    api.disconnectWebSocket();
    setWsConnected(false);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
  }, [setWsConnected]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const sendMessage = useCallback((message: any) => {
    api.sendWebSocketMessage(message);
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