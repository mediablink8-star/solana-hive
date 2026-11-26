'use client';

import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';

export default function RiskManagementPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Risk Management</h1>
            <p className="text-hive-textDim mt-1">Portfolio risk controls, exposure limits, and veto authority</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-bgCardHover/50 border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-mono text-green">LIVE</span>
            </div>
          </div>
        </div>

        <div className="bg-green/10 border border-green/30 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-hive-text">Portfolio Within Risk Limits</p>
                <p className="text-hive-textDim text-sm mt-1">All risk parameters within limits</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium">View Alerts</button>
              <button className="bg-gradient-to-r from-cyan to-purple px-4 py-2 rounded-xl text-hive-bg font-medium hover:opacity-90">Emergency Stop</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Portfolio Exposure</p>
                <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">0.0%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Open Positions</p>
                <p className="text-2xl font-bold font-mono text-gradient-purple mt-1">0 / 3</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
                  <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Available Slots</p>
                <p className="text-2xl font-bold font-mono text-green mt-1">3</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Available Balance</p>
                <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">1.0000 SOL</p>
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
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Risk Rules Configuration</h3>
            <span className="text-hive-textDim text-xs font-mono">Active Rules: 4</span>
          </div>
          <div className="p-6 space-y-4">
            <RiskRuleCard title="Max Positions" description="Maximum concurrent open positions" value="3" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" /><rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" /></svg>} />
            <RiskRuleCard title="Max Allocation per Position" description="Maximum percentage of portfolio per single position" value="10%" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" /></svg>} />
            <RiskRuleCard title="Stop Loss" description="Automatic exit when position loses this percentage" value="15%" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9v4M12 17h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
            <RiskRuleCard title="Take Profit" description="Automatic exit when position gains this percentage" value="30%" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" /></svg>} />
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Risk Manager Vetoes</h3>
            <span className="text-hive-textDim text-xs font-mono">0 vetoes</span>
          </div>
          <div className="p-6 text-center text-hive-textDim">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9v4M12 17h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>No risk vetoes recorded. Risk Manager approves all analyzed trades.</p>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Position Risk Monitor</h3>
            <span className="text-hive-textDim text-xs font-mono">0 positions monitored</span>
          </div>
          <div className="p-6 text-center text-hive-textDim">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
              <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
            </svg>
            <p>No open positions to monitor</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function RiskRuleCard({ title, description, value, icon }: { title: string; description: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-hive-bgCardHover/50 rounded-xl p-4 border border-hive-border/50">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center flex-shrink-0 text-cyan">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-hive-text">{title}</h4>
          <p className="text-hive-textDim text-sm mb-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold font-mono text-gradient-cyan">{value}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-green/20 text-green">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}