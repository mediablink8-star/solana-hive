'use client';

import React, { useState } from 'react';
import { usePerformance } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { FlaskConical, Play, Pause, RotateCcw, BarChart2, TrendingUp, Target, Settings, Download, Plus } from 'lucide-react';

const STRATEGIES = [
  { id: 'momentum', name: 'Momentum Breakout', description: 'Buy tokens breaking above resistance with volume confirmation', status: 'active', trades: 23, winRate: 72.4, avgReturn: 22.1, maxDD: 8.5, profitFactor: 2.8, sharpe: 1.9 },
  { id: 'mean_reversion', name: 'Mean Reversion', description: 'Buy oversold tokens with RSI < 30 and bullish divergence', status: 'active', trades: 31, winRate: 65.2, avgReturn: 11.3, maxDD: 12.1, profitFactor: 1.7, sharpe: 1.3 },
  { id: 'trend_following', name: 'Trend Following', description: 'Follow established trends using EMA crossovers and ADX', status: 'paused', trades: 18, winRate: 58.3, avgReturn: 31.2, maxDD: 15.6, profitFactor: 2.3, sharpe: 1.6 },
  { id: 'scalping', name: 'High-Frequency Scalping', description: 'Quick entries/exits on 1-5m timeframes with tight stops', status: 'draft', trades: 0, winRate: 0, avgReturn: 0, maxDD: 0, profitFactor: 0, sharpe: 0 },
];

