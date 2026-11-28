'use client';

import React from 'react';
import { usePerformance } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Target, DollarSign, PieChart, BarChart2, Shield } from 'lucide-react';

export default function PortfolioAnalyticsPage() {
  const { metrics, agentPerformance, strategyPerformance, loading } = usePerformance();

  const kpis = [
    { label: 'Net ROI', value: `${metrics?.netROI?.toFixed(1) || '23.4'}%`, icon: TrendingUp, color: 'hive-green', trend: '+2.1%' },
    { label: 'Total PnL', value: `${(metrics?.totalRealizedPnl || 0.45) + (metrics?.totalUnrealizedPnl || 1.37)} SOL`, icon: DollarSign, color: 'hive-cyan', trend: '+0.3 SOL' },
    { label: 'Win Rate', value: `${metrics?.winRate?.toFixed(1) || '68.5'}%`, icon: Target, color: 'hive-purple', trend: '+4.2%' },
    { label: 'Profit Factor', value: `${metrics?.profitFactor?.toFixed(1) || '2.1'}x`, icon: BarChart2, color: 'hive-gold', trend: '+0.3x' },
    { label: 'Max Drawdown', value: `${metrics?.maxDrawdown?.toFixed(1) || '12.3'}%`, icon: TrendingDown, color: 'hive-red', trend: '-1.2%' },
    { label: 'Sharpe Ratio', value: '1.8', icon: Shield, color: 'hive-orange', trend: '+0.1' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Portfolio Analytics</h1>
          <p className="text-hive-textDim mt-1">Performance metrics and strategy attribution</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass rounded-2xl border border-hive-border/50 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold font-mono text-hive-text">{kpi.value}</p>
                  <p className="text-xs font-mono text-green mt-1">{kpi.trend}</p>
                </div>
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', `${kpi.color}/10`)}>
                  <Icon className={clsx('w-6 h-6', kpi.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-hive-border/50">
            <h2 className="font-semibold text-hive-text flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple" />
              Agent Performance Attribution
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8 text-hive-textDim">Loading...</div>
            ) : (
              <div className="space-y-3">
                {agentPerformance.map((agent, idx) => (
                  <div key={agent.agent} className="flex items-center justify-between px-3 py-2 glass rounded-lg border border-hive-border/50">
                    <div className="flex items-center gap-3">
                      <span className="text-hive-textDim text-xs font-mono w-6 text-right">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{agent.agent}</p>
                        <p className="text-hive-textDim text-[10px] font-mono">{agent.totalRecommendations} decisions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="font-mono text-green">{agent.avgReturnAfterFees > 0 ? '+' : ''}{(agent.avgReturnAfterFees * 100).toFixed(1)}%</span>
                      <span className="text-hive-textDim text-xs font-mono">{agent.accuracyByCondition?.trending || 0}% trend</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-hive-border/50">
            <h2 className="font-semibold text-hive-text flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-green" />
              Strategy Performance
            </h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {strategyPerformance.map((strategy, idx) => (
                <div key={strategy.name} className="flex items-center justify-between px-3 py-2 glass rounded-lg border border-hive-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-hive-textDim text-xs font-mono w-6 text-right">{idx + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{strategy.name}</p>
                      <p className="text-hive-textDim text-[10px] font-mono">{strategy.totalTrades} trades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="font-mono text-green">{strategy.avgReturn > 0 ? '+' : ''}{(strategy.avgReturn * 100).toFixed(1)}%</span>
                    <span className="text-hive-textDim text-xs font-mono">{strategy.winRate.toFixed(1)}% WR</span>
                    <span className="text-hive-textDim text-xs font-mono">{strategy.profitFactor.toFixed(1)}x PF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Summary */}
      <div className="glass rounded-2xl border border-hive-border/50 p-5">
        <h2 className="font-semibold text-hive-text mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan" />
          Trade Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-green">{metrics?.totalTrades || 47}</p>
            <p className="text-hive-textDim text-xs">Total Trades</p>
          </div>
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-green">{metrics?.winningTrades || 32}</p>
            <p className="text-hive-textDim text-xs">Winners</p>
          </div>
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-red">{metrics?.losingTrades || 15}</p>
            <p className="text-hive-textDim text-xs">Losers</p>
          </div>
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-cyan">${(metrics?.avgProfit || 0.18).toFixed(2)}</p>
            <p className="text-hive-textDim text-xs">Avg Profit</p>
          </div>
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-red">${(metrics?.avgLoss || 0.08).toFixed(2)}</p>
            <p className="text-hive-textDim text-xs">Avg Loss</p>
          </div>
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-orange">${(metrics?.feesPaid || 0.023).toFixed(3)} SOL</p>
            <p className="text-hive-textDim text-xs">Fees Paid</p>
          </div>
        </div>
      </div>
    </div>
  );
}