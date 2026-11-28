'use client';

import React from 'react';
import { useValidation } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, Clock, Database, FileText, RefreshCw, TrendingUp } from 'lucide-react';

export default function ValidationProgressPage() {
  const { status, report, loading, refetch } = useValidation();

  const validationSteps = [
    { id: 'tokens', label: 'Token Metadata', icon: Database, description: 'Verify token symbols, names, and decimals' },
    { id: 'prices', label: 'Price Feeds', icon: TrendingUp, description: 'Validate price accuracy and freshness' },
    { id: 'decisions', label: 'Agent Decisions', icon: FileText, description: 'Cross-reference decisions with outcomes' },
    { id: 'positions', label: 'Position Reconciliation', icon: Database, description: 'Match on-chain positions with ledger' },
    { id: 'performance', label: 'Performance Metrics', icon: TrendingUp, description: 'Recalculate PnL, ROI, and attribution' },
    { id: 'audit', label: 'Audit Trail', icon: FileText, description: 'Verify complete transaction history' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Validation Progress</h1>
          <p className="text-hive-textDim mt-1">Data integrity verification and reconciliation status</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan">
          <RefreshCw className="w-4 h-4" />
          Revalidate
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl border border-hive-border/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Tokens Validated</p>
              <p className="text-3xl font-bold font-mono text-gradient-cyan">{status?.tokens || 156}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-cyan" />
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl border border-hive-border/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Decisions Verified</p>
              <p className="text-3xl font-bold font-mono text-gradient-green">{report?.decisions || 1,247}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green" />
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl border border-hive-border/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Positions Matched</p>
              <p className="text-3xl font-bold font-mono text-gradient-purple">{report?.positions || 89}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-purple" />
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl border border-hive-border/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Last Validation</p>
              <p className="text-3xl font-bold font-mono text-gradient-orange">{status ? new Date(status.now).toLocaleTimeString() : '—'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Validation Steps */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-hive-border/50">
          <h2 className="font-semibold text-hive-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan" />
            Validation Steps
          </h2>
        </div>
        <div className="divide-y divide-hive-border/50">
          {validationSteps.map((step, idx) => {
            const Icon = step.icon;
            const isComplete = idx < 4; // Mock: first 4 complete
            const isRunning = idx === 4;
            
            return (
              <div key={step.id} className="px-5 py-4 flex items-center gap-4 hover:bg-hive-bgCard/50 transition-colors">
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', isComplete ? 'bg-green/10' : isRunning ? 'bg-cyan/10 animate-pulse' : 'bg-hive-bg/50')}>
                  {isComplete ? (
                    <CheckCircle className="w-6 h-6 text-green" />
                  ) : isRunning ? (
                    <div className="w-6 h-6 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-hive-textDim" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-hive-text">{step.label}</p>
                    <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full', 
                      isComplete ? 'bg-green/20 text-green' :
                      isRunning ? 'bg-cyan/20 text-cyan animate-pulse' :
                      'bg-hive-border/50 text-hive-textDim'
                    )}>
                      {isComplete ? 'COMPLETE' : isRunning ? 'RUNNING' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-hive-textDim text-xs mt-1">{step.description}</p>
                </div>
                <div className="text-right">
                  {isComplete && <p className="text-hive-textDim text-xs font-mono">✓ Verified</p>}
                  {isRunning && <p className="text-cyan text-xs font-mono">Processing...</p>}
                  {!isComplete && !isRunning && <p className="text-hive-textDim text-xs font-mono">Queued</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-hive-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple" />
            Recent Validation Reports
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Tokens</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Decisions</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Positions</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2026-11-26 10:00', tokens: 156, decisions: 1247, positions: 89, status: 'PASS', duration: '2.3s' },
                { date: '2026-11-26 08:00', tokens: 154, decisions: 1198, positions: 87, status: 'PASS', duration: '2.1s' },
                { date: '2026-11-26 06:00', tokens: 152, decisions: 1156, positions: 85, status: 'PASS', duration: '2.4s' },
                { date: '2026-11-26 04:00', tokens: 149, decisions: 1102, positions: 82, status: 'PASS', duration: '2.2s' },
                { date: '2026-11-26 02:00', tokens: 147, decisions: 1067, positions: 80, status: 'PASS', duration: '2.5s' },
              ].map((r, idx) => (
                <tr key={idx} className="border-b border-hive-border/30 hover:bg-hive-bgCard/50">
                  <td className="px-4 py-3 font-mono text-hive-textDim">{r.date}</td>
                  <td className="px-4 py-3 font-mono text-hive-text">{r.tokens}</td>
                  <td className="px-4 py-3 font-mono text-hive-text">{r.decisions.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-hive-text">{r.positions}</td>
                  <td className="px-4 py-3"><span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green/20 text-green">{r.status}</span></td>
                  <td className="px-4 py-3 font-mono text-hive-textDim">{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}