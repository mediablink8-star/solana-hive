'use client';

import React from 'react';
import { usePortfolio } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, DollarSign, X, ExternalLink } from 'lucide-react';

export default function OpenPositionsPage() {
  const { portfolio } = usePortfolio();

  const positions = portfolio?.openPositions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Open Positions</h1>
          <p className="text-hive-textDim mt-1">Active trades and position management</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="text-xs font-mono text-green">{positions.length} Active</span>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="glass rounded-2xl border border-hive-border/50 p-12 text-center">
          <DollarSign className="w-16 h-16 text-hive-textDim/30 mx-auto mb-4" />
          <h3 className="text-hive-text text-xl font-semibold mb-2">No Open Positions</h3>
          <p className="text-hive-textDim">Positions will appear here when trades are executed</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                  <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Entry</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Current</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Invested</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">PnL</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">PnL %</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => {
                  const pnl = pos.unrealized_pnl || 0;
                  const pnlPct = pos.unrealized_pnl_pct || 0;
                  const isProfitable = pnl > 0;
                  return (
                    <tr key={pos.id} className="border-b border-hive-border/30 hover:bg-hive-bgCard/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-hive-bgCard flex items-center justify-center border border-hive-border/50">
                            <span className="text-xs font-bold text-hive-text">{pos.symbol?.slice(0, 3) || '???'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-hive-text">{pos.symbol || pos.mint.slice(0, 8)}</p>
                            <p className="text-hive-textDim text-xs font-mono">{pos.mint.slice(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-hive-text">{pos.qty}</td>
                      <td className="px-4 py-3 text-right font-mono text-hive-text">${pos.entry_price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-hive-text">${pos.current_price?.toLocaleString() || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-hive-text">{pos.sol_invested} SOL</td>
                      <td className="px-4 py-3 text-right font-mono text-hive-text">${(pos.current_price || pos.entry_price) * pos.qty | 0}</td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: isProfitable ? '#00ff88' : '#ff3366' }}>
                        ${pnl.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: isProfitable ? '#00ff88' : '#ff3366' }}>
                        {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan hover:border-cyan/50 border border-hive-border/50 transition-colors" title="View Details">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-red hover:border-red/50 border border-hive-border/50 transition-colors" title="Close Position">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}