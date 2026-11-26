'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';

export default function PortfolioAnalyticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Portfolio Analytics</h1>
            <p className="text-hive-textDim mt-1">Performance metrics, P&L analysis, and portfolio insights</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-bgCardHover/50 border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-mono text-green">LIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Value</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">1.0000 SOL</p>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Net P&L</p>
            <p className="text-2xl font-bold font-mono text-green mt-1">+0.0000 SOL</p>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Net ROI</p>
            <p className="text-2xl font-bold font-mono text-green mt-1">+0.00%</p>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Cash Balance</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">1.0000 SOL</p>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-8 h-[400px]">
          <div className="text-center text-hive-textDim py-20">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 3v18h18M3 3l18 18" strokeWidth="1.5" />
            </svg>
            <p className="text-lg">Equity Curve Chart</p>
            <p className="text-sm mt-2">Connect wallet and start trading to see performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
            <h3 className="font-semibold text-hive-text mb-4">Position Allocation</h3>
            <div className="text-center text-hive-textDim py-8">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
                <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
              </svg>
              <p>No open positions</p>
            </div>
          </div>

          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6">
            <h3 className="font-semibold text-hive-text mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-hive-bg/50 rounded-xl p-4">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Starting Capital</p>
                <p className="font-mono font-semibold">1.0000 SOL</p>
              </div>
              <div className="bg-hive-bg/50 rounded-xl p-4">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Current Value</p>
                <p className="font-mono font-semibold text-gradient-cyan">1.0000 SOL</p>
              </div>
              <div className="bg-hive-bg/50 rounded-xl p-4">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Net P&L</p>
                <p className="font-mono font-semibold text-green">+0.0000 SOL</p>
              </div>
              <div className="bg-hive-bg/50 rounded-xl p-4">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">ROI</p>
                <p className="font-mono font-semibold text-green">+0.00%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}