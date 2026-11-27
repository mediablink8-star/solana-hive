'use client';

import React from 'react';
import { usePortfolio, useDecisions } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Position, AgentDecision } from '@/types';

function RiskRuleCard({ title, description, value, icon }: { title: string; description: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-4 border border-hive-border/50">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center flex-shrink-0 text-cyan">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-hive-text">{title}</h4>
          <p className="text-hive-textDim text-sm mb-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold font-mono text-gradient-cyan">{value}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-green/20 text-green">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RiskManagementPage() {
  const { portfolio, positions, portfolioConfig } = usePortfolio();
  const { decisions } = useDecisions();

  const totalInvested = positions.reduce((sum, p) => sum + (p.sol_invested || 0), 0);
  const totalPortfolioValue = (portfolioConfig?.balance || 0) + totalInvested;
  const exposurePct = totalPortfolioValue > 0 ? (totalInvested / totalPortfolioValue) * 100 : 0;
  const availableBalance = portfolioConfig?.balance || 0;
  const usedSlots = positions.length;
  const maxSlots = portfolioConfig?.max_positions || 3;
  const availableSlots = maxSlots - usedSlots;

  // Risk Manager vetoes (REJECT decisions)
  const vetoes = decisions.filter(d => d.agent === 'Risk Manager' && d.recommendation === 'REJECT');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Risk Management</h1>
          <p className="text-hive-textDim mt-1">Portfolio risk controls, exposure limits, and veto authority</p>
        </div>
      </div>

      {/* Risk Status Banner */}
      <div className="glass rounded-2xl border border-hive-border/50 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-hive-text">Portfolio Within Risk Limits</p>
              <p className="text-hive-textDim text-sm mt-1">All risk parameters within limits • {vetoes.length} vetoes total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium">View Alerts</button>
            <button className="bg-gradient-to-r from-cyan to-purple px-4 py-2 rounded-xl text-hive-bg font-medium hover:opacity-90">Emergency Stop</button>
          </div>
        </div>
      </div>

      {/* Key Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-hive-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Portfolio Exposure</p>
              <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{exposurePct.toFixed(1)}%</p>
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
              <p className="text-2xl font-bold font-mono text-gradient-purple mt-1">{usedSlots} / {maxSlots}</p>
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
              <p className="text-2xl font-bold font-mono text-green mt-1">{availableSlots}</p>
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
              <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{availableBalance.toFixed(4)} SOL</p>
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

      {/* Risk Rules Configuration */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-hive-text">Risk Rules Configuration</h3>
          <span className="text-hive-textDim text-xs font-mono">Active Rules: 4</span>
        </div>
        <div className="p-6 space-y-4">
          <RiskRuleCard title="Max Positions" description="Maximum concurrent open positions" value={`${maxSlots}`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" /><rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" /></svg>} />
          <RiskRuleCard title="Max Allocation per Position" description="Maximum percentage of portfolio per single position" value={`${(portfolioConfig?.max_alloc || 0.1) * 100}%`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" /></svg>} />
          <RiskRuleCard title="Stop Loss" description="Automatic exit when position loses this percentage" value={`${(portfolioConfig?.stop_loss || 0.15) * 100}%`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9v4M12 17h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          <RiskRuleCard title="Take Profit" description="Automatic exit when position gains this percentage" value={`${(portfolioConfig?.take_profit || 0.3) * 100}%`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" /></svg>} />
        </div>
      </div>

      {/* Risk Manager Vetoes */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-hive-text">Risk Manager Vetoes</h3>
          <span className="text-hive-textDim text-xs font-mono">{vetoes.length} vetoes</span>
        </div>
        {vetoes.length === 0 ? (
          <div className="p-6 text-center text-hive-textDim">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9v4M12 17h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>No risk vetoes recorded. Risk Manager approves all analyzed trades.</p>
          </div>
        ) : (
          <div className="divide-y divide-hive-border/30 p-4 max-h-96 overflow-y-auto">
            {vetoes.slice(0, 10).map((veto) => (
              <div key={veto.id} className="px-2 py-3 hover:bg-hive-bgCardHover/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-red" />
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">Risk Manager</p>
                      <p className="text-hive-textDim text-xs font-mono truncate max-w-[200px]">{veto.mint.slice(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red/20 text-red">
                      REJECT
                    </span>
                    <span className="text-hive-textDim text-xs hidden sm:block">
                      {new Date(veto.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Position Risk Monitor */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-hive-text">Position Risk Monitor</h3>
          <span className="text-hive-textDim text-xs font-mono">{positions.length} positions monitored</span>
        </div>
        {positions.length === 0 ? (
          <div className="p-6 text-center text-hive-textDim">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
              <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
            </svg>
            <p>No open positions to monitor</p>
          </div>
        ) : (
          <div className="divide-y divide-hive-border/30 p-4">
            {positions.map((position) => {
              const pnlPct = position.unrealized_pnl_pct ?? 0;
              const isAtRisk = pnlPct <= -10; // Approaching stop loss
              const isNearTarget = pnlPct >= 20; // Approaching take profit
              
              return (
                <div key={position.id} className="px-2 py-3 hover:bg-hive-bgCardHover/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${isAtRisk ? 'bg-red animate-pulse' : isNearTarget ? 'bg-green' : 'bg-cyan'}`} />
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">{position.mint.slice(0, 12)}...</p>
                        <p className="text-hive-textDim text-xs font-mono">
                          {position.qty.toFixed(4)} @ {position.entry_price.toFixed(6)} • Invested: {position.sol_invested.toFixed(4)} SOL
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right min-w-[200px]">
                      <span className={`${pnlPct >= 0 ? 'text-green' : 'text-red'} font-mono font-semibold`}>
                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </span>
                      <div className="flex items-center gap-2">
                        {isAtRisk && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red/20 text-red">NEAR SL</span>
                        )}
                        {isNearTarget && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-green/20 text-green">NEAR TP</span>
                        )}
                        {!isAtRisk && !isNearTarget && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan/20 text-cyan">NORMAL</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}