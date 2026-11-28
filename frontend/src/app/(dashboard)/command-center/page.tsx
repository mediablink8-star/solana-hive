'use client';

import React from 'react';
import { useTokens, useAgents, useDecisions, usePortfolio, useWebSocket, usePerformance, useAnalysisCycle } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Zap, Brain, 
<<<<<<< HEAD
  Shield, Target, Heart, Wallet, Network, CheckCircle, Package 
=======
  Shield, Target, Activity, Wallet, Network, CheckCircle, Briefcase 
>>>>>>> 89ff60593bbeb9e071effc8a63565a7e9ecd3114
} from 'lucide-react';

const KPI_CARDS = [
  { label: 'Total Value', value: '0.9 SOL', change: '+2.3%', icon: DollarSign, color: 'hive-cyan', positive: true },
  { label: 'Available', value: '0.9 SOL', change: '0.0%', icon: Wallet, color: 'hive-green', positive: true },
  { label: 'Open Positions', value: '2', change: '+1', icon: Package, color: 'hive-purple', positive: true },
  { label: 'Win Rate', value: '68.5%', change: '+4.2%', icon: Target, color: 'hive-gold', positive: true },
  { label: 'Net ROI', value: '23.4%', change: '+1.8%', icon: TrendingUp, color: 'hive-green', positive: true },
  { label: 'Active Agents', value: '8/8', change: 'LIVE', icon: Users, color: 'hive-cyan', positive: true },
];

const RECENT_DECISIONS = [
  { agent: 'Token Scout', token: 'SOL', action: 'BUY', confidence: 87, time: '2m ago', color: 'hive-green' },
  { agent: 'Rug Detector', token: 'USDC', action: 'PASS', confidence: 95, time: '5m ago', color: 'hive-cyan' },
  { agent: 'Technical Analyst', token: 'BONK', action: 'BUY', confidence: 72, time: '8m ago', color: 'hive-green' },
  { agent: 'Social Intelligence', token: 'WIF', action: 'HOLD', confidence: 68, time: '12m ago', color: 'hive-orange' },
  { agent: 'Strategy Analyst', token: 'JUP', action: 'BUY', confidence: 81, time: '15m ago', color: 'hive-green' },
];

