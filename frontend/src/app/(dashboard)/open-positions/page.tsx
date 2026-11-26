'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout';
import { usePortfolio, useTokens, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Position, Token } from '@/types';

export default function OpenPositionsPage() {
  const { positions, portfolioConfig, paperTrade, partialExit, refetch } = usePortfolio();
  const { tokens } = useTokens();
  const { wsConnected } = useWebSocket();

  const getToken = (mint: string) => tokens.find(t => t.mint === mint);

  const totalInvested = positions.reduce((sum, p) => sum + p.sol_invested, 0);
  const totalUnrealized = positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
  const totalValue = totalInvested + totalUnrealized;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Open Positions</h1>
            <p className="text-hive-textDim mt-1">Current paper trading positions and P&L</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
              <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
              <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
                {wsConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <button
              onClick={refetch}
              className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M23 4v6h-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 20v-6h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Invested</p>
                <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{totalInvested.toFixed(4)} SOL</p>
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
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Unrealized P&L</p>
                <p className={clsx('text-2xl font-bold font-mono mt-1', totalUnrealized >= 0 ? 'text-green' : 'text-red')}>
                  {totalUnrealized >= 0 ? '+' : ''}{totalUnrealized.toFixed(4)} SOL
                </p>
              </div>
              <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', totalUnrealized >= 0 ? 'bg-green/10' : 'bg-red/10')}>
                <svg className={clsx('w-6 h-6', totalUnrealized >= 0 ? 'text-green' : 'text-red')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Position Value</p>
                <p className="text-2xl font-bold font-mono text-gradient-purple mt-1">{totalValue.toFixed(4)} SOL</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Available Balance</p>
                <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">{portfolioConfig?.balance.toFixed(4) || '0'} SOL</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Parameters */}
        {portfolioConfig && (
          <div className="glass rounded-2xl border border-hive-border/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-hive-text">Risk Parameters</h3>
              <span className="text-hive-textDim text-xs font-mono">
                Max {portfolioConfig.max_positions} positions • {Math.round(portfolioConfig.max_alloc * 100)}% per position
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Stop Loss</p>
                <p className="text-xl font-bold font-mono text-red">{Math.round(portfolioConfig.stop_loss * 100)}%</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Take Profit</p>
                <p className="text-xl font-bold font-mono text-green">{Math.round(portfolioConfig.take_profit * 100)}%</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Max Allocation</p>
                <p className="text-xl font-bold font-mono text-cyan">{Math.round(portfolioConfig.max_alloc * 100)}%</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Max Positions</p>
                <p className="text-xl font-bold font-mono text-yellow">{portfolioConfig.max_positions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Positions Table */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          {positions.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-hive-textDim mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
                <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
              </svg>
              <h3 className="text-hive-text text-lg mb-2">No Open Positions</h3>
              <p className="text-hive-textDim">Execute a paper trade from the Token Scanner to open a position</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                      <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Position</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Qty</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Entry Price</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Invested</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Current</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Unrealized P&L</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">P&L %</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Opened</th>
                      <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hive-border/30">
                    {positions.map((position) => {
                      const token = getToken(position.mint);
                      const currentPrice = token?.price || position.entry_price;
                      const currentValue = position.qty * currentPrice;
                      const unrealizedPnl = currentValue - position.sol_invested;
                      const unrealizedPnlPct = (unrealizedPnl / position.sol_invested) * 100;
                      
                      return (
                        <tr key={position.id} className="hover:bg-hive-bgCardHover/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-green">{token?.symbol?.charAt(0) || '$'}</span>
                              </div>
                              <div>
                                <p className="font-medium text-hive-text truncate max-w-[150px]">{token?.symbol || position.mint.slice(0, 8)}</p>
                                <p className="text-hive-textDim text-xs font-mono truncate max-w-[150px]">{position.mint.slice(0, 12)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">{position.qty.toFixed(4)}</td>
                          <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">${position.entry_price.toFixed(6)}</td>
                          <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">{position.sol_invested.toFixed(4)} SOL</td>
                          <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">${currentPrice.toFixed(6)}</td>
                          <td className="px-5 py-4 text-right font-mono tabular-nums">
                            <span className={clsx(unrealizedPnl >= 0 ? 'text-green' : 'text-red')}>
                              {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toFixed(4)} SOL
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right font-mono tabular-nums">
                            <span className={clsx(unrealizedPnlPct >= 0 ? 'text-green' : 'text-red')}>
                              {unrealizedPnlPct >= 0 ? '+' : ''}{unrealizedPnlPct.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-hive-textDim text-xs tabular-nums">
                            {new Date(position.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {position.unrealized_pnl !== undefined && unrealizedPnlPct <= -portfolioConfig?.stop_loss! * 100 && (
                                <span className="text-red text-xs font-mono px-2 py-0.5 rounded-full bg-red/10 border border-red/30">
                                  STOP LOSS
                                </span>
                              )}
                              {position.unrealized_pnl !== undefined && unrealizedPnlPct >= portfolioConfig?.take_profit! * 100 && (
                                <span className="text-green text-xs font-mono px-2 py-0.5 rounded-full bg-green/10 border border-green/30">
                                  TAKE PROFIT
                                </span>
                              )}
                              <button
                                onClick={() => partialExit(position.id, position.qty * 0.5)}
                                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-green transition-colors"
                                title="Partial Exit (50%)"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 12H3" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M18 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </button>
                              <button
                                onClick={() => partialExit(position.id, position.qty)}
                                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-red transition-colors"
                                title="Close Position"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-hive-border/50 flex items-center justify-between">
                <span className="text-hive-textDim text-sm font-mono">
                  {positions.length} position{positions.length !== 1 ? 's' : ''} • {positions.length}/{portfolioConfig?.max_positions || 3} slots used
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}