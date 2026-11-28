'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Terminal, Filter, Download, Trash2, RefreshCw, ChevronUp, ChevronDown, Search, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
const LOG_SOURCES = ['system', 'api', 'websocket', 'engine', 'risk', 'execution', 'agents'] as const;

const MOCK_LOGS = [
  { id: 1, timestamp: '2026-11-26T10:30:45.123Z', level: 'info', source: 'system', message: 'SOLANA HIVE v2.0.0 started successfully', meta: {} },
  { id: 2, timestamp: '2026-11-26T10:30:45.234Z', level: 'info', source: 'api', message: 'REST API server listening on port 3000', meta: { port: 3000 } },
  { id: 3, timestamp: '2026-11-26T10:30:45.345Z', level: 'info', source: 'websocket', message: 'WebSocket server started on ws://localhost:3001', meta: { port: 3001 } },
  { id: 4, timestamp: '2026-11-26T10:30:46.001Z', level: 'info', source: 'engine', message: 'Trading engine initialized with 8 agents', meta: { agents: 8 } },
  { id: 5, timestamp: '2026-11-26T10:30:46.112Z', level: 'info', source: 'agents', message: 'Agent Token Scout status: IDLE → ANALYZING', meta: { agent: 'token-scout', oldStatus: 'idle', newStatus: 'analyzing' } },
  { id: 6, timestamp: '2026-11-26T10:30:46.223Z', level: 'info', source: 'agents', message: 'Agent Rug Detector status: IDLE → ANALYZING', meta: { agent: 'rug-detector', oldStatus: 'idle', newStatus: 'analyzing' } },
  { id: 7, timestamp: '2026-11-26T10:30:47.001Z', level: 'debug', source: 'api', message: 'Fetching token list from DexScreener', meta: { endpoint: '/api/tokens', cache: false } },
  { id: 8, timestamp: '2026-11-26T10:30:47.456Z', level: 'info', source: 'api', message: 'Received 156 tokens from DexScreener', meta: { count: 156, latency: '342ms' } },
  { id: 9, timestamp: '2026-11-26T10:30:48.001Z', level: 'warn', source: 'risk', message: 'Position SOL approaching 18% allocation limit', meta: { token: 'SOL', allocation: 18.5, limit: 20 } },
  { id: 10, timestamp: '2026-11-26T10:30:48.112Z', level: 'info', source: 'execution', message: 'Order placed: BUY 5,000,000 BONK @ 0.000022', meta: { token: 'BONK', side: 'BUY', qty: 5000000, price: 0.000022 } },
  { id: 11, timestamp: '2026-11-26T10:30:48.567Z', level: 'info', source: 'execution', message: 'Order filled via Jito bundle: 5,000,000 BONK', meta: { bundleId: 'jito_abc123', latency: '156ms' } },
  { id: 12, timestamp: '2026-11-26T10:30:49.001Z', level: 'info', source: 'agents', message: 'Agent Portfolio Manager: Position opened - 5M BONK (0.11 SOL)', meta: { agent: 'portfolio-manager', token: 'BONK', qty: 5000000 } },
  { id: 13, timestamp: '2026-11-26T10:30:50.001Z', level: 'debug', source: 'websocket', message: 'Heartbeat sent to 3 connected clients', meta: { clients: 3 } },
  { id: 14, timestamp: '2026-11-26T10:31:15.234Z', level: 'error', source: 'api', message: 'Failed to fetch price for token XYZ: Rate limited', meta: { token: 'XYZ', error: 'RATE_LIMITED', retryAfter: 60 } },
  { id: 15, timestamp: '2026-11-26T10:31:16.001Z', level: 'warn', source: 'engine', message: 'Agent Technical Analyst retrying analysis (attempt 2/3)', meta: { agent: 'technical-analyst', attempt: 2 } },
];

const LEVEL_COLORS: Record<string, string> = {
  debug: 'hive-textDim',
  info: 'hive-cyan',
  warn: 'hive-orange',
  error: 'hive-red',
};

const LEVEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  debug: Info,
  info: CheckCircle,
  warn: AlertTriangle,
  error: X,
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [filterLevel, setFilterLevel] = useState<'all' | typeof LOG_LEVELS[number]>('all');
  const [filterSource, setFilterSource] = useState<'all' | typeof LOG_SOURCES[number]>('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (autoScroll && !paused) {
      scrollToBottom();
    }
  }, [logs, autoScroll, paused]);

  // Simulate live logs
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const levels = ['debug', 'info', 'warn'] as const;
      const sources = ['api', 'websocket', 'engine', 'agents'] as const;
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        message: 'Simulated log entry for demonstration',
        meta: {},
      };
      setLogs(prev => [...prev.slice(-499), newLog]);
    }, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  const filteredLogs = logs.filter(log => {
    const levelMatch = filterLevel === 'all' || log.level === filterLevel;
    const sourceMatch = filterSource === 'all' || log.source === filterSource;
    const searchMatch = search === '' || log.message.toLowerCase().includes(search.toLowerCase()) || JSON.stringify(log.meta).toLowerCase().includes(search.toLowerCase());
    return levelMatch && sourceMatch && searchMatch;
  });

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">System Logs</h1>
          <p className="text-hive-textDim mt-1">Real-time system audit trail and debug output</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLogs([]); setPaused(false); }} className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan text-xs">
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
          <button onClick={() => setPaused(!paused)} className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs', paused ? 'bg-yellow/10 text-yellow border border-yellow/30' : 'glass text-hive-textMuted hover:text-cyan border border-hive-border/50')}>
            {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan text-xs">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl border border-hive-border/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hive-textDim" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg pl-10 pr-4 py-2 text-hive-text placeholder-hive-textDim focus:outline-none focus:border-cyan/50 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value as any)} className="bg-hive-bg/50 border border-hive-border/50 rounded-lg px-3 py-2 text-hive-text text-sm focus:outline-none focus:border-cyan/50">
              <option value="all">All Levels</option>
              {LOG_LEVELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <select value={filterSource} onChange={e => setFilterSource(e.target.value as any)} className="bg-hive-bg/50 border border-hive-border/50 rounded-lg px-3 py-2 text-hive-text text-sm focus:outline-none focus:border-cyan/50">
              <option value="all">All Sources</option>
              {LOG_SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <label className="flex items-center gap-2 text-hive-textDim text-xs cursor-pointer">
              <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="w-4 h-4 accent-cyan rounded" />
              Auto-scroll
            </label>
          </div>
        </div>
      </div>

      {/* Log Console */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden flex flex-col h-[calc(100vh-350px)] min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <div className="space-y-1" ref={logsEndRef}>
            {filteredLogs.length === 0 ? (
              <div className="text-hive-textDim text-center py-8">No logs matching filters</div>
            ) : (
              filteredLogs.slice().reverse().map((log, idx) => {
                const Icon = LEVEL_ICONS[log.level];
                const isExpanded = expandedLog === log.id;
                
                return (
                  <div key={log.id} className={clsx('flex gap-2 px-2 py-1.5 rounded-lg hover:bg-hive-bgCard/50 transition-colors border-l-2', LEVEL_COLORS[log.level])}>
                    <span className="text-hive-textDim w-14 text-right pr-2 select-none">{formatTime(log.timestamp)}</span>
                    <span className={clsx('w-10 text-center px-1', LEVEL_COLORS[log.level])}>{log.level.toUpperCase()}</span>
                    <span className="text-hive-textDim w-20 text-right pr-2 select-none">{log.source}</span>
                    <span className="flex-1 text-hive-text truncate pr-2">{log.message}</span>
                    <button
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      className="text-hive-textDim hover:text-cyan transition-colors p-1"
                      title="Expand details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Expanded Log Details */}
        {expandedLog && (
          <div className="border-t border-hive-border/50 bg-hive-bg/50 p-4 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-hive-textDim text-xs">Log Details</span>
              <button onClick={() => setExpandedLog(null)} className="text-hive-textDim hover:text-red">✕</button>
            </div>
            <pre className="text-hive-text text-[10px] whitespace-pre-wrap break-all">{JSON.stringify(filteredLogs.find(l => l.id === expandedLog), null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="glass rounded-xl border border-hive-border/50 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-hive-textDim">Total:</span>
            <span className="font-mono text-hive-text">{logs.length}</span>
            <span className="text-hive-textDim">|</span>
            <span className="text-hive-textDim">Filtered:</span>
            <span className="font-mono text-cyan">{filteredLogs.length}</span>
            <span className="text-hive-textDim">|</span>
            <span className="text-hive-textDim">Errors:</span>
            <span className="font-mono text-red">{logs.filter(l => l.level === 'error').length}</span>
            <span className="text-hive-textDim">|</span>
            <span className="text-hive-textDim">Warnings:</span>
            <span className="font-mono text-orange">{logs.filter(l => l.level === 'warn').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-hive-textDim">Level:</span>
            {LOG_LEVELS.map(l => (
              <span key={l} className={clsx('px-1.5 py-0.5 rounded text-[9px] font-mono', filterLevel === l ? 'bg-cyan/20 text-cyan' : 'text-hive-textDim')}>{l[0].toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}