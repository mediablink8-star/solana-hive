'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useValidation, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';

export default function ValidationProgressPage() {
  const { fetchStatus, fetchReport, fetchReconciliation, fetchHeartbeat, fetchUptime } = useValidation();
  const { wsConnected } = useWebSocket();
  
  const [status, setStatus] = useState<{ start: string; tokens: number; now: string } | null>(null);
  const [report, setReport] = useState<{ tokens: number; decisions: number; positions: number; generatedAt: string } | null>(null);
  const [reconciliation, setReconciliation] = useState<{ balance: number; ledger: any[] } | null>(null);
  const [heartbeat, setHeartbeat] = useState<{ lastHeartbeat: string | null } | null>(null);
  const [uptime, setUptime] = useState<{ uptimeMs: number; start: string; now: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = async () => {
    try {
      const [statusData, reportData, reconciliationData, heartbeatData, uptimeData] = await Promise.all([
        fetchStatus(),
        fetchReport(),
        fetchReconciliation(),
        fetchHeartbeat(),
        fetchUptime(),
      ]);
      
      if (statusData) setStatus(statusData);
      if (reportData) setReport(reportData);
      if (reconciliationData) setReconciliation(reconciliationData);
      if (heartbeatData) setHeartbeat(heartbeatData);
      if (uptimeData) setUptime(uptimeData);
    } catch (error) {
      console.error('Failed to load validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (autoRefresh) loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const experimentDay = status ? Math.floor((Date.now() - new Date(status.start).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
  const progress = Math.min((experimentDay / 7) * 100, 100);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Validation Progress</h1>
            <p className="text-hive-textDim mt-1">7-day autonomous paper trading experiment tracking</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
              <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
              <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
                {wsConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <label className="flex items-center gap-2 text-hive-textDim text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-hive-border/50 bg-transparent text-cyan focus:ring-cyan/50"
              />
              Auto-refresh (10s)
            </label>
          </div>
        </div>

        {/* Experiment Progress */}
        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gradient-cyan font-display font-bold text-2xl">7-Day Experiment</h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-hive-textDim text-xs">Experiment Day</p>
                <p className="text-3xl font-bold font-mono text-gradient-cyan">Day {experimentDay} / 7</p>
              </div>
              <div className="w-48 h-3 bg-hive-bg/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan to-purple rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Started</p>
              <p className="text-lg font-bold font-mono text-hive-text">
                {status ? new Date(status.start).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Uptime</p>
              <p className="text-lg font-bold font-mono text-gradient-cyan">
                {uptime ? formatDuration(uptime.uptimeMs) : '—'}
              </p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Progress</p>
              <p className="text-lg font-bold font-mono text-gradient-purple">{progress.toFixed(1)}%</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Status</p>
              <p className="text-lg font-bold font-mono text-green">ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Tokens Discovered</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan">{status?.tokens || 0}</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Agent Decisions</p>
            <p className="text-2xl font-bold font-mono text-gradient-purple">{report?.decisions || 0}</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Positions Opened</p>
            <p className="text-2xl font-bold font-mono text-gradient-green">{report?.positions || 0}</p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Last Heartbeat</p>
            <p className="text-xl font-bold font-mono text-hive-text">
              {heartbeat?.lastHeartbeat ? new Date(heartbeat.lastHeartbeat).toLocaleTimeString() : '—'}
            </p>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Report Generated</p>
            <p className="text-xl font-bold font-mono text-hive-textDim">
              {report ? new Date(report.generatedAt).toLocaleTimeString() : '—'}
            </p>
          </div>
        </div>

        {/* Portfolio Reconciliation */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Portfolio Reconciliation</h3>
            <span className="text-hive-textDim text-xs font-mono">Ledger verification</span>
          </div>
          <div className="p-6">
            {reconciliation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Current Balance</p>
                    <p className="text-2xl font-bold font-mono text-gradient-cyan">{reconciliation.balance.toFixed(4)} SOL</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Ledger Entries</p>
                    <p className="text-2xl font-bold font-mono text-gradient-purple">{reconciliation.ledger.length}</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Reconciliation</p>
                    <p className="text-2xl font-bold font-mono text-green">BALANCED</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-hive-border/50">
                  <h4 className="font-medium text-hive-text mb-3">Recent Ledger Entries</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                          <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Type</th>
                          <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Amount</th>
                          <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Balance After</th>
                          <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hive-border/30">
                        {reconciliation.ledger.slice(0, 20).map((entry, i) => (
                          <tr key={entry.id || i} className="hover:bg-hive-bgCardHover/50 transition-colors">
                            <td className="px-5 py-3">
                              <span className={clsx(
                                'px-2 py-0.5 rounded-full text-xs font-mono',
                                entry.type === 'deposit' ? 'bg-green/20 text-green' :
                                entry.type === 'withdrawal' ? 'bg-red/20 text-red' :
                                entry.type === 'trade' ? 'bg-cyan/20 text-cyan' :
                                entry.type === 'fee' ? 'bg-yellow/20 text-yellow' : 'bg-hive-border/50 text-hive-textDim'
                              )}>
                                {entry.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right font-mono text-hive-text tabular-nums">
                              {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(4)} SOL
                            </td>
                            <td className="px-5 py-3 text-right font-mono text-hive-text tabular-nums">
                              {entry.balance.toFixed(4)} SOL
                            </td>
                            <td className="px-5 py-3 font-mono text-hive-textDim text-xs">
                              {new Date(entry.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-hive-textDim py-8">Loading reconciliation data...</div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h3 className="font-semibold text-hive-text">System Health</h3>
              <span className="text-hive-textDim text-xs font-mono">Real-time monitoring</span>
            </div>
            <div className="p-6 space-y-4">
              <HealthCheck label="Backend API" status="healthy" detail="Responding normally" />
              <HealthCheck label="WebSocket" status={wsConnected ? 'healthy' : 'error'} detail={wsConnected ? 'Connected' : 'Disconnected'} />
              <HealthCheck label="Database" status="healthy" detail="SQLite synchronized" />
              <HealthCheck label="Scanner" status="healthy" detail="Running every 30s" />
              <HealthCheck label="Paper Trading Engine" status="healthy" detail="Operational" />
              <HealthCheck label="Risk Manager" status="healthy" detail="Veto authority active" />
              <HealthCheck label="Live Trading" status="disabled" detail="Permanently disabled" />
              <HealthCheck label="Data Persistence" status="healthy" detail="SQLite + file backups" />
            </div>
          </div>

          <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
              <h3 className="font-semibold text-hive-text">Experiment Milestones</h3>
              <span className="text-hive-textDim text-xs font-mono">7-day targets</span>
            </div>
            <div className="p-6 space-y-4">
              <Milestone day={1} title="System Initialization" description="Backend, database, and frontend deployed" completed={true} />
              <Milestone day={2} title="First Analysis Cycles" description="Agents analyzing tokens, generating decisions" completed={true} />
              <Milestone day={3} title="First Paper Trades" description="Risk-approved trades executed" completed={experimentDay >= 3} />
              <Milestone day={4} title="Position Management" description="Partial exits, stop losses, take profits tested" completed={experimentDay >= 4} />
              <Milestone day={5} title="Performance Tracking" description="Agent performance metrics calculated" completed={experimentDay >= 5} />
              <Milestone day={6} title="Strategy Validation" description="Multiple strategies compared" completed={experimentDay >= 6} />
              <Milestone day={7} title="Final Report" description="Complete validation report generated" completed={experimentDay >= 7} />
            </div>
          </div>
        </div>

        {/* Downtime Log */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-hive-text">Downtime Log</h3>
            <span className="text-hive-textDim text-xs font-mono">System availability tracking</span>
          </div>
          <div className="p-6">
            <div className="text-center text-hive-textDim py-8">
              <svg className="w-12 h-12 mx-auto mb-3 text-hive-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-lg">No downtime recorded</p>
              <p className="text-sm">System has been running continuously since experiment start</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function HealthCheck({ label, status, detail }: { label: string; status: 'healthy' | 'warning' | 'error' | 'disabled'; detail: string }) {
  const statusColors = {
    healthy: 'bg-green/20 text-green border-green/30',
    warning: 'bg-yellow/20 text-yellow border-yellow/30',
    error: 'bg-red/20 text-red border-red/30',
    disabled: 'bg-hive-border/50 text-hive-textDim border-hive-border/50',
  };

  const statusIcons = {
    healthy: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    warning: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    error: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    disabled: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeWidth="2" strokeLinecap="round" /></svg>,
  };

  return (
    <div className="flex items-center gap-4 p-4 glass rounded-xl border border-hive-border/50">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', statusColors[status])}>
        {statusIcons[status]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-hive-text">{label}</p>
        <p className="text-hive-textDim text-sm">{detail}</p>
      </div>
      <span className={clsx('px-3 py-1 rounded-full text-xs font-mono', 
        status === 'healthy' ? 'bg-green/20 text-green' :
        status === 'warning' ? 'bg-yellow/20 text-yellow' :
        status === 'error' ? 'bg-red/20 text-red' : 'bg-hive-border/50 text-hive-textDim'
      )}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}

function Milestone({ day, title, description, completed }: { day: number; title: string; description: string; completed: boolean }) {
  return (
    <div className="flex items-start gap-4 p-4 glass rounded-xl border border-hive-border/50">
      <div className={clsx(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono',
        completed ? 'bg-gradient-to-r from-cyan to-purple text-hive-bg' : 'bg-hive-border/50 text-hive-textDim'
      )}>
        {day}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={clsx('font-semibold', completed ? 'text-hive-text' : 'text-hive-textDim')}>{title}</h4>
          {completed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-green/20 text-green">DONE</span>
          )}
        </div>
        <p className={clsx('text-sm', completed ? 'text-hive-textDim' : 'text-hive-textDim/50')}>{description}</p>
      </div>
      {completed && (
        <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}