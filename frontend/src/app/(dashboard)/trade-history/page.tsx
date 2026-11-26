'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/Layout';
import { usePortfolio, useDecisions, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Position, AgentDecision } from '@/types';

export default function TradeHistoryPage() {
  const { portfolio } = usePortfolio();
  const { decisions } = useDecisions();
  const { wsConnected } = useWebSocket();
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'partial'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

  const closedPositions = portfolio?.openPositions.filter(p => p.status === 'closed') || [];
  // In a real app, closed positions would come from a separate endpoint
  // For now we'll simulate with decisions that resulted in trades
  
  const tradeHistory = useMemo(() => {
    // Combine closed positions with executed decisions
    const trades = [
      ...(closedPositions.map(p => ({
        id: p.id,
        type: 'close' as const,
        mint: p.mint,
        symbol: p.symbol || 'UNKNOWN',
        side: 'SELL' as const,
        qty: p.exit_qty || p.qty,
        price: p.exit_price || p.entry_price,
        value: (p.exit_qty || p.qty) * (p.exit_price || p.entry_price),
        pnl: (p.exit_price || p.entry_price) - p.entry_price,
        pnlPct: p.entry_price ? (((p.exit_price || p.entry_price) - p.entry_price) / p.entry_price) * 100 : 0,
        timestamp: p.created_at,
        status: 'filled',
      })),
    ];
    return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [closedPositions]);

  const filteredTrades = useMemo(() => {
    let result = tradeHistory;
    if (filter !== 'all') {
      result = result.filter(t => t.type === filter);
    }
    return result;
  }, [tradeHistory, filter]);

  const totalPnl = tradeHistory.reduce((sum, t) => sum + (t.pnl * t.qty), 0);
  const winningTrades = tradeHistory.filter(t => t.pnl > 0).length;
  const losingTrades = tradeHistory.filter(t => t.pnl < 0).length;
  const winRate = tradeHistory.length > 0 ? (winningTrades / tradeHistory.length) * 100 : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Trade History</h1>
            <p className="text-hive-textDim mt-1">Complete paper trading history and performance</p>
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

        {/* Performance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Trades</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{tradeHistory.length}</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Win Rate</p>
            <p className="text-2xl font-bold font-mono text-green mt-1">{winRate.toFixed(1)}%</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total P&L</p>
            <p className={clsx('text-2xl font-bold font-mono mt-1', totalPnl >= 0 ? 'text-green' : 'text-red')}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(4)} SOL
            </p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Winning</p>
            <p className="text-2xl font-bold font-mono text-green mt-1">{winningTrades}</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Losing</p>
            <p className="text-2xl font-bold font-mono text-red mt-1">{losingTrades}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl border border-hive-border/50 p-4">
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'All' },
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
              { value: 'partial', label: 'Partial' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  filter === f.value
                    ? 'bg-gradient-to-r from-cyan to-purple text-hive-bg font-semibold shadow-glow-cyan'
                    : 'text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trade Table */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          {filteredTrades.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-hive-textDim mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
              </svg>
              <h3 className="text-hive-text text-lg mb-2">No Trade History</h3>
              <p className="text-hive-textDim">Execute paper trades to see history here</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                      <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                      <th className="px-5 py-3 text-center text-hive-textDim text-xs font-mono uppercase tracking-wider">Side</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Quantity</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Price</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Value</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">P&L</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">P&L %</th>
                      <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Time</th>
                      <th className="px-5 py-3 text-center text-hive-textDim text-xs font-mono uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hive-border/30">
                    {filteredTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-hive-bgCardHover/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-green">T</span>
                            </div>
                            <div>
                              <p className="font-medium text-hive-text">{trade.symbol}</p>
                              <p className="text-hive-textDim text-xs font-mono truncate max-w-[120px]">{trade.mint.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={clsx(
                            'px-3 py-1 rounded-full text-xs font-mono',
                            trade.side === 'BUY' ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
                          )}>
                            {trade.side}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">{trade.qty.toFixed(4)}</td>
                        <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">${trade.price.toFixed(6)}</td>
                        <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">${trade.value.toFixed(4)}</td>
                        <td className="px-5 py-4 text-right font-mono tabular-nums">
                          <span className={clsx(trade.pnl >= 0 ? 'text-green' : 'text-red')}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(4)} SOL
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono tabular-nums">
                          <span className={clsx(trade.pnlPct >= 0 ? 'text-green' : 'text-red')}>
                            {trade.pnlPct >= 0 ? '+' : ''}{trade.pnlPct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-hive-textDim text-xs">{new Date(trade.timestamp).toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-mono bg-green/20 text-green">FILLED</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-hive-border/50 flex items-center justify-between">
                <span className="text-hive-textDim text-sm font-mono">
                  {filteredTrades.length} of {tradeHistory.length} trades
                </span>
              </div>
            </>
          )}
        </div>

        {/* Agent Decisions History */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Agent Decisions</h3>
            <span className="text-hive-textDim text-xs font-mono">{decisions.length} decisions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Agent</th>
                  <th className="px-5 py-3 text-center text-hive-textDim text-xs font-mono uppercase tracking-wider">Recommendation</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Confidence</th>
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Findings</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-border/30">
                {decisions.slice(0, 50).map((decision) => (
                  <tr key={decision.id} className="hover:bg-hive-bgCardHover/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-hive-text">{decision.agent}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-xs font-mono',
                        decision.recommendation === 'BUY' ? 'bg-green/20 text-green' :
                        decision.recommendation === 'REJECT' ? 'bg-red/20 text-red' : 'bg-yellow/20 text-yellow'
                      )}>
                        {decision.recommendation}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-hive-text tabular-nums">
                      {(decision.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="px-5 py-3 font-mono text-hive-textDim text-xs truncate max-w-[100px]">{decision.mint.slice(0, 12)}...</td>
                    <td className="px-5 py-3 text-hive-textDim text-sm truncate max-w-[300px]">{decision.findings}</td>
                    <td className="px-5 py-3 text-right font-mono text-hive-textDim text-xs">{new Date(decision.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}