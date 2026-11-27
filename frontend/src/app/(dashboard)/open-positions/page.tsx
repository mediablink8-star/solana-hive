'use client';

import React from 'react';
import { usePortfolio, useTokens } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Position, Token } from '@/types';

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return '—';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString();
};

function PositionRow({ position, token }: { position: Position; token: Token | undefined }) {
  const pnl = position.unrealized_pnl ?? 0;
  const pnlPct = position.unrealized_pnl_pct ?? 0;
  const isProfit = pnl >= 0;
  
  return (
    <tr className="hover:bg-hive-bgCardHover/50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
            <span className="text-xs font-bold text-green">{token?.symbol?.charAt(0) || '$'}</span>
          </div>
          <div>
            <p className="font-medium text-hive-text truncate max-w-[200px]">{token?.symbol || 'Unknown'}</p>
            <p className="text-hive-textDim text-xs font-mono truncate max-w-[200px]">{position.mint.slice(0, 12)}...</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">
        {position.qty.toFixed(4)}
      </td>
      <td className="px-5 py-4 text-right font-mono text-hive-textDim tabular-nums">
        @ {position.entry_price.toFixed(6)}
      </td>
      <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">
        ${token?.price?.toFixed(6) || '0'}
      </td>
      <td className="px-5 py-4 text-right font-mono text-hive-textDim tabular-nums">
        {position.sol_invested.toFixed(4)} SOL
      </td>
      <td className="px-5 py-4 text-right">
        <span className={clsx('font-mono font-semibold', isProfit ? 'text-green' : 'text-red')}>
          {isProfit ? '+' : ''}{pnl.toFixed(4)} SOL
        </span>
        <span className="ml-2 text-hive-textDim text-xs font-mono">
          ({isProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
        </span>
      </td>
      <td className="px-5 py-4 text-right font-mono text-hive-textDim text-xs">
        {new Date(position.created_at).toLocaleDateString()}
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button className="glass px-3 py-1.5 rounded-lg border border-hive-border/50 hover:border-red/50 hover:text-red transition-colors text-xs font-medium">
            Close
          </button>
          <button className="glass px-3 py-1.5 rounded-lg border border-hive-border/50 hover:border-yellow/50 hover:text-yellow transition-colors text-xs font-medium">
            Partial
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function OpenPositionsPage() {
  const { positions, portfolioConfig, refetch } = usePortfolio();
  const { tokens } = useTokens();

  const totalInvested = positions.reduce((sum, p) => sum + (p.sol_invested || 0), 0);
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
  const winningPositions = positions.filter(p => (p.unrealized_pnl || 0) > 0).length;
  const losingPositions = positions.filter(p => (p.unrealized_pnl || 0) < 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Open Positions</h1>
          <p className="text-hive-textDim mt-1">Current paper trading positions and P&L</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass p-4 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Total Invested</p>
          <p className="text-2xl font-bold font-mono text-cyan">{totalInvested.toFixed(4)} SOL</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Unrealized P&L</p>
          <p className={`text-2xl font-bold font-mono ${totalUnrealizedPnl >= 0 ? 'text-green' : 'text-red'}`}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}{totalUnrealizedPnl.toFixed(4)} SOL
          </p>
        </div>
        <div className="glass p-4 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Winning</p>
          <p className="text-2xl font-bold font-mono text-green">{winningPositions}</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Losing</p>
          <p className="text-2xl font-bold font-mono text-red">{losingPositions}</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Slots Used</p>
          <p className="text-2xl font-bold font-mono text-cyan">{positions.length} / {portfolioConfig?.max_positions || 3}</p>
        </div>
      </div>

      {/* Positions Table */}
      {positions.length === 0 ? (
        <div className="glass rounded-2xl border border-hive-border/50 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-hive-textDim mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
            <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
          </svg>
          <h3 className="text-hive-text text-lg mb-2">No Open Positions</h3>
          <p className="text-hive-textDim mb-6">Execute a paper trade from the Token Scanner to open a position</p>
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
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Quantity</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Entry Price</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Current Price</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Invested</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Unrealized P&L</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Opened</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-border/30">
                {positions.map((position) => {
                  const token = tokens.find(t => t.mint === position.mint);
                  return <PositionRow key={position.id} position={position} token={token} />;
                })}
              </tbody>
            </table>
          </div>
          
          <div className="px-5 py-3 border-t border-hive-border/50 flex items-center justify-between">
            <span className="text-hive-textDim text-sm font-mono">
              {positions.length} position{positions.length !== 1 ? 's' : ''} total
            </span>
            <span className="text-hive-textDim text-xs">
              Auto-refresh: 5s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}