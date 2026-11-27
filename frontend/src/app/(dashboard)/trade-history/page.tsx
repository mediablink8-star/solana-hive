'use client';

import React, { useState, useMemo } from 'react';
import { usePortfolio, useDecisions, useTokens } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Position, AgentDecision, Token } from '@/types';

type FilterType = 'all' | 'open' | 'closed' | 'partial';

export default function TradeHistoryPage() {
  const { positions } = usePortfolio();
  const { decisions } = useDecisions();
  const { tokens } = useTokens();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Combine closed positions with decisions for a complete history
  const closedPositions = positions.filter(p => p.status === 'closed');
  
  const tradeHistory = useMemo(() => {
    const trades: any[] = [];
    
    // Add closed positions as trades
    closedPositions.forEach(pos => {
      const token = tokens.find(t => t.mint === pos.mint);
      const entryDecision = decisions.find(d => d.mint === pos.mint && d.recommendation === 'BUY');
      trades.push({
        id: `pos-${pos.id}`,
        type: 'trade',
        mint: pos.mint,
        symbol: token?.symbol || 'Unknown',
        side: 'BUY',
        entryPrice: pos.entry_price,
        exitPrice: pos.exit_price,
        qty: pos.qty,
        exitQty: pos.exit_qty,
        pnl: pos.unrealized_pnl || 0,
        pnlPct: pos.unrealized_pnl_pct || 0,
        status: 'closed',
        createdAt: pos.created_at,
        closedAt: pos.created_at, // Would need actual close timestamp
        agent: entryDecision?.agent || 'Unknown',
      });
    });
    
    return trades;
  }, [closedPositions, decisions, tokens]);

  const filteredTrades = useMemo(() => {
    if (filter === 'all') return tradeHistory;
    return tradeHistory.filter(t => t.status === filter);
  }, [tradeHistory, filter]);

  const sortedTrades = useMemo(() => {
    if (!sortConfig) return filteredTrades;
    return [...filteredTrades].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredTrades, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate summary stats
  const totalTrades = tradeHistory.length;
  const winningTrades = tradeHistory.filter(t => t.pnl > 0).length;
  const losingTrades = tradeHistory.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnl = tradeHistory.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Trade History</h1>
          <p className="text-hive-textDim mt-1">Complete paper trading history and performance</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass p-5 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Trades</p>
          <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{totalTrades}</p>
        </div>
        <div className="glass p-5 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Win Rate</p>
          <p className="text-2xl font-bold font-mono text-green mt-1">{winRate.toFixed(1)}%</p>
        </div>
        <div className="glass p-5 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total P&L</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${totalPnl >= 0 ? 'text-green' : 'text-red'}`}>
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
          {(['all', 'closed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                filter === f
                  ? 'bg-gradient-to-r from-cyan to-purple text-hive-bg font-semibold shadow-glow-cyan'
                  : 'glass text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50 border border-hive-border/50'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table */}
      {tradeHistory.length === 0 ? (
        <div className="glass rounded-2xl border border-hive-border/50 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-hive-textDim mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
          </svg>
          <h3 className="text-hive-text text-lg mb-2">No Trade History</h3>
          <p className="text-hive-textDim mb-6">Execute paper trades to see history here</p>
          <a href="/token-scanner" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan to-purple rounded-xl font-medium text-hive-bg hover:opacity-90 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
              <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Open Token Scanner
          </a>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                  <th className="px-5 py-3 text-center text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('side')}>
                    Side
                    {sortConfig?.key === 'side' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('entryPrice')}>
                    Entry
                    {sortConfig?.key === 'entryPrice' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('exitPrice')}>
                    Exit
                    {sortConfig?.key === 'exitPrice' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('qty')}>
                    Qty
                    {sortConfig?.key === 'qty' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('pnl')}>
                    P&L
                    {sortConfig?.key === 'pnl' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('pnlPct')}>
                    P&L %
                    {sortConfig?.key === 'pnlPct' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('agent')}>
                    Agent
                    {sortConfig?.key === 'agent' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('closedAt')}>
                    Closed
                    {sortConfig?.key === 'closedAt' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-border/30">
                {sortedTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-hive-bgCardHover/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-green">{trade.symbol?.charAt(0) || '$'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-hive-text truncate max-w-[150px]">{trade.symbol}</p>
                          <p className="text-hive-textDim text-xs font-mono truncate max-w-[150px]">{trade.mint.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={clsx(
                        'text-xs font-mono px-2 py-0.5 rounded-full',
                        trade.side === 'BUY' ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
                      )}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-hive-textDim tabular-nums">
                      ${trade.entryPrice?.toFixed(6) || '0'}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">
                      ${trade.exitPrice?.toFixed(6) || '0'}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-hive-textDim tabular-nums">
                      {trade.qty?.toFixed(4) || '0'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={clsx('font-mono font-semibold', trade.pnl >= 0 ? 'text-green' : 'text-red')}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(4)} SOL
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      <span className={clsx(trade.pnlPct >= 0 ? 'text-green' : 'text-red')}>
                        {trade.pnlPct >= 0 ? '+' : ''}{trade.pnlPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left text-hive-textDim text-sm truncate max-w-[120px]">
                      {trade.agent}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-hive-textDim text-xs">
                      {new Date(trade.closedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-5 py-3 border-t border-hive-border/50 flex items-center justify-between">
            <span className="text-hive-textDim text-sm font-mono">
              Showing {sortedTrades.length} of {tradeHistory.length} trades
            </span>
          </div>
        </div>
      )}

      {/* Agent Decisions */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-hive-text">Agent Decisions</h3>
          <span className="text-hive-textDim text-xs font-mono">{decisions.length} decisions</span>
        </div>
        {decisions.length === 0 ? (
          <div className="p-6 text-center text-hive-textDim">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Run analysis cycles to see agent decisions here</p>
          </div>
        ) : (
          <div className="divide-y divide-hive-border/30">
            {decisions.slice(0, 20).map((decision) => (
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
          </div>
        )}
      </div>
    </div>
  );
}