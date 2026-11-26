'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout';
import { usePortfolio, useDecisions, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Position, AgentDecision } from '@/types';

export default function RiskManagementPage() {
  const { portfolio, portfolioConfig } = usePortfolio();
  const { decisions } = useDecisions();
  const { wsConnected } = useWebSocket();

  const positions = portfolio?.openPositions || [];
  const totalInvested = positions.reduce((sum, p) => sum + p.sol_invested, 0);
  const portfolioValue = portfolioConfig ? portfolioConfig.balance + totalInvested : 0;
  const exposurePct = portfolioValue > 0 ? (totalInvested / portfolioValue) * 100 : 0;
  const availableSlots = (portfolioConfig?.max_positions || 3) - positions.length;
  const maxAllocPerPosition = portfolioConfig?.max_alloc || 0.1;
  const stopLoss = portfolioConfig?.stop_loss || 0.15;
  const takeProfit = portfolioConfig?.take_profit || 0.3;

  // Risk decisions (REJECT recommendations)
  const riskDecisions = decisions.filter(d => d.agent === 'Risk Manager' || d.recommendation === 'REJECT');

  // Check for stop loss / take profit triggers
  const atRiskPositions = positions.filter(p => {
    if (p.unrealized_pnl_pct === undefined) return false;
    return p.unrealized_pnl_pct <= -stopLoss * 100 || p.unrealized_pnl_pct >= takeProfit * 100;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Risk Management</h1>
            <p className="text-hive-textDim mt-1">Portfolio risk controls, exposure limits, and veto authority</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
              <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
              <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
                {wsConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Status Banner */}
        <div className={clsx(
          'rounded-2xl p-5 border',
          atRiskPositions.length > 0 
            ? 'bg-red/10 border-red/30' 
            : exposurePct > 80 
              ? 'bg-yellow/10 border-yellow/30' 
              : 'bg-green/10 border-green/30'
        )}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', 
                atRiskPositions.length > 0 ? 'bg-red/20' : 
                exposurePct > 80 ? 'bg-yellow/20' : 'bg-green/20'
              )}>
                {atRiskPositions.length > 0 ? (
                  <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 9v4M12 17h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : exposurePct > 80 ? (
                  <svg className="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-hive-text">
                  {atRiskPositions.length > 0 
                    ? `${atRiskPositions.length} Position${atRiskPositions.length > 1 ? 's' : ''} at Risk Threshold`
                    : exposurePct > 80 
                      ? 'High Portfolio Exposure'
                      : 'Portfolio Within Risk Limits'}
                </p>
                <p className="text-hive-textDim text-sm mt-1">
                  {atRiskPositions.length > 0
                    ? 'Stop loss or take profit levels triggered'
                    : exposurePct > 80
                      ? `${exposurePct.toFixed(1)}% of portfolio allocated`
                      : 'All risk parameters within limits'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium">
                View Alerts
              </button>
              <button className="bg-gradient-to-r from-cyan to-purple px-4 py-2 rounded-xl text-hive-bg font-medium hover:opacity-90 transition-opacity">
                Emergency Stop
              </button>
            </div>
          </div>
        </div>

        {/* Risk Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Portfolio Exposure</p>
                <p className={clsx('text-2xl font-bold font-mono mt-1', exposurePct > 80 ? 'text-yellow' : 'text-gradient-cyan')}>
                  {exposurePct.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Open Positions</p>
                <p className="text-2xl font-bold font-mono text-gradient-purple mt-1">
                  {positions.length} / {portfolioConfig?.max_positions || 3}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
                  <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Available Slots</p>
                <p className={clsx('text-2xl font-bold font-mono mt-1', availableSlots === 0 ? 'text-red' : 'text-green')}>
                  {availableSlots}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Available Balance</p>
                <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">
                  {portfolioConfig?.balance.toFixed(4) || '0'} SOL
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="1.5" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-4" strokeWidth="1.5" />
                  <path d="M3 11h18" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Rules */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Risk Rules Configuration</h3>
            <span className="text-hive-textDim text-xs font-mono">Active Rules: 4</span>
          </div>
          <div className="p-6 space-y-4">
            <RiskRuleCard 
              title="Max Positions" 
              description="Maximum concurrent open positions"
              value={`${portfolioConfig?.max_positions || 3}`}
              status="active"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" /><rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" /></svg>}
            />
            <RiskRuleCard 
              title="Max Allocation per Position" 
              description="Maximum percentage of portfolio per single position"
              value={`${Math.round((portfolioConfig?.max_alloc || 0.1) * 100)}%`}
              status="active"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            />
            <RiskRuleCard 
              title="Stop Loss" 
              description="Automatic exit when position loses this percentage"
              value={`${Math.round((portfolioConfig?.stop_loss || 0.15) * 100)}%`}
              status="active"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9v4M12 17h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
            <RiskRuleCard 
              title="Take Profit" 
              description="Automatic exit when position gains this percentage"
              value={`${Math.round((portfolioConfig?.take_profit || 0.3) * 100)}%`}
              status="active"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            />
          </div>
        </div>

        {/* Risk Decisions / Vetoes */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Risk Manager Vetoes</h3>
            <span className="text-hive-textDim text-xs font-mono">{riskDecisions.length} vetoes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                  <th className="px-5 py-3 text-center text-hive-textDim text-xs font-mono uppercase tracking-wider">Action</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Confidence</th>
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Reason</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-border/30">
                {riskDecisions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-hive-textDim">
                      No risk vetoes recorded. Risk Manager approves all analyzed trades.
                    </td>
                  </tr>
                ) : (
                  riskDecisions.slice(0, 20).map((decision) => (
                    <tr key={decision.id} className="hover:bg-hive-bgCardHover/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-hive-textDim text-xs truncate max-w-[100px]">{decision.mint.slice(0, 12)}...</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-mono bg-red/20 text-red">VETOED</span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-hive-text tabular-nums">
                        {(decision.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="px-5 py-3 text-hive-textDim text-sm truncate max-w-[300px]">{decision.findings}</td>
                      <td className="px-5 py-3 text-right font-mono text-hive-textDim text-xs">{new Date(decision.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Position Risk Monitor */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Position Risk Monitor</h3>
            <span className="text-hive-textDim text-xs font-mono">{positions.length} positions monitored</span>
          </div>
          <div className="p-6">
            {positions.length === 0 ? (
              <div className="text-center text-hive-textDim py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-hive-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
                  <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
                </svg>
                <p>No open positions to monitor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map((position) => {
                  const pnlPct = position.unrealized_pnl_pct || 0;
                  const isStopLoss = pnlPct <= -15;
                  const isTakeProfit = pnlPct >= 30;
                  const riskLevel = isStopLoss ? 'critical' : isTakeProfit ? 'profit' : Math.abs(pnlPct) > 10 ? 'warning' : 'safe';
                  
                  return (
                    <div className={clsx('glass rounded-xl p-4 border', 
                      riskLevel === 'critical' ? 'border-red/30 bg-red/5' :
                      riskLevel === 'profit' ? 'border-green/30 bg-green/5' :
                      riskLevel === 'warning' ? 'border-yellow/30 bg-yellow/5' : 'border-hive-border/50'
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={clsx('w-2 h-2 rounded-full', 
                            riskLevel === 'critical' ? 'bg-red animate-pulse' :
                            riskLevel === 'profit' ? 'bg-green' :
                            riskLevel === 'warning' ? 'bg-yellow animate-pulse' : 'bg-green'
                          )} />
                          <div>
                            <p className="font-medium text-hive-text">{position.mint.slice(0, 8)}...</p>
                            <p className="text-hive-textDim text-xs font-mono">{position.qty.toFixed(4)} @ ${position.entry_price.toFixed(6)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={clsx('font-mono font-semibold', 
                              position.unrealized_pnl !== undefined && position.unrealized_pnl >= 0 ? 'text-green' : 'text-red'
                            )}>
                              {position.unrealized_pnl !== undefined ? (position.unrealized_pnl >= 0 ? '+' : '') + position.unrealized_pnl.toFixed(4) : '—'} SOL
                            </p>
                            <p className={clsx('text-xs font-mono', 
                              position.unrealized_pnl_pct !== undefined && position.unrealized_pnl_pct >= 0 ? 'text-green' : 'text-red'
                            )}>
                              {position.unrealized_pnl_pct !== undefined ? (position.unrealized_pnl_pct >= 0 ? '+' : '') + position.unrealized_pnl_pct.toFixed(2) : '—'}%
                            </p>
                          </div>
                          <span className={clsx('px-3 py-1 rounded-full text-xs font-mono',
                            riskLevel === 'critical' ? 'bg-red/20 text-red' :
                            riskLevel === 'profit' ? 'bg-green/20 text-green' :
                            riskLevel === 'warning' ? 'bg-yellow/20 text-yellow' : 'bg-hive-border/50 text-hive-textDim'
                          )}>
                            {riskLevel === 'critical' ? 'STOP LOSS' : riskLevel === 'profit' ? 'TAKE PROFIT' : riskLevel === 'warning' ? 'WARNING' : 'SAFE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function RiskRuleCard({ title, description, value, status, icon }: { 
  title: string; 
  description: string; 
  value: string; 
  status: 'active' | 'inactive'; 
  icon: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-4 border border-hive-border/50 hover:border-cyan/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center flex-shrink-0 text-cyan">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-hive-text">{title}</h4>
            <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-mono',
              status === 'active' ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
            )}>
              {status.toUpperCase()}
            </span>
          </div>
          <p className="text-hive-textDim text-sm mb-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold font-mono text-gradient-cyan">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}