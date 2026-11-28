'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, DollarSign, Clock, Filter, ChevronUp, ChevronDown } from 'lucide-react';

const MOCK_TRADES = [
  { id: 1, token: 'SOL', side: 'BUY', qty: 0.5, price: 140.00, value: 70.00, pnl: 1.25, pnlPct: 1.79, status: 'closed', time: '2h ago', fee: 0.0005 },
  { id: 2, token: 'JUP', side: 'BUY', qty: 1500, price: 1.15, value: 1.725, pnl: 0.12, pnlPct: 6.96, status: 'closed', time: '4h ago', fee: 0.0003 },
  { id: 3, token: 'BONK', side: 'BUY', qty: 5000000, price: 0.000021, value: 0.105, pnl: -0.008, pnlPct: -7.62, status: 'closed', time: '1d ago', fee: 0.0002 },
  { id: 4, token: 'WIF', side: 'BUY', qty: 100, price: 2.45, value: 0.245, pnl: 0.04, pnlPct: 16.33, status: 'closed', time: '2d ago', fee: 0.0004 },
  { id: 5, token: 'mSOL', side: 'BUY', qty: 0.2, price: 155.00, value: 31.00, pnl: 0.75, pnlPct: 2.42, status: 'closed', time: '3d ago', fee: 0.0006 },
  { id: 6, token: 'JTO', side: 'BUY', qty: 200, price: 3.20, value: 0.64, pnl: -0.02, pnlPct: -3.13, status: 'closed', time: '5d ago', fee: 0.0003 },
];

export default function TradeHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Trade History</h1>
          <p className="text-hive-textDim mt-1">Completed trades and historical performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan">
            Export
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-center text-hive-textDim text-xs font-mono uppercase tracking-wider">Side</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">PnL</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">PnL %</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Fee</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRADES.map((trade) => (
                <tr key={trade.id} className="border-b border-hive-border/30 hover:bg-hive-bgCard/50">
                  <td className="px-4 py-3 font-mono text-hive-textDim">{trade.time}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-hive-bgCard flex items-center justify-center border border-hive-border/50">
                        <span className="text-xs font-bold text-hive-text">{trade.token.slice(0, 3)}</span>
                      </div>
                      <span className="font-medium">{trade.token}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full', trade.side === 'BUY' ? 'bg-green/20 text-green' : 'bg-red/20 text-red')}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-hive-text">{trade.qty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-hive-text">${trade.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-hive-text">${trade.value.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono" style={{ color: trade.pnl > 0 ? '#00ff88' : '#ff3366' }}>
                    ${trade.pnl.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono" style={{ color: trade.pnlPct > 0 ? '#00ff88' : '#ff3366' }}>
                    {trade.pnlPct > 0 ? '+' : ''}{trade.pnlPct.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-hive-textDim">{trade.fee} SOL</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green/20 text-green">Closed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-5 py-4 border-t border-hive-border/50 flex items-center justify-between">
          <p className="text-hive-textDim text-sm">Showing 6 of 47 trades</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan">←</button>
            <button className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}