export default function CommandCenterPage() {
  const { tokens, loading: tokensLoading } = useTokens();
  const { agents, loading: agentsLoading } = useAgents();
  const { decisions, loading: decisionsLoading } = useDecisions();
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  const { wsConnected } = useWebSocket();
  const { metrics } = usePerformance();
  const { heartbeat, uptime } = useAnalysisCycle();

  const activeAgents = agents.filter(a => a.status !== 'idle').length;
  const totalValue = portfolio?.config?.balance || 0.9;
  const openPositionsCount = portfolio?.openPositions?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Command Center</h1>
          <p className="text-hive-textDim mt-1">Real-time autonomous trading intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50', wsConnected && 'border-cyan/30')}>
            <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
            <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
              {wsConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50 bg-cyan/5">
            <Zap className="w-4 h-4 text-cyan" />
            <span className="text-xs font-mono text-cyan">AUTO</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={clsx('glass rounded-2xl border p-5 transition-all hover:border-cyan/30', card.positive ? 'border-hive-border/50' : 'border-hive-border/50')}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold font-mono text-hive-text">{card.value}</p>
                  <p className={clsx('text-xs font-mono mt-1', card.positive ? 'text-green' : 'text-red')}>{card.change}</p>
                </div>
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', `${card.color}/10`)}>
                  <Icon className={clsx('w-6 h-6', card.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - System Status & Agents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Status Grid */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-hive-text flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan" />
                Agent Swarm Status
              </h2>
              <span className="text-xs font-mono text-hive-textDim">{activeAgents}/8 Active</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {agents.map((agent, idx) => {
                  const statusColors: Record<string, string> = {
                    idle: 'hive-textDim',
                    analyzing: 'hive-purple',
                    communicating: 'hive-green',
                    approving: 'hive-green',
                    rejecting: 'hive-red',
                    executing: 'hive-orange',
                  };
                  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
                    idle: CheckCircle,
                    analyzing: Brain,
                    communicating: Network,
                    approving: CheckCircle,
                    rejecting: Shield,
                    executing: Zap,
                  };
                  const StatusIcon = statusIcons[agent.status] || CheckCircle;
                  const statusColor = statusColors[agent.status] || 'hive-textDim';
                  
                  return (
                    <div key={agent.id} className={clsx('glass rounded-xl p-4 border transition-all', agent.status !== 'idle' ? 'border-cyan/30 bg-cyan/5 animate-pulse-subtle' : 'border-hive-border/50')}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', `${statusColor}/10`)}>
                          <StatusIcon className={clsx('w-5 h-5', statusColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{agent.name}</p>
                          <p className="text-[10px] text-hive-textDim truncate font-mono">{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full border', statusColor, 'border-current/50')}>
                          {agent.status.toUpperCase()}
                        </span>
                        {agent.status !== 'idle' && (
                          <span className="text-[10px] text-hive-textDim flex items-center gap-1">
                            <Heart className="w-3 h-3 text-green animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </div>
                      {agent.currentTask && (
                        <p className="text-hive-textDim text-xs mt-3 font-mono line-clamp-1">{agent.currentTask}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Decisions */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-hive-text flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple" />
                Recent Agent Decisions
              </h2>
              <span className="text-xs font-mono text-hive-textDim">{decisions.length} total</span>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {RECENT_DECISIONS.map((decision, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3 glass rounded-xl border border-hive-border/50">
                    <div className="flex items-center gap-3">
                      <div className={clsx('w-2 h-2 rounded-full', decision.color)} />
                      <div>
                        <p className="font-medium text-sm">{decision.agent}</p>
                        <p className="text-hive-textDim text-xs font-mono">{decision.token}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={clsx('text-xs font-mono px-2 py-1 rounded-full', decision.action === 'BUY' ? 'bg-green/20 text-green' : decision.action === 'HOLD' ? 'bg-yellow/20 text-yellow' : 'bg-cyan/20 text-cyan')}>
                        {decision.action}
                      </span>
                      <span className="text-hive-textDim text-xs font-mono">{decision.confidence}%</span>
                      <span className="text-hive-textDim text-[10px] font-mono">{decision.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Portfolio & Tokens */}
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-hive-text flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green" />
                Portfolio Overview
              </h2>
              <span className="text-xs font-mono text-hive-textDim">{openPositionsCount} positions</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="glass rounded-xl p-4 border border-hive-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Balance</span>
                  <span className="text-2xl font-bold font-mono text-gradient-cyan">{totalValue.toFixed(4)} SOL</span>
                </div>
                <div className="h-2 bg-hive-bg/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan to-purple rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-hive-textDim text-xs mt-2">85% deployed • 15% available</p>
              </div>
              
              {portfolio?.openPositions?.map((pos, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 glass rounded-lg border border-hive-border/50">
                  <div className="flex items-center gap-3">
                    <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', pos.unrealized_pnl && pos.unrealized_pnl > 0 ? 'bg-green/20' : 'bg-red/20')}>
                      <TrendingUp className={clsx('w-4 h-4', pos.unrealized_pnl && pos.unrealized_pnl > 0 ? 'text-green' : 'text-red')} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pos.symbol || pos.mint.slice(0, 8)}</p>
                      <p className="text-hive-textDim text-xs font-mono">{pos.qty} @ {pos.entry_price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={clsx('font-mono text-sm', pos.unrealized_pnl && pos.unrealized_pnl > 0 ? 'text-green' : 'text-red')}>
                      {pos.unrealized_pnl_pct?.toFixed(2)}%
                    </p>
                    <p className="text-hive-textDim text-[10px]">{pos.sol_invested} SOL</p>
                  </div>
                </div>
              ))}
              
              {!portfolio?.openPositions?.length && (
                <p className="text-hive-textDim text-center py-4">No open positions</p>
              )}
            </div>
          </div>

          {/* Top Tokens */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-hive-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green" />
                Top Market Movers
              </h2>
              <span className="text-xs font-mono text-hive-textDim">{tokens.length} tokens</span>
            </div>
            <div className="p-5">
              <div className="space-y-2">
                {tokens.slice(0, 8).map((token, idx) => (
                  <div key={token.mint} className="flex items-center justify-between px-3 py-2 hover:bg-hive-bgCard/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-hive-textDim text-xs font-mono w-6 text-right">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{token.symbol}</p>
                        <p className="text-hive-textDim text-[10px] font-mono">${token.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className={clsx('text-xs font-mono', token.priceChange24h && token.priceChange24h > 0 ? 'text-green' : 'text-red')}>
                        {token.priceChange24h ? `${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%` : '—'}
                      </span>
                      <span className="text-hive-textDim text-[10px] font-mono">${token.volume24h?.toLocaleString() || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-hive-text flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange" />
                System Health
              </h2>
              <span className="text-xs font-mono text-green">OPTIMAL</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-3 border border-hive-border/50">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Uptime</p>
                <p className="font-mono text-lg">{uptime ? Math.floor(uptime.uptimeMs / 86400000) : 1}d {uptime ? Math.floor((uptime.uptimeMs % 86400000) / 3600000) : 12}h</p>
              </div>
              <div className="glass rounded-xl p-3 border border-hive-border/50">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Last Heartbeat</p>
                <p className="font-mono text-lg text-green">LIVE</p>
              </div>
              <div className="glass rounded-xl p-3 border border-hive-border/50">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">API Latency</p>
                <p className="font-mono text-lg text-cyan">~45ms</p>
              </div>
              <div className="glass rounded-xl p-3 border border-hive-border/50">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">WS Status</p>
                <p className="font-mono text-lg text-green">CONNECTED</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}