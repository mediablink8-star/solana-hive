import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TabId, Agent, Token, AgentDecision, Position, Portfolio, PortfolioConfig, WebSocketMessage, SpiderNode, SpiderEdge } from '@/types';

interface UIState {
  activeTab: TabId;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notifications: Array<{ id: string; type: 'info' | 'success' | 'warning' | 'error'; message: string; timestamp: number }>;
  setActiveTab: (tab: TabId) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

interface DataState {
  tokens: Token[];
  agents: Agent[];
  decisions: AgentDecision[];
  positions: Position[];
  portfolio: Portfolio | null;
  portfolioConfig: PortfolioConfig | null;
  wsConnected: boolean;
  wsMessages: WebSocketMessage[];
  lastUpdate: number | null;
  setTokens: (tokens: Token[]) => void;
  setAgents: (agents: Agent[]) => void;
  setDecisions: (decisions: AgentDecision[]) => void;
  setPositions: (positions: Position[]) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setPortfolioConfig: (config: PortfolioConfig) => void;
  setWsConnected: (connected: boolean) => void;
  addWsMessage: (message: WebSocketMessage) => void;
  setLastUpdate: (timestamp: number) => void;
  updateAgentState: (agentId: string, state: Agent['status'], task?: string) => void;
}

interface SpiderState {
  nodes: SpiderNode[];
  edges: SpiderEdge[];
  selectedNode: string | null;
  hoveredNode: string | null;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  setNodes: (nodes: SpiderNode[]) => void;
  setEdges: (edges: SpiderEdge[]) => void;
  updateNodeState: (nodeId: string, state: SpiderNode['state'], pulseIntensity?: number) => void;
  updateEdgeIntensity: (source: string, target: string, intensity: number) => void;
  addEdgeParticle: (source: string, target: string, particle: SpiderEdge['particles'][0]) => void;
  setSelectedNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
}

// Initial spider network configuration - defined BEFORE store creation to avoid TDZ
export const INITIAL_SPIDER_NODES: SpiderNode[] = [
  {
    id: 'jarvis',
    name: 'JARVIS',
    role: 'Central Intelligence',
    position: [0, 0, 0],
    state: 'idle',
    connections: [
      'token-scout', 'rug-detector', 'technical-analyst', 'social-intelligence',
      'strategy-analyst', 'risk-manager', 'execution-trader', 'portfolio-manager'
    ],
    color: '#00e5ff',
    pulseIntensity: 1,
  },
  {
    id: 'token-scout',
    name: 'Token Scout',
    role: 'Market Discovery',
    position: [25, 15, 0],
    state: 'idle',
    connections: ['jarvis', 'rug-detector'],
    color: '#00ff88',
    pulseIntensity: 0,
  },
  {
    id: 'rug-detector',
    name: 'Rug Detector',
    role: 'Security Analysis',
    position: [25, -15, 0],
    state: 'idle',
    connections: ['jarvis', 'token-scout', 'technical-analyst'],
    color: '#ff3366',
    pulseIntensity: 0,
  },
  {
    id: 'technical-analyst',
    name: 'Technical Analyst',
    role: 'Price Action',
    position: [10, -28, 0],
    state: 'idle',
    connections: ['jarvis', 'rug-detector', 'strategy-analyst'],
    color: '#b87dff',
    pulseIntensity: 0,
  },
  {
    id: 'social-intelligence',
    name: 'Social Intelligence',
    role: 'Narrative Detection',
    position: [-10, -28, 0],
    state: 'idle',
    connections: ['jarvis', 'strategy-analyst'],
    color: '#ff8800',
    pulseIntensity: 0,
  },
  {
    id: 'strategy-analyst',
    name: 'Strategy Analyst',
    role: 'Trade Strategy',
    position: [-25, -15, 0],
    state: 'idle',
    connections: ['jarvis', 'technical-analyst', 'social-intelligence', 'risk-manager'],
    color: '#00e5ff',
    pulseIntensity: 0,
  },
  {
    id: 'risk-manager',
    name: 'Risk Manager',
    role: 'Risk Authority',
    position: [-25, 15, 0],
    state: 'idle',
    connections: ['jarvis', 'strategy-analyst', 'execution-trader'],
    color: '#ff3366',
    pulseIntensity: 0,
  },
  {
    id: 'execution-trader',
    name: 'Execution Trader',
    role: 'Trade Execution',
    position: [-10, 28, 0],
    state: 'idle',
    connections: ['jarvis', 'risk-manager', 'portfolio-manager'],
    color: '#00ff88',
    pulseIntensity: 0,
  },
  {
    id: 'portfolio-manager',
    name: 'Portfolio Manager',
    role: 'Portfolio Ops',
    position: [10, 28, 0],
    state: 'idle',
    connections: ['jarvis', 'execution-trader'],
    color: '#b87dff',
    pulseIntensity: 0,
  },
];

export const INITIAL_SPIDER_EDGES: SpiderEdge[] = [
  { source: 'jarvis', target: 'token-scout', particles: [], intensity: 0 },
  { source: 'jarvis', target: 'rug-detector', particles: [], intensity: 0 },
  { source: 'jarvis', target: 'technical-analyst', particles: [], intensity: 0 },
  { source: 'jarvis', target: 'social-intelligence', particles: [], intensity: 0 },
  { source: 'jarvis', target: 'strategy-analyst', particles: [], intensity: 0 },
  { source: 'jarvis', target: 'risk-manager', particles: [], intensity: 0 },
  { source: 'jarvis', target: 'execution-trader', particles: [], intensity: 0 },
  { source: 'jarvis', target: 'portfolio-manager', particles: [], intensity: 0 },
  { source: 'token-scout', target: 'rug-detector', particles: [], intensity: 0 },
  { source: 'rug-detector', target: 'technical-analyst', particles: [], intensity: 0 },
  { source: 'technical-analyst', target: 'strategy-analyst', particles: [], intensity: 0 },
  { source: 'social-intelligence', target: 'strategy-analyst', particles: [], intensity: 0 },
  { source: 'strategy-analyst', target: 'risk-manager', particles: [], intensity: 0 },
  { source: 'risk-manager', target: 'execution-trader', particles: [], intensity: 0 },
  { source: 'execution-trader', target: 'portfolio-manager', particles: [], intensity: 0 },
];

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'command-center',
      sidebarOpen: true,
      commandPaletteOpen: false,
      notifications: [],
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: crypto.randomUUID(), timestamp: Date.now() },
          ].slice(-50),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    { name: 'solana-hive-ui', partialize: (state) => ({ activeTab: state.activeTab, sidebarOpen: state.sidebarOpen }) }
  )
);

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      tokens: [],
      agents: [],
      decisions: [],
      positions: [],
      portfolio: null,
      portfolioConfig: null,
      wsConnected: false,
      wsMessages: [],
      lastUpdate: null,
      setTokens: (tokens) => set({ tokens, lastUpdate: Date.now() }),
      setAgents: (agents) => set({ agents, lastUpdate: Date.now() }),
      setDecisions: (decisions) => set({ decisions, lastUpdate: Date.now() }),
      setPositions: (positions) => set({ positions, lastUpdate: Date.now() }),
      setPortfolio: (portfolio) => set({ portfolio, lastUpdate: Date.now() }),
      setPortfolioConfig: (config) => set({ portfolioConfig: config, lastUpdate: Date.now() }),
      setWsConnected: (connected) => set({ wsConnected: connected }),
      addWsMessage: (message) =>
        set((state) => ({
          wsMessages: [...state.wsMessages.slice(-99), message],
        })),
      setLastUpdate: (timestamp) => set({ lastUpdate: timestamp }),
      updateAgentState: (agentId, state, task) =>
        set((s) => ({
          agents: s.agents.map((a) =>
            a.id === agentId ? { ...a, status: state, currentTask: task ?? a.currentTask } : a
          ),
        })),
    }),
    { name: 'solana-hive-data', partialize: (state) => ({}) }
  )
);

export const useSpiderStore = create<SpiderState>((set) => ({
  nodes: INITIAL_SPIDER_NODES,
  edges: INITIAL_SPIDER_EDGES,
  selectedNode: null,
  hoveredNode: null,
  cameraPosition: [0, 0, 85],
  cameraTarget: [0, 0, 0],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNodeState: (nodeId, state, pulseIntensity = 1) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, state, pulseIntensity } : n
      ),
    })),
  updateEdgeIntensity: (source, target, intensity) =>
    set((s) => ({
      edges: s.edges.map((e) =>
        e.source === source && e.target === target ? { ...e, intensity } : e
      ),
    })),
  addEdgeParticle: (source, target, particle) =>
    set((s) => ({
      edges: s.edges.map((e) =>
        e.source === source && e.target === target
          ? { ...e, particles: [...e.particles.slice(-19), particle] }
          : e
      ),
    })),
  setSelectedNode: (id) => set({ selectedNode: id }),
  setHoveredNode: (id) => set({ hoveredNode: id }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));