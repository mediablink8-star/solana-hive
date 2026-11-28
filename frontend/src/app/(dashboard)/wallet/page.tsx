'use client';

import React from 'react';
import { usePortfolio } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { Wallet, DollarSign, TrendingUp, TrendingDown, Send, ArrowDown, ArrowRightLeft, Heart } from 'lucide-react';

export default function WalletPage() {
  const { portfolio } = usePortfolio();
  const balance = portfolio?.config?.balance || 0.9;

  const transactions = [
    { type: 'BUY', token: 'SOL', amount: '0.5 SOL', value: '$71.25', time: '2h ago', status: 'confirmed' },
    { type: 'BUY', token: 'JUP', amount: '1,500 JUP', value: '$1,845', time: '4h ago', status: 'confirmed' },
    { type: 'RECEIVE', token: 'USDC', amount: '100 USDC', value: '$100', time: '1d ago', status: 'confirmed' },
    { type: 'SEND', token: 'SOL', amount: '0.1 SOL', value: '$14.25', time: '2d ago', status: 'confirmed' },
    { type: 'REWARDS', token: 'SOL', amount: '0.02 SOL', value: '$2.85', time: '3d ago', status: 'confirmed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Wallet</h1>
          <p className="text-hive-textDim mt-1">Balance, transactions, and token holdings</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan">
            <ArrowDown className="w-4 h-4" />
            Receive
          </button>
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass rounded-2xl border border-cyan/30 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Total Balance</p>
            <p className="text-4xl lg:text-5xl font-bold font-mono text-gradient-cyan">{balance.toFixed(4)} SOL</p>
            <p className="text-hive-textDim mt-1">≈ ${(balance * 142.5).toLocaleString()}</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-cyan/10 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-cyan" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-green">{balance.toFixed(4)}</p>
            <p className="text-hive-textDim text-xs">Available</p>
          </div>
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-purple">{portfolio?.openPositions?.reduce((sum, p) => sum + p.sol_invested, 0).toFixed(4) || '0.625'}</p>
            <p className="text-hive-textDim text-xs">In Positions</p>
          </div>
          <div className="glass rounded-xl p-4 border border-hive-border/50 text-center">
            <p className="text-2xl font-bold font-mono text-cyan">{(balance * 142.5).toFixed(2)}</p>
            <p className="text-hive-textDim text-xs">USD Value</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="glass rounded-2xl border border-hive-border/50 p-5 flex flex-col items-center gap-3 hover:border-cyan/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
            <ArrowDown className="w-6 h-6 text-green" />
          </div>
          <p className="font-medium text-hive-text">Receive</p>
          <p className="text-hive-textDim text-xs">Deposit tokens</p>
        </button>
        <button className="glass rounded-2xl border border-hive-border/50 p-5 flex flex-col items-center gap-3 hover:border-cyan/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center">
            <Send className="w-6 h-6 text-red" />
          </div>
          <p className="font-medium text-hive-text">Send</p>
          <p className="text-hive-textDim text-xs">Transfer tokens</p>
        </button>
        <button className="glass rounded-2xl border border-hive-border/50 p-5 flex flex-col items-center gap-3 hover:border-cyan/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-purple" />
          </div>
          <p className="font-medium text-hive-text">Swap</p>
          <p className="text-hive-textDim text-xs">Exchange tokens</p>
        </button>
        <button className="glass rounded-2xl border border-hive-border/50 p-5 flex flex-col items-center gap-3 hover:border-cyan/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-orange" />
          </div>
          <p className="font-medium text-hive-text">Stake</p>
          <p className="text-hive-textDim text-xs">Earn rewards</p>
        </button>
      </div>

      {/* Transaction History */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-hive-text flex items-center gap-2">
            <Heart className="w-5 h-5 text-cyan" />
            Recent Transactions
          </h2>
          <button className="text-hive-textDim text-xs font-mono hover:text-cyan">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={idx} className="border-b border-hive-border/30 hover:bg-hive-bgCard/50">
                  <td className="px-4 py-3 font-mono text-hive-textDim">{tx.time}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full', 
                      tx.type === 'BUY' ? 'bg-green/20 text-green' :
                      tx.type === 'SELL' ? 'bg-red/20 text-red' :
                      tx.type === 'RECEIVE' ? 'bg-cyan/20 text-cyan' :
                      tx.type === 'SEND' ? 'bg-orange/20 text-orange' :
                      'bg-purple/20 text-purple'
                    )}>{tx.type}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{tx.token}</td>
                  <td className="px-4 py-3 text-right font-mono text-hive-text">{tx.amount}</td>
                  <td className="px-4 py-3 text-right font-mono text-hive-text">{tx.value}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green/20 text-green">{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}