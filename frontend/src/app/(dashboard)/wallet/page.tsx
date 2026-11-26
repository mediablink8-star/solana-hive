'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';

export default function WalletPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Wallet</h1>
            <p className="text-hive-textDim mt-1">Paper trading wallet balance and transactions</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-bgCardHover/50 border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-mono text-green">LIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Wallet Value</p>
                  <p className="text-4xl font-bold font-mono text-gradient-cyan mt-1">1.0000 SOL</p>
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
                <div className="bg-hive-bgCardHover/50 rounded-xl p-4 text-center border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Available</p>
                  <p className="text-2xl font-bold font-mono text-gradient-cyan">1.0000 SOL</p>
                  <p className="text-hive-textDim text-xs mt-1">Cash balance</p>
                </div>
                <div className="bg-hive-bgCardHover/50 rounded-xl p-4 text-center border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Invested</p>
                  <p className="text-2xl font-bold font-mono text-gradient-purple">0.0000 SOL</p>
                  <p className="text-hive-textDim text-xs mt-1">In positions</p>
                </div>
                <div className="bg-hive-bgCardHover/50 rounded-xl p-4 text-center border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Unrealized P&L</p>
                  <p className="text-2xl font-bold font-mono text-green">+0.0000 SOL</p>
                  <p className="text-hive-textDim text-xs mt-1">Paper profit/loss</p>
                </div>
              </div>

              <div className="border-t border-hive-border/50 pt-6">
                <h3 className="font-semibold text-hive-text mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-hive-bgCardHover/50 px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 5v14M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">Deposit (Simulated)</span>
                  </button>
                  <button className="bg-hive-bgCardHover/50 px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">Withdraw (Simulated)</span>
                  </button>
                  <button className="bg-hive-bgCardHover/50 px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">Execute Trade</span>
                  </button>
                  <button className="bg-hive-bgCardHover/50 px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">View Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-hive-text">Recent Transactions</h3>
                <span className="text-hive-textDim text-xs font-mono">Paper trading only</span>
              </div>
              <div className="divide-y divide-hive-border/30 p-4 space-y-4">
                <TransactionRow type="TRADE" desc="Paper trade executed" token="SOL/USDC" amount="+0.5 SOL" time="2 min ago" />
                <TransactionRow type="DEPOSIT" desc="Simulated deposit" token="SOL" amount="+1.0 SOL" time="1 hour ago" />
                <TransactionRow type="PARTIAL_EXIT" desc="Partial position exit" token="BONK/SOL" amount="+0.25 SOL" time="3 hours ago" />
                <TransactionRow type="TRADE" desc="Paper trade executed" token="WIF/SOL" amount="-0.3 SOL" time="5 hours ago" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
              <h3 className="font-semibold text-hive-text mb-4">Wallet Information</h3>
              <div className="space-y-4">
                <WalletInfoRow label="Wallet Type" value="Paper Trading (Simulated)" />
                <WalletInfoRow label="Network" value="Solana Mainnet" />
                <WalletInfoRow label="Starting Capital" value="1.0000 SOL" />
                <WalletInfoRow label="Current Value" value="1.0000 SOL" highlight />
                <WalletInfoRow label="Trading Mode" value="Paper Only" highlight />
                <WalletInfoRow label="Live Trading" value="DISABLED" />
                <WalletInfoRow label="Max Positions" value="0 / 3" />
                <WalletInfoRow label="Max Allocation" value="10% per position" />
              </div>
            </div>

            <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
              <h3 className="font-semibold text-hive-text mb-4">Risk Limits</h3>
              <div className="space-y-3">
                <LimitBar label="Stop Loss" value={15} max={100} color="red" />
                <LimitBar label="Take Profit" value={30} max={100} color="green" />
                <LimitBar label="Max Allocation" value={10} max={100} color="cyan" />
                <LimitBar label="Position Slots" value={0} max={3} color="purple" />
              </div>
            </div>

            <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
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

function TransactionRow({ type, desc, token, amount, time }: { type: string; desc: string; token: string; amount: string; time: string }) {
  const isBuy = amount.startsWith('+');
  const iconColor = type === 'DEPOSIT' ? 'text-cyan' : isBuy ? 'text-green' : 'text-red';
  const iconBg = type === 'DEPOSIT' ? 'bg-cyan/20' : isBuy ? 'bg-green/20' : 'bg-red/20';
  
  return (
    <div className="flex items-center gap-4 p-3 bg-hive-bg/50 rounded-xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        {type === 'DEPOSIT' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        {type === 'PARTIAL_EXIT' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        {type === 'TRADE' && isBuy && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="2" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-4" strokeWidth="2" /><path d="M3 11h18" strokeWidth="2" /></svg>}
        {type === 'TRADE' && !isBuy && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12H3" strokeWidth="2" /></svg>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-hive-text">{desc}</p>
        <p className="text-hive-textDim text-xs font-mono">{token} • {amount}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-hive-text text-sm {isBuy ? 'text-green' : 'text-red'}">{amount}</p>
        <p className="text-hive-textDim text-xs">{time}</p>
      </div>
    </div>
  );
}

function WalletInfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-hive-border/50 ${highlight ? 'text-gradient-cyan' : ''}`}>
      <span className="text-hive-textDim">{label}</span>
      <span className={`font-mono ${highlight ? 'font-semibold text-gradient-cyan' : 'text-hive-text'}`}>{value}</span>
    </div>
  );
}

function LimitBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-hive-textDim text-sm w-24">{label}</span>
      <div className="flex-1 h-2 bg-hive-bg/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: `var(--color-${color})` }} />
      </div>
      <span className="text-hive-textDim text-xs font-mono w-12 text-right">{value}/{max}</span>
    </div>
  );
}

function Notice({ type, text }: { type: 'warning' | 'info'; text: string }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${type === 'warning' ? 'bg-yellow/10 border-yellow/30 text-yellow' : 'bg-cyan/10 border-cyan/30 text-cyan'}`}>
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