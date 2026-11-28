'use client';

import React from 'react';
import { usePortfolio } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { Shield, AlertTriangle, Target, BarChart2, Settings, SlidersHorizontal } from 'lucide-react';

export default function RiskManagementPage() {
  const { portfolio } = usePortfolio();
  const config = portfolio?.config;

  const riskMetrics = [
    { label: 'Portfolio VaR (95%)', value: '2.3%', threshold: '< 5%', status: 'safe', icon: Shield },
    { label: 'Max Position Size', value: '18.5%', threshold: '< 20%', status: 'safe', icon: Target },
    { label: 'Correlation Risk', value: '0.34', threshold: '< 0.7', status: 'safe', icon: BarChart2 },
    { label: 'Leverage Ratio', value: '1.0x', threshold: '< 2.0x', status: 'safe', icon: Settings },
    { label: 'Liquidity Buffer', value: '15%', threshold: '> 10%', status: 'safe', icon: Shield },
    { label: 'Stop Loss Triggered', value: '0', threshold: '0', status: 'safe', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Risk Management</h1>
          <p className="text-hive-textDim mt-1">Portfolio risk controls and exposure limits</p>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          const statusColors = { safe: 'text-green bg-green/10 border-green/20', warning: 'text-yellow bg-yellow/10 border-yellow/20', danger: 'text-red bg-red/10 border-red/20' };
          return (
            <div key={idx} className="glass rounded-2xl border border-hive-border/50 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', statusColors[metric.status])}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full', metric.status === 'safe' ? 'bg-green/20 text-green' : metric.status === 'warning' ? 'bg-yellow/20 text-yellow' : 'bg-red/20 text-red')}>
                  {metric.status.toUpperCase()}
                </span>
              </div>
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">{metric.label}</p>
              <p className="text-2xl font-bold font-mono text-hive-text mb-1">{metric.value}</p>
              <p className="text-hive-textDim text-xs">Threshold: {metric.threshold}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h2 className="font-semibold text-hive-text flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-cyan" />
              Risk Parameters
            </h2>
          </div>
          <div className="p-5 space-y-6">
            <div>
              <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Max Positions</label>
              <div className="flex items-center gap-4">
                <input type="range" min="1" max="20" value={config?.max_positions || 10} className="flex-1 accent-cyan" />
                <span className="text-lg font-bold font-mono text-cyan w-12 text-right">{config?.max_positions || 10}</span>
              </div>
            </div>
            <div>
              <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Max Allocation per Position</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0.05" max="0.5" step="0.05" value={config?.max_alloc || 0.2} className="flex-1 accent-cyan" />
                <span className="text-lg font-bold font-mono text-cyan w-16 text-right">{(config?.max_alloc || 0.2) * 100}%</span>
              </div>
            </div>
            <div>
              <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Stop Loss</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0.05" max="0.3" step="0.01" value={config?.stop_loss || 0.15} className="flex-1 accent-cyan" />
                <span className="text-lg font-bold font-mono text-cyan w-16 text-right">{(config?.stop_loss || 0.15) * 100}%</span>
              </div>
            </div>
            <div>
              <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Take Profit</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0.2" max="1.0" step="0.05" value={config?.take_profit || 0.5} className="flex-1 accent-cyan" />
                <span className="text-lg font-bold font-mono text-cyan w-16 text-right">{(config?.take_profit || 0.5) * 100}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-hive-border/50">
            <h2 className="font-semibold text-hive-text flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange" />
              Risk Alerts
            </h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              <div className="glass rounded-xl p-4 border border-hive-border/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green" />
                </div>
                <div>
                  <p className="font-medium text-hive-text">All risk parameters within limits</p>
                  <p className="text-hive-textDim text-xs">Last checked: 2 minutes ago</p>
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-hive-border/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green" />
                </div>
                <div>
                  <p className="font-medium text-hive-text">Position concentration healthy</p>
                  <p className="text-hive-textDim text-xs">Largest position: 18.5% (SOL)</p>
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-hive-border/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-green" />
                </div>
                <div>
                  <p className="font-medium text-hive-text">Correlation risk minimal</p>
                  <p className="text-hive-textDim text-xs">Average correlation: 0.34</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}