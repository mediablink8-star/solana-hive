'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';

export default function TradeHistoryPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Trade History</h1>
            <p className="text-hive-textDim mt-1">Complete paper trading history and performance</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-bgCardHover/50 border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-mono text-green">LIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Trades</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">0</p>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Win Rate</p>
            <p className="text-2xl font-bold font-mono text-green mt-1">0%</p>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total P&L</p>
            <p className="text-2xl font-bold font-mono text-green mt-1">+0.0000 SOL</p>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Winning</p>
            <p className="text-2xl font-bold font-mono text-green mt-1">0</p>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Losing</p>
            <p className="text-2xl font-bold font-mono text-red mt-1">0</p>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-4">
          <div className="flex flex-wrap gap-3">
            <button className="bg-gradient-to-r from-cyan to-purple px-4 py-2 rounded-xl text-hive-bg font-semibold shadow-glow-cyan">All</button>
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50">Open</button>
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50">Closed</button>
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50">Partial</button>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-hive-textDim mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
            </svg>
            <h3 className="text-hive-text text-lg mb-2">No Trade History</h3>
            <p className="text-hive-textDim">Execute paper trades to see history here</p>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Agent Decisions</h3>
            <span className="text-hive-textDim text-xs font-mono">0 decisions</span>
          </div>
          <div className="p-6 text-center text-hive-textDim">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Run analysis cycles to see agent decisions here</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}