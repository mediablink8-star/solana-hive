'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout';
import { usePortfolio, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';

export default function WalletPage() {
  const { portfolio, portfolioConfig, positions, paperTrade, partialExit, refetch } = usePortfolio();
  const { wsConnected } = useWebSocket();

  const totalInvested = positions.reduce((sum, p) => sum + p.sol_invested, 0);
  const totalUnrealized = positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
  const totalValue = portfolioConfig ? portfolioConfig.balance + totalInvested + totalUnrealized : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Wallet</h1>
            <p className="text-hive-textDim mt-1">Paper trading wallet balance and transactions</p>
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

        {/* Wallet Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Balance */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl border border-hive-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Wallet Value</p>
                  <p className="text-4xl font-bold font-mono text-gradient-cyan mt-1">{totalValue.toFixed(4)} SOL</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="1.5" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-4" strokeWidth="1.5" />
                    <path d="M3 11h18" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Available</p>
                  <p className="text-2xl font-bold font-mono text-gradient-cyan">{portfolioConfig?.balance.toFixed(4) || '0'} SOL</p>
                  <p className="text-hive-textDim text-xs mt-1">Cash balance</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Invested</p>
                  <p className="text-2xl font-bold font-mono text-gradient-purple">{positions.reduce((s, p) => s + p.sol_invested, 0).toFixed(4)} SOL</p>
                  <p className="text-hive-textDim text-xs mt-1">In positions</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Unrealized P&L</p>
                  <p className={clsx('text-2xl font-bold font-mono', totalUnrealized >= 0 ? 'text-green' : 'text-red')}>
                    {totalUnrealized >= 0 ? '+' : ''}{totalUnrealized.toFixed(4)} SOL
                  </p>
                  <p className="text-hive-textDim text-xs mt-1">Paper profit/loss</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-hive-border/50 pt-6">
                <h3 className="font-semibold text-hive-text mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="glass px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 5v14M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">Deposit (Simulated)</span>
                  </button>
                  <button className="glass px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">Withdraw (Simulated)</span>
                  </button>
                  <button className="glass px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">Execute Trade</span>
                  </button>
                  <button className="glass px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">View Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-hive-text">Recent Transactions</h3>
                <span className="text-hive-textDim text-xs font-mono">Paper trading only</span>
              </div>
              <div className="divide-y divide-hive-border/30">
                {/* Simulated transactions */}
                {[
                  { type: 'TRADE', desc: 'Paper trade executed', token: 'SOL/USDC', amount: '+0.5 SOL', time: '2 min ago', status: 'success' },
                  { type: 'DEPOSIT', desc: 'Simulated deposit', token: 'SOL', amount: '+1.0 SOL', time: '1 hour ago', status: 'success' },
                  { type: 'PARTIAL_EXIT', desc: 'Partial position exit', token: 'BONK/SOL', amount: '+0.25 SOL', time: '3 hours ago', status: 'success' },
                  { type: 'TRADE', desc: 'Paper trade executed', token: 'WIF/SOL', amount: '-0.3 SOL', time: '5 hours ago', status: 'success' },
                ].map((tx, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-hive-bgCardHover/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center',
                        tx.type === 'TRADE' && tx.amount.startsWith('+') ? 'bg-green/20 text-green' :
                        tx.type === 'TRADE' && tx.amount.startsWith('-') ? 'bg-red/20 text-red' :
                        tx.type === 'DEPOSIT' ? 'bg-cyan/20 text-cyan' : 'bg-purple/20 text-purple'
                      )}>
                        {tx.type === 'TRADE' && tx.amount.startsWith('+') ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="2" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-4" strokeWidth="2" /><path d="M3 11h18" strokeWidth="2" /></svg>
                        ) : tx.type === 'TRADE' && tx.amount.startsWith('-') ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12H3" strokeWidth="2" /></svg>
                        ) : tx.type === 'DEPOSIT' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-hive-text">{tx.desc}</p>
                        <p className="text-hive-textDim text-xs font-mono">{tx.token} • {tx.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-hive-text text-sm">{tx.amount}</p>
                      <p className="text-hive-textDim text-xs">{tx.time}</p>
                      <span className={clsx('inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono',
                        tx.status === 'success' ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
                      )}>
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl border border-hive-border/50 p-6">
              <h3 className="font-semibold text-hive-text mb-4">Wallet Information</h3>
              <div className="space-y-4">
                <WalletInfoRow label="Wallet Type" value="Paper Trading (Simulated)" />
                <WalletInfoRow label="Network" value="Solana Mainnet" />
                <WalletInfoRow label="Starting Capital" value="1.0000 SOL" />
                <WalletInfoRow label="Current Value" value={`${(portfolioConfig?.balance || 0) + positions.reduce((s, p) => s + p.sol_invested, 0) + positions.reduce((s, p) => s + (p.unrealized_pnl || 0), 0)).toFixed(4)} SOL`} highlight />
                <WalletInfoRow label="Trading Mode" value="Paper Only" highlight />
                <WalletInfoRow label="Live Trading" value="DISABLED" />
                <WalletInfoRow label="Max Positions" value={`${positions.length} / 3`} />
                <WalletInfoRow label="Max Allocation" value="10% per position" />
              </div>
            </div>

            <div className="glass rounded-2xl border border-hive-border/50 p-6">
              <h3 className="font-semibold text-hive-text mb-4">Risk Limits</h3>
              <div className="space-y-3">
                <LimitBar label="Stop Loss" value={15} max={100} color="red" />
                <LimitBar label="Take Profit" value={30} max={100} color="green" />
                <LimitBar label="Max Allocation" value={10} max={100} color="cyan" />
                <LimitBar label="Position Slots" value={positions.length} max={3} color="purple" />
              </div>
            </div>

            <div className="glass rounded-2xl border border-hive-border/50 p-6">
              <h3 className="font-semibold text-hive-text mb-4">Important Notices</h3>
              <div className="space-y-3 text-sm">
                <Notice type="warning" text="This is a PAPER TRADING wallet. No real funds are at risk." />
                <Notice type="info" text="All balances, trades, and P&L are simulated for testing purposes." />
                <Notice type="warning" text="Live trading is PERMANENTLY DISABLED in this deployment." />
                <Notice type="info" text="Data persists in local SQLite database across restarts." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function WalletInfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={clsx('flex items-center justify-between py-2 border-b border-hive-border/50', highlight && 'text-gradient-cyan')}>
      <span className="text-hive-textDim">{label}</span>
      <span className={clsx('font-mono', highlight ? 'font-semibold text-gradient-cyan' : 'text-hive-text')}>{value}</span>
    </div>
  );
}

function LimitBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100;
  const colors: Record<string, string> = {
    red: 'bg-red',
    green: 'bg-green',
    cyan: 'bg-cyan',
    purple: 'bg-purple',
  };
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-hive-textDim text-sm w-24">{label}</span>
      <div className="flex-1 h-2 bg-hive-bg/50 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: `var(--color-${color})` }}
        />
      </div>
      <span className="text-hive-textDim text-xs font-mono w-12 text-right">{value}/{max}</span>
    </div>
  );
}

function Notice({ type, text }: { type: 'warning' | 'info'; text: string }) {
  const colors = {
    warning: 'bg-yellow/10 border-yellow/30 text-yellow',
    info: 'bg-cyan/10 border-cyan/30 text-cyan',
  };
  
  return (
    <div className={clsx('flex items-start gap-3 p-3 rounded-xl border', colors[type])}>
      {type === 'warning' ? (
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 9v4M12 17h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <p className="text-hive-text text-sm">{text}</p>
    </div>
  );
}