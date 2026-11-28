'use client';

import React, { useState } from 'react';
import { useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';

const STRATEGY_TEMPLATES = [
  { id: 'momentum', name: 'Momentum', description: 'Trend following with RSI/MACD signals', tags: ['Trend', 'RSI', 'MACD'] },
  { id: 'mean-reversion', name: 'Mean Reversion', description: 'Bollinger Bands + RSI oversold/overbought', tags: ['Bollinger', 'RSI', 'Range'] },
  { id: 'arbitrage', name: 'Arbitrage', description: 'Cross-DEX price discrepancy detection', tags: ['DEX', 'Cross-chain', 'Low Risk'] },
  { id: 'breakout', name: 'Breakout', description: 'Volume-confirmed price breakouts', tags: ['Volume', 'Breakout', 'Momentum'] },
  { id: 'scalping', name: 'Scalping', description: 'High-frequency small profit targeting', tags: ['High Freq', 'Low TF', 'Precision'] },
  { id: 'grid', name: 'Grid Trading', description: 'Automated buy/sell grid orders', tags: ['Grid', 'Range', 'Automated'] },
];

const TABS = [
  { id: 'builder', label: 'Strategy Builder', icon: 'wrench' },
  { id: 'backtest', label: 'Backtest', icon: 'clock' },
  { id: 'templates', label: 'Templates', icon: 'file-text' },
  { id: 'deployed', label: 'Deployed', icon: 'rocket' },
];

const ICONS: Record<string, React.ReactNode> = {
  wrench: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="1.5" /></svg>,
  clock: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><polyline points="12 6 12 12 16 14" strokeWidth="1.5" /></svg>,
  'file-text': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" /><polyline points="14 2 14 8 20 8" strokeWidth="1.5" /><line x1="16" y1="13" x2="8" y2="13" strokeWidth="1.5" /><line x1="16" y1="17" x2="8" y2="17" strokeWidth="1.5" /><line x1="10" y1="9" x2="8" y2="9" strokeWidth="1.5" /></svg>,
  rocket: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c1.26-1.5.5-3.74-2-5-.74 0-1.69.15-2.5.5-.33.16-.5.5-.5.5-.34 0-.5-.34-.5-.5C7.5 6.69 6.31 8 5 8c-.47 0-.87-.14-1.2-.4-.64-.5-.4-1.5.5-2.5C5.14 5 6.5 5 6.5 5c0-.81-.5-1.5-1.2-.4C3.5 7.14 2 9.24 2 11.5c0 2.86 1.86 5.28 4.5 5.5z" strokeWidth="1.5" /><path d="M12 15v-3" strokeWidth="1.5" /></svg>,
};

function StrategyCard({ strategy, onClick }: { strategy: typeof STRATEGY_TEMPLATES[0]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-xl p-5 border border-hive-border/50 hover:border-cyan/30 hover:bg-cyan/5 transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-hive-text text-lg group-hover:text-cyan transition-colors">{strategy.name}</h3>
          <p className="text-hive-textDim text-sm mt-1">{strategy.description}</p>
        </div>
        <svg className="w-8 h-8 text-cyan/50 group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-wrap gap-2">
        {strategy.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-mono bg-hive-bg/50 border border-hive-border/50 text-hive-textDim group-hover:text-cyan group-hover:border-cyan/30 transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function StrategyLabPage() {
  const { wsConnected } = useWebSocket();
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Strategy Lab</h1>
          <p className="text-hive-textDim mt-1">Build, backtest, and deploy trading strategies</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
            <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
            <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
              {wsConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl border border-hive-border/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-hive-border/50 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan/10 to-purple/10 text-cyan border border-cyan/30'
                  : 'text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50'
              )}
            >
              <span className="flex items-center gap-1.5">{ICONS[tab.icon]} {tab.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'builder' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-hive-text mb-4">Visual Strategy Builder</h3>
                <div className="glass rounded-xl p-8 border border-hive-border/50 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-hive-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
                    <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" strokeWidth="1.5" strokeDasharray="4" />
                  </svg>
                  <p className="text-hive-textDim text-lg">Drag-and-drop strategy builder</p>
                  <p className="text-hive-textDim text-sm mt-2">Connect indicators, logic gates, and execution nodes</p>
                  <button className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan to-purple rounded-lg font-medium text-hive-bg">
                    Open Builder
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backtest' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-hive-text mb-3">Backtest Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-hive-textDim text-sm block mb-1">Strategy</label>
                      <select className="w-full glass rounded-lg px-3 py-2 text-hive-text border border-hive-border/50 focus:outline-none focus:border-cyan/30">
                        <option value="momentum">Momentum</option>
                        <option value="mean-reversion">Mean Reversion</option>
                        <option value="breakout">Breakout</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-hive-textDim text-sm block mb-1">Start Date</label>
                        <input type="date" className="w-full glass rounded-lg px-3 py-2 text-hive-text border border-hive-border/50 focus:outline-none focus:border-cyan/30" />
                      </div>
                      <div>
                        <label className="text-hive-textDim text-sm block mb-1">End Date</label>
                        <input type="date" className="w-full glass rounded-lg px-3 py-2 text-hive-text border border-hive-border/50 focus:outline-none focus:border-cyan/30" />
                      </div>
                    </div>
                    <div>
                      <label className="text-hive-textDim text-sm block mb-1">Initial Capital (SOL)</label>
                      <input type="number" defaultValue="1" className="w-full glass rounded-lg px-3 py-2 text-hive-text border border-hive-border/50 focus:outline-none focus:border-cyan/30" />
                    </div>
                    <button className="w-full bg-gradient-to-r from-cyan to-purple py-2 rounded-lg font-medium text-hive-bg">
                      Run Backtest
                    </button>
                  </div>
                </div>
                <div className="md:col-span-3 glass rounded-xl p-4">
                  <h3 className="font-semibold text-hive-text mb-3">Results Preview</h3>
                  <div className="glass rounded-lg p-8 border border-hive-border/50 text-center">
                    <p className="text-hive-textDim">Run a backtest to see equity curve, drawdown, and trade list</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-mono text-gradient-cyan">0.00%</p>
                  <p className="text-hive-textDim text-xs">Total Return</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-mono text-green">0.00%</p>
                  <p className="text-hive-textDim text-xs">Max Drawdown</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-mono text-cyan">0.00</p>
                  <p className="text-hive-textDim text-xs">Sharpe Ratio</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold font-mono text-hive-text">0</p>
                  <p className="text-hive-textDim text-xs">Total Trades</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STRATEGY_TEMPLATES.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} onClick={() => setActiveTab('builder')} />
              ))}
            </div>
          )}

          {activeTab === 'deployed' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-hive-text mb-4">Deployed Strategies</h3>
              <div className="glass rounded-xl border border-hive-border/50 p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-hive-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="1.5" />
                </svg>
                <p className="text-hive-textDim text-lg">No strategies deployed</p>
                <p className="text-hive-textDim text-sm mt-2">Deploy a strategy from the builder or templates</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}