'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SpiderHive } from '@/components/SpiderHive';
import { useTokens, useAgents, useDecisions, usePortfolio, useValidation, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Token, AgentDecision, Position, Agent } from '@/types';

const AGENT_ROLES: Record<string, string> = {
  'Token Scout': 'Market Discovery',
  'Rug Detector': 'Security Analysis',
  'Technical Analyst': 'Price Action',
  'Social Intelligence': 'Narrative Detection',
  'Strategy Analyst': 'Trade Strategy',
  'Risk Manager': 'Risk Authority',
  'Execution Trader': 'Trade Execution',
  'Portfolio Manager': 'Portfolio Ops',
};

const AGENT_COLORS: Record<string, string> = {
  'Token Scout': 'hive-green',
  'Rug Detector': 'hive-red',
  'Technical Analyst': 'hive-purple',
  'Social Intelligence': 'hive-orange',
  'Strategy Analyst': 'hive-cyan',
  'Risk Manager': 'hive-red',
  'Execution Trader': 'hive-green',
  'Portfolio Manager': 'hive-purple',
};

function MetricCard({ label, value, change, trend, icon }: {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}) {
  return (
    <div className="glass p-5 rounded-2xl border border-hive-border/50 hover:border-cyan/30 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
          <p className="text-hive-text text-2xl font-bold font-mono tabular-nums">{value}</p>
          {change && (
            <p className={clsx(
              'text-xs font-mono mt-1 flex items-center gap-1',
              trend === 'up' ? 'text-green' : trend === 'down' ? 'text-red' : 'text-hive-textDim'
            )}>
              {trend === 'up' && <span className="text-green">▲</span>}
              {trend === 'down' && <span className="text-red">▼</span>}
              {trend === 'neutral' && <span className="text-hive-textDim">●</span>}
              {change}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity text-cyan">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AgentStatusCard({ agent }: { agent: Agent }) {
  const color = AGENT_COLORS[agent.name] || 'hive-cyan';
  const role = AGENT_ROLES[agent.name] || agent.role;
  
  const stateColors: Record<string, string> = {
    idle: 'hive-textDim',
    analyzing: 'hive-purple',
    communicating: 'hive-green',
    approving: 'hive-green',
    rejecting: 'hive-red',
    executing: 'hive-orange',
  };
  
  const stateLabels: Record<string, string> = {
    idle: 'IDLE',
    analyzing: 'ANALYZING',
    communicating: 'COMM',
    approving: 'APPROVE',
    rejecting: 'REJECT',
    executing: 'EXEC',
  };

  return (
    <div className="glass p-4 rounded-xl border border-hive-border/50 hover:border-current/30 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={clsx('w-2 h-2 rounded-full', color, agent.status !== 'idle' && 'animate-pulse')} />
          <div>
            <p className="font-medium text-sm">{agent.name}</p>
            <p className="text-hive-textDim text-xs">{role}</p>
          </div>
        </div>
        <span className={clsx('text-[10px] font-mono px-2 py-0.5 rounded-full border', stateColors[agent.status], 'border-current/50')}>
          {stateLabels[agent.status]}
        </span>
      </div>
      {agent.currentTask && (
        <div className="text-hive-textDim text-xs font-mono px-2 py-1.5 bg-hive-bg/50 rounded-lg border border-hive-border/30">
          {agent.currentTask}
        </div>
      )}
      {agent.latestFindings && (
        <div className="mt-3 text-hive-textMuted text-xs line-clamp-2">
          {agent.latestFindings}
        </div>
      )}
    </div>
  );
}

function RecentDecisions({ decisions }: { decisions: AgentDecision[] }) {
  const recentDecisions = decisions.slice(0, 10);
  
  return (
    <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-hive-text">Recent Decisions</h3>
        <span className="text-hive-textDim text-xs font-mono">{recentDecisions.length} decisions</span>
      </div>
      <div className="divide-y divide-hive-border/30">
        {recentDecisions.map((decision) => (
          <div key={decision.id} className="px-5 py-3 hover:bg-hive-bgCardHover/50 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className={clsx(
                  'w-2 h-2 rounded-full',
                  decision.recommendation === 'BUY' ? 'bg-green' :
                  decision.recommendation === 'REJECT' ? 'bg-red' : 'bg-yellow'
                )} />
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{decision.agent}</p>
                  <p className="text-hive-textDim text-xs font-mono truncate max-w-[200px]">{decision.mint.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className={clsx(
                  'text-xs font-mono px-2 py-0.5 rounded-full',
                  decision.recommendation === 'BUY' ? 'bg-green/20 text-green' :
                  decision.recommendation === 'REJECT' ? 'bg-red/20 text-red' : 'bg-yellow/20 text-yellow'
                )}>
                  {decision.recommendation}
                </span>
                <span className="text-hive-textDim text-xs font-mono">
                  {(decision.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-hive-textDim text-xs hidden sm:block">
                  {new Date(decision.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        {recentDecisions.length === 0 && (
          <div className="px-5 py-8 text-center text-hive-textDim">
            No decisions yet. Run an analysis cycle to see agent decisions.
          </div>
        )}
      </div>
    </div>
  );
}

function OpenPositionsList({ positions }: { positions: Position[] }) {
  if (positions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-hive-border/50 p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-hive-textDim mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
          <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
        </svg>
        <p className="text-hive-textDim">No open positions</p>
        <p className="text-hive-textDim text-xs mt-1">Execute a paper trade to open a position</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-hive-text">Open Positions</h3>
        <span className="text-hive-textDim text-xs font-mono">{positions.length} positions</span>
      </div>
      <div className="divide-y divide-hive-border/30">
        {positions.map((position) => (
          <div key={position.id} className="px-5 py-3 hover:bg-hive-bgCardHover/50 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                    <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm truncate max-w-[150px]">{position.mint.slice(0, 12)}...</p>
                  <p className="text-hive-textDim text-xs font-mono">
                    {position.qty.toFixed(4)} @ {position.entry_price.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right min-w-[200px]">
                <div className="text-hive-textDim text-xs">
                  Invested: <span className="text-hive-text font-mono">{position.sol_invested.toFixed(4)} SOL</span>
                </div>
                {position.unrealized_pnl !== undefined && (
                  <span className={clsx(
                    'text-sm font-mono font-semibold',
                    position.unrealized_pnl >= 0 ? 'text-green' : 'text-red'
                  )}>
                    {position.unrealized_pnl >= 0 ? '+' : ''}{position.unrealized_pnl.toFixed(4)} SOL
                    {' '}
                    <span className="text-xs font-normal">({position.unrealized_pnl_pct?.toFixed(2)}%)</span>
                  </span>
                )}
                <span className="text-hive-textDim text-xs hidden md:block">
                  {new Date(position.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveTokens({ tokens }: { tokens: Token[] }) {
  const topTokens = tokens.slice(0, 8);
  
  return (
    <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-hive-text">Live Scanner</h3>
        <span className="text-hive-textDim text-xs font-mono">{tokens.length} tokens</span>
      </div>
      <div className="divide-y divide-hive-border/30">
        {topTokens.map((token) => (
          <div key={token.mint} className="px-5 py-3 hover:bg-hive-bgCardHover/50 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-green">{token.symbol?.charAt(0) || '$'}</span>
                </div>
                <div>
                  <p className="font-medium text-sm truncate max-w-[150px]">{token.symbol || 'Unknown'}</p>
                  <p className="text-hive-textDim text-xs font-mono truncate max-w-[150px]">{token.mint.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right min-w-[180px]">
                <span className="font-mono text-sm tabular-nums">${token.price?.toFixed(6) || '0'}</span>
                <span className="text-hive-textDim text-xs font-mono">
                  ${(token.liquidity || 0).toLocaleString()}
                </span>
                <span className="text-hive-textDim text-xs hidden sm:block">
                  {new Date(token.updated_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        {topTokens.length === 0 && (
          <div className="px-5 py-8 text-center text-hive-textDim">
            No tokens discovered yet. Scanner runs every 30s.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommandCenterPage() {
  const { tokens } = useTokens();
  const { agents } = useAgents();
  const { decisions } = useDecisions();
  const { portfolio, positions, portfolioConfig } = usePortfolio();
  const { fetchStatus, fetchReport, fetchReconciliation } = useValidation();
  const { wsConnected } = useWebSocket();

  const [validationStatus, setValidationStatus] = React.useState<{ start: string; tokens: number; now: string } | null>(null);
  const [validationReport, setValidationReport] = React.useState<{ tokens: number; decisions: number; positions: number; generatedAt: string } | null>(null);

  React.useEffect(() => {
    const loadValidation = async () => {
      const [status, report] = await Promise.all([fetchStatus(), fetchReport()]);
      if (status) setValidationStatus(status);
      if (report) setValidationReport(report);
    };
    loadValidation();
    const interval = setInterval(loadValidation, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchReport]);

  const totalValue = portfolioConfig 
    ? portfolioConfig.balance + positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0)
    : 0;

  const dailyPnl = positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Command Center</h1>
            <p className="text-hive-textDim mt-1">Real-time AI trading operations dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
              <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
              <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
                {wsConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Portfolio Value"
            value={`${totalValue.toFixed(4)} SOL`}
            change={`${dailyPnl >= 0 ? '+' : ''}${dailyPnl.toFixed(4)} SOL today`}
            trend={dailyPnl >= 0 ? 'up' : dailyPnl < 0 ? 'down' : 'neutral'}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
          <MetricCard
            label="Available Balance"
            value={`${portfolioConfig?.balance.toFixed(4) || '0'} SOL`}
            change={`Max ${(portfolioConfig?.max_alloc || 0.1) * 100}% per position`}
            trend="neutral"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="1.5" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-4" strokeWidth="1.5" /><path d="M3 11h18" strokeWidth="1.5" /></svg>}
          />
          <MetricCard
            label="Open Positions"
            value={`${positions.length} / ${portfolioConfig?.max_positions || 3}`}
            change={positions.length >= (portfolioConfig?.max_positions || 3) ? 'Max reached' : 'Slots available'}
            trend={positions.length >= (portfolioConfig?.max_positions || 3) ? 'down' : 'neutral'}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" /><rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" /></svg>}
          />
          <MetricCard
            label="Today's Decisions"
            value={decisions.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length}
            change={decisions.length > 0 ? `${decisions.length} total` : 'No decisions yet'}
            trend="neutral"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="1.5" /></svg>}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Spider Hive */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden h-[500px] lg:h-[600px]">
              <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-hive-text">Hive Network</h3>
                <div className="flex items-center gap-2">
                  <span className="text-hive-textDim text-xs font-mono">8 Agents</span>
                  <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                </div>
              </div>
              <div className="h-full p-4">
                <SpiderHive 
                  onNodeClick={(node) => {
                    console.log('Node clicked:', node);
                    // Could open agent detail modal
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Right Column - Info Panels */}
          <div className="lg:col-span-5 space-y-6">
            {/* Agent Status */}
            <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-hive-text">Agent Status</h3>
                <span className="text-hive-textDim text-xs font-mono">{agents.length} agents</span>
              </div>
              <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {agents.map(agent => (
                  <AgentStatusCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            {/* Validation Progress */}
            <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-hive-text">7-Day Validation</h3>
                {validationStatus && (
                  <span className="text-hive-textDim text-xs font-mono">
                    Day {Math.floor((Date.now() - new Date(validationStatus.start).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                {validationStatus && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-hive-textDim">Tokens Discovered</span>
                      <span className="font-mono text-gradient-cyan">{validationStatus.tokens}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-hive-textDim">Experiment Started</span>
                      <span className="font-mono">{new Date(validationStatus.start).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
                {validationReport && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-hive-textDim">Total Decisions</span>
                      <span className="font-mono">{validationReport.decisions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-hive-textDim">Total Positions</span>
                      <span className="font-mono">{validationReport.positions}</span>
                    </div>
                  </>
                )}
                {!validationStatus && (
                  <div className="text-center text-hive-textDim py-4">Loading validation data...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Full Width Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentDecisions decisions={decisions} />
          <OpenPositionsList positions={positions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveTokens tokens={tokens} />
          
          {/* System Health */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h3 className="font-semibold text-hive-text">System Health</h3>
              <span className="text-hive-textDim text-xs font-mono">Last update: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-hive-textDim">Backend API</span>
                <span className={clsx('font-mono', wsConnected ? 'text-green' : 'text-red')}>
                  {wsConnected ? '● HEALTHY' : '● DEGRADED'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-hive-textDim">WebSocket</span>
                <span className={clsx('font-mono', wsConnected ? 'text-green' : 'text-red')}>
                  {wsConnected ? '● CONNECTED' : '● DISCONNECTED'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-hive-textDim">Database</span>
                <span className="font-mono text-green">● SYNCED</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-hive-textDim">Scanner</span>
                <span className="font-mono text-cyan">● ACTIVE (30s)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-hive-textDim">Paper Trading</span>
                <span className="font-mono text-yellow">● ENABLED</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-hive-textDim">Live Trading</span>
                <span className="font-mono text-red">● DISABLED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}