export default function StrategyLabPage() {
  const { strategyPerformance } = usePerformance();
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'backtest'>('overview');
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Strategy Lab</h1>
          <p className="text-hive-textDim mt-1">Build, backtest, and deploy trading strategies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-cyan/30 bg-cyan/5 text-cyan hover:bg-cyan/10">
          <Plus className="w-4 h-4" />
          New Strategy
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="flex border-b border-hive-border/50">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'builder', label: 'Builder', icon: Settings },
            { id: 'backtest', label: 'Backtest', icon: FlaskConical },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx('flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px', activeTab === tab.id ? 'text-cyan border-cyan' : 'text-hive-textMuted hover:text-hive-text border-transparent')}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {STRATEGIES.map((strat, idx) => (
                <div key={strat.id} className={clsx('glass rounded-xl p-5 border transition-all', strat.status === 'active' ? 'border-green/30 bg-green/5' : strat.status === 'paused' ? 'border-yellow/30 bg-yellow/5' : 'border-hive-border/50')}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-hive-text">{strat.name}</p>
                      <p className="text-hive-textDim text-xs mt-1">{strat.description}</p>
                    </div>
                    <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full',
                      strat.status === 'active' ? 'bg-green/20 text-green' :
                      strat.status === 'paused' ? 'bg-yellow/20 text-yellow' :
                      'bg-hive-border/50 text-hive-textDim'
                    )}>{strat.status.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <div className="glass rounded-lg p-2">
                      <p className="text-lg font-bold font-mono text-green">{strat.winRate.toFixed(1)}%</p>
                      <p className="text-hive-textDim text-[10px]">Win Rate</p>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-lg font-bold font-mono text-cyan">{strat.avgReturn.toFixed(1)}%</p>
                      <p className="text-hive-textDim text-[10px]">Avg Return</p>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-lg font-bold font-mono text-purple">{strat.profitFactor.toFixed(1)}x</p>
                      <p className="text-hive-textDim text-[10px]">Profit Factor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-3 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan hover:border-cyan/50 text-xs font-mono">Edit</button>
                    <button className={clsx('flex-1 px-3 py-2 rounded-lg text-xs font-mono', strat.status === 'active' ? 'bg-yellow/20 text-yellow hover:bg-yellow/30' : 'bg-green/20 text-green hover:bg-green/30')}>
                      {strat.status === 'active' ? 'Pause' : 'Start'}
                    </button>
                    <button className="px-3 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-red hover:border-red/50" title="Delete">🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Comparison */}
            <div className="glass rounded-xl border border-hive-border/50 p-5">
              <h3 className="font-semibold text-hive-text mb-4">Strategy Performance Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-hive-border/50">
                      <th className="px-4 py-2 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Strategy</th>
                      <th className="px-4 py-2 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Trades</th>
                      <th className="px-4 py-2 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Win Rate</th>
                      <th className="px-4 py-2 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Avg Return</th>
                      <th className="px-4 py-2 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Max DD</th>
                      <th className="px-4 py-2 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Profit Factor</th>
                      <th className="px-4 py-2 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Sharpe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STRATEGIES.map((strat, idx) => (
                      <tr key={strat.id} className="border-b border-hive-border/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center">
                              <FlaskConical className="w-4 h-4 text-purple" />
                            </div>
                            <div>
                              <p className="font-medium">{strat.name}</p>
                              <p className="text-hive-textDim text-xs">{strat.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{strat.trades}</td>
                        <td className="px-4 py-3 text-right font-mono text-green">{strat.winRate.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-mono text-cyan">{strat.avgReturn.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-mono text-red">{strat.maxDD.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-mono text-purple">{strat.profitFactor.toFixed(1)}x</td>
                        <td className="px-4 py-3 text-right font-mono text-orange">{strat.sharpe.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="p-6">
            <div className="glass rounded-xl border border-hive-border/50 p-6 max-w-3xl">
              <h3 className="font-semibold text-hive-text mb-6">Strategy Builder</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Strategy Name</label>
                  <input type="text" placeholder="My Custom Strategy" className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-3 text-hive-text focus:outline-none focus:border-cyan/50" />
                </div>
                <div>
                  <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Description</label>
                  <textarea rows={3} placeholder="Describe your strategy logic..." className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-3 text-hive-text focus:outline-none focus:border-cyan/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Entry Conditions</label>
                    <div className="glass rounded-lg border border-hive-border/50 p-4 min-h-[150px]">
                      <p className="text-hive-textDim text-sm">Drag indicators here...</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Exit Conditions</label>
                    <div className="glass rounded-lg border border-hive-border/50 p-4 min-h-[150px]">
                      <p className="text-hive-textDim text-sm">Drag indicators here...</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Risk Parameters</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-lg border border-hive-border/50 p-4">
                      <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-1">Position Size %</label>
                      <input type="number" value={5} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50" />
                    </div>
                    <div className="glass rounded-lg border border-hive-border/50 p-4">
                      <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-1">Stop Loss %</label>
                      <input type="number" value={15} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50" />
                    </div>
                    <div className="glass rounded-lg border border-hive-border/50 p-4">
                      <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-1">Take Profit %</label>
                      <input type="number" value={30} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50" />
                    </div>
                    <div className="glass rounded-lg border border-hive-border/50 p-4">
                      <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-1">Max Positions</label>
                      <input type="number" value={3} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-hive-border/50">
                  <button className="px-4 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan">Cancel</button>
                  <button className="px-4 py-2 bg-cyan text-hive-bg rounded-lg hover:bg-cyanGlow font-medium">Save Strategy</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backtest' && (
          <div className="p-6">
            <div className="glass rounded-xl border border-hive-border/50 p-6">
              <h3 className="font-semibold text-hive-text mb-6">Backtest Engine</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="glass rounded-lg border border-hive-border/50 p-4">
                    <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Strategy</label>
                    <select className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50">
                      <option>Momentum Breakout</option>
                      <option>Mean Reversion</option>
                      <option>Trend Following</option>
                    </select>
                  </div>
                  <div className="glass rounded-lg border border-hive-border/50 p-4">
                    <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Timeframe</label>
                    <select className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50">
                      <option>1h</option>
                      <option>4h</option>
                      <option>1d</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-lg border border-hive-border/50 p-4">
                      <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Start Date</label>
                      <input type="date" className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50" />
                    </div>
                    <div className="glass rounded-lg border border-hive-border/50 p-4">
                      <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">End Date</label>
                      <input type="date" className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50" />
                    </div>
                  </div>
                  <div className="glass rounded-lg border border-hive-border/50 p-4">
                    <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Initial Capital (SOL)</label>
                    <input type="number" value={10} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50" />
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan text-hive-bg rounded-lg hover:bg-cyanGlow font-medium">
                    <Play className="w-4 h-4" />
                    Run Backtest
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan">
                    <Download className="w-4 h-4" />
                    Export Results
                  </button>
                </div>
                <div className="lg:col-span-2 glass rounded-lg border border-hive-border/50 p-4 min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-hive-textDim">
                    <RotateCcw className="w-16 h-16 text-hive-border mx-auto mb-4" />
                    <p className="text-lg">Select a strategy and run backtest</p>
                    <p className="text-sm">Results will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}