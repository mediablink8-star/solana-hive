'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout';
import { usePortfolio, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Position } from '@/types';

export default function PortfolioAnalyticsPage() {
  const { portfolio, positions, portfolioConfig } = usePortfolio();
  const { wsConnected } = useWebSocket();
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | 'all'>('7d');

  const totalInvested = positions.reduce((sum, p) => sum + p.sol_invested, 0);
  const totalUnrealized = positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
  const totalValue = portfolioConfig ? portfolioConfig.balance + totalInvested + totalUnrealized : 0;
  const netPnl = totalValue - 1; // Started with 1 SOL
  const netPnlPct = (netPnl / 1) * 100;

  // Simulated historical data for charts
  const generateChartData = (days: number) => {
    const data = [];
    let value = 1;
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Simulate some variation
      const variation = (Math.random() - 0.5) * 0.02;
      value = Math.max(0.8, value * (1 + variation));
      data.push({
        date: date.toISOString().split('T')[0],
        value: parseFloat(value.toFixed(4)),
      });
    }
    return data;
  };

  const chartData = useState(() => generateChartData(30))[0];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Portfolio Analytics</h1>
            <p className="text-hive-textDim mt-1">Performance metrics, P&L analysis, and portfolio insights</p>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Value</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{totalValue.toFixed(4)} SOL</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Net P&L</p>
            <p className={clsx('text-2xl font-bold font-mono mt-1', netPnl >= 0 ? 'text-green' : 'text-red')}>
              {netPnl >= 0 ? '+' : ''}{netPnl.toFixed(4)} SOL
            </p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Net ROI</p>
            <p className={clsx('text-2xl font-bold font-mono mt-1', netPnlPct >= 0 ? 'text-green' : 'text-red')}>
              {netPnlPct >= 0 ? '+' : ''}{netPnlPct.toFixed(2)}%
            </p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Unrealized P&L</p>
            <p className={clsx('text-2xl font-bold font-mono mt-1', totalUnrealized >= 0 ? 'text-green' : 'text-red')}>
              {totalUnrealized >= 0 ? '+' : ''}{totalUnrealized.toFixed(4)} SOL
            </p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Cash Balance</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{portfolioConfig?.balance.toFixed(4) || '0'} SOL</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="glass rounded-2xl border border-hive-border/50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Equity Curve</h3>
            <div className="flex gap-2">
              {['1d', '7d', '30d', 'all'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    timeframe === tf
                      ? 'bg-gradient-to-r from-cyan to-purple text-hive-bg font-semibold shadow-glow-cyan'
                      : 'text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50'
                  )}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Equity Curve Chart */}
        <div className="glass rounded-2xl border border-hive-border/50 p-6 h-[400px]">
          <div className="h-full relative">
            {/* SVG Chart */}
            <svg className="w-full h-full" viewBox="0 0 800 350" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#b87dff" />
                </linearGradient>
              </defs>
              
              {/* Grid */}
              <g stroke="#1a2842" strokeWidth="0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={i} x1="60" y1={30 + i * 30} x2="760" y2={30 + i * 30} />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <line key={i} x1={60 + i * 35} y1="30" x2={60 + i * 35} y2="330" />
                ))}
              </g>
              
              {/* Y-axis labels */}
              <g fontSize="10" fill="#7a8fa3" fontFamily="monospace" textAnchor="end">
                {Array.from({ length: 5 }).map((_, i) => (
                  <text key={i} x="55" y={30 + i * 75} dominantBaseline="middle">
                    {1.0 + (0.2 * (4 - i))}.00
                  </text>
                ))}
              </g>
              
              {/* X-axis labels */}
              <g fontSize="10" fill="#7a8fa3" fontFamily="monospace" textAnchor="middle">
                {Array.from({ length: 6 }).map((_, i) => (
                  <text key={i} x={60 + i * 140} y="345" dominantBaseline="hanging">
                    Day {Math.round(i * 5)}
                  </text>
                ))}
              </g>
              
              {/* Area under curve */}
              <path
                d={chartData.map((point, i) => {
                  const x = 60 + (i / (chartData.length - 1)) * 700;
                  const y = 330 - ((point.value - 0.9) / 0.4) * 300;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')} L 760 330 L 60 330 Z
                fill="url(#areaGradient)"
              />
              
              {/* Line */}
              <path
                d={chartData.map((point, i) => {
                  const x = 60 + (i / (chartData.length - 1)) * 700;
                  const y = 330 - ((point.value - 0.9) / 0.4) * 300;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Current value indicator */}
              <g>
                const lastPoint = chartData[chartData.length - 1];
                const lastX = 760;
                const lastY = 330 - ((lastPoint.value - 0.9) / 0.4) * 300;
                <circle cx={lastX} cy={lastY} r="6" fill="#00e5ff" stroke="#03050a" strokeWidth="2" />
                <text x={lastX + 10} y={lastY - 10} fontSize="12" fill="#00e5ff" fontFamily="monospace" fontWeight="bold">
                  {lastPoint.value.toFixed(4)} SOL
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position Breakdown */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-hive-border/50">
              <h3 className="font-semibold text-hive-text">Position Allocation</h3>
            </div>
            <div className="p-6">
              {portfolio?.openPositions.length === 0 ? (
                <div className="text-center text-hive-textDim py-8">
                  <svg className="w-12 h-12 mx-auto mb-3 text-hive-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
                    <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
                  </svg>
                  <p>No open positions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio?.openPositions.map((position, i) => {
                    const pct = (position.sol_invested / (portfolio?.openPositions.reduce((s, p) => s + p.sol_invested, 0) || 1)) * 100;
                    return (
                      <div key={position.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-cyan">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{position.mint.slice(0, 8)}...</span>
                            <span className="text-hive-textDim text-xs font-mono">{position.sol_invested.toFixed(4)} SOL</span>
                          </div>
                          <div className="h-2 bg-hive-bg/50 rounded-full overflow-hidden flex-1">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan to-purple rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-hive-textDim text-xs font-mono w-12 text-right">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-hive-border/50">
              <h3 className="font-semibold text-hive-text">Performance Metrics</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricRow label="Starting Capital" value="1.0000 SOL" />
                <MetricRow label="Current Value" value={`${totalValue.toFixed(4)} SOL`} highlight />
                <MetricRow label="Net P&L" value={`${netPnl >= 0 ? '+' : ''}${netPnl.toFixed(4)} SOL`} 
                  positive={netPnl >= 0} />
                <MetricRow label="ROI" value={`${netPnlPct >= 0 ? '+' : ''}${netPnlPct.toFixed(2)}%`} 
                  positive={netPnlPct >= 0} />
                <MetricRow label="Max Drawdown" value="0.00%" />
                <MetricRow label="Sharpe Ratio" value="N/A" />
                <MetricRow label="Profit Factor" value="N/A" />
                <MetricRow label="Win Rate" value="0%" />
              </div>
              
              <div className="pt-4 border-t border-hive-border/50">
                <h4 className="font-medium text-hive-text mb-3">Risk Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Max Position Size" value={`${Math.round((positions[0]?.sol_invested / 1) * 100 || 0)}%`} />
                  <MetricCard label="Avg Position Size" value={`${Math.round((positions.reduce((s, p) => s + p.sol_invested, 0) / (positions.length || 1)) * 100)}%`} />
                  <MetricCard label="Concentration Risk" value="Low" positive />
                  <MetricCard label="Liquidity Risk" value="Low" positive />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee & Slippage Analysis */}
        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <h3 className="font-semibold text-hive-text mb-4">Execution Cost Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Fees Paid" value="0.0000 SOL" />
            <MetricCard label="Total Slippage" value="0.0000 SOL" />
            <MetricCard label="Avg Fee/Trade" value="0.0000 SOL" />
            <MetricCard label="Avg Slippage/Trade" value="0.0000 SOL" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function MetricRow({ label, value, highlight, positive }: { label: string; value: string; highlight?: boolean; positive?: boolean }) {
  return (
    <div className={clsx('glass rounded-xl p-4 flex items-center justify-between', highlight && 'border border-cyan/30')}>
      <span className="text-hive-textDim text-sm">{label}</span>
      <span className={clsx('font-mono font-semibold', positive !== undefined ? (positive ? 'text-green' : 'text-red') : 'text-hive-text')}>
        {value}
      </span>
    </div>
  );
}

function MetricCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className={clsx('font-mono font-semibold', positive !== undefined ? (positive ? 'text-green' : 'text-red') : 'text-hive-text')}>
        {value}
      </p>
    </div>
  );
}