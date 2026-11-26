import type {
  Token,
  Agent,
  AgentDecision,
  Position,
  Portfolio,
  PortfolioConfig,
  PerformanceMetrics,
  AgentPerformance,
  StrategyPerformance,
  ValidationStatus,
  ValidationReport,
  Heartbeat,
  Uptime,
  PortfolioReconciliation,
  Snapshot,
  LedgerEntry,
} from '@/types';

const API_BASE = 'https://solana-hive-api.onrender.com';
const WS_BASE = 'wss://solana-hive-api.onrender.com';

class ApiClient {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private wsListeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health & Status
  async health() {
    return this.request<{ status: string; time: string }>('/health');
  }

  // Tokens
  async getTokens(): Promise<Token[]> {
    return this.request<Token[]>('/tokens');
  }

  async scanTokens(): Promise<{ scanned: number }> {
    return this.request<{ scanned: number }>('/scan', { method: 'POST' });
  }

  async getTokenScore(mint: string) {
    return this.request<{ mint: string; score: number; breakdown: any; timestamp: string }>(`/score/${mint}`);
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    return this.request<Agent[]>('/agents');
  }

  // Decisions
  async getDecisions(limit = 200): Promise<AgentDecision[]> {
    return this.request<AgentDecision[]>(`/decisions?limit=${limit}`);
  }

  async runAnalysisCycle(mint: string) {
    return this.request<{ ok: boolean; mint: string; agents: number }>('/analysis-cycle', {
      method: 'POST',
      body: JSON.stringify({ mint }),
    });
  }

  // Portfolio
  async getPortfolio(): Promise<Portfolio> {
    return this.request<Portfolio>('/portfolio');
  }

  async getPortfolioConfig(): Promise<PortfolioConfig> {
    const portfolio = await this.getPortfolio();
    return portfolio.config;
  }

  // Paper Trading
  async paperTrade(mint: string, solAmount?: number) {
    return this.request<{
      ok: boolean;
      mint: string;
      qty: number;
      execPrice: number;
      fee: number;
      slippage: number;
    }>('/paper-trade', {
      method: 'POST',
      body: JSON.stringify({ mint, solAmount }),
    });
  }

  async partialExit(positionId: number, qty: number) {
    return this.request<{
      ok: boolean;
      positionId: number;
      qty: number;
      exitPrice: number;
      proceeds: number;
    }>('/partial-exit', {
      method: 'POST',
      body: JSON.stringify({ positionId, qty }),
    });
  }

  async riskVeto(mint: string, reason?: string) {
    return this.request<{ vetoed: boolean; mint: string }>('/risk-veto', {
      method: 'POST',
      body: JSON.stringify({ mint, reason }),
    });
  }

  // Performance
  async getAgentPerformance(): Promise<AgentPerformance[]> {
    return this.request<AgentPerformance[]>('/performance/agents');
  }

  async getStrategyPerformance(): Promise<StrategyPerformance[]> {
    return this.request<StrategyPerformance[]>('/performance/strategies');
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // This would be a new endpoint - for now compute from positions and decisions
    const portfolio = await this.getPortfolio();
    const decisions = await this.getDecisions();
    
    // Compute basic metrics
    const openPositions = portfolio.openPositions;
    let totalUnrealized = 0;
    let totalRealized = 0;
    
    // This is a placeholder - real implementation would come from backend
    return {
      totalRealizedPnl: totalRealized,
      totalUnrealizedPnl: totalUnrealized,
      netROI: portfolio.config.balance > 0 ? ((portfolio.config.balance - 1) / 1) * 100 : 0,
      winRate: 0,
      avgProfit: 0,
      avgLoss: 0,
      maxDrawdown: 0,
      profitFactor: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      feesPaid: 0,
      slippageCost: 0,
    };
  }

  // Validation
  async getValidationStatus(): Promise<ValidationStatus> {
    return this.request<ValidationStatus>('/validation/status');
  }

  async getValidationReport(): Promise<ValidationReport> {
    return this.request<ValidationReport>('/validation/report');
  }

  async getPortfolioReconciliation(): Promise<PortfolioReconciliation> {
    return this.request<PortfolioReconciliation>('/portfolio/reconciliation');
  }

  async getHeartbeat(): Promise<Heartbeat> {
    return this.request<Heartbeat>('/heartbeat');
  }

  async getUptime(): Promise<Uptime> {
    return this.request<Uptime>('/uptime');
  }

  async getSnapshots(): Promise<Snapshot[]> {
    // Would need a new endpoint
    return [];
  }

  // WebSocket
  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_BASE);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.notifyListeners(message.type, message);
          } catch (e) {
            console.error('Failed to parse WS message:', e);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connectWebSocket().catch(console.error);
    }, delay);
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.wsListeners.has(event)) {
      this.wsListeners.set(event, new Set());
    }
    this.wsListeners.get(event)!.add(callback);
    
    return () => {
      this.wsListeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(event: string, data: any) {
    this.wsListeners.get(event)?.forEach(callback => callback(data));
  }

  sendWebSocketMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export const api = new ApiClient();

// React Query keys for caching
export const queryKeys = {
  tokens: ['tokens'] as const,
  agents: ['agents'] as const,
  decisions: ['decisions'] as const,
  portfolio: ['portfolio'] as const,
  portfolioConfig: ['portfolio', 'config'] as const,
  agentPerformance: ['performance', 'agents'] as const,
  strategyPerformance: ['performance', 'strategies'] as const,
  validationStatus: ['validation', 'status'] as const,
  validationReport: ['validation', 'report'] as const,
  reconciliation: ['portfolio', 'reconciliation'] as const,
  heartbeat: ['heartbeat'] as const,
  uptime: ['uptime'] as const,
  snapshots: ['snapshots'] as const,
};