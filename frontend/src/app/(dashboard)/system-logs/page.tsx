'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
<<<<<<< HEAD
=======
import { Terminal, Filter, Download, Trash2, RefreshCw, ChevronUp, ChevronDown, Search, AlertTriangle, CheckCircle, Info, X, Play, Pause } from 'lucide-react';
>>>>>>> 89ff60593bbeb9e071effc8a63565a7e9ecd3114

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'critical'];
const LOG_SOURCES = ['API', 'WS', 'Agents', 'Engine', 'DB', 'Scanner', 'Risk'];

interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  source: string;
  message: string;
  details?: Record<string, unknown>;
}

const MOCK_LOGS: LogEntry[] = [
  { timestamp: new Date(Date.now() - 1000), level: 'info', source: 'API', message: 'Health check OK', details: { latency: '12ms' } },
  { timestamp: new Date(Date.now() - 5000), level: 'info', source: 'WS', message: 'WebSocket connected', details: { clientId: 'ws_abc123' } },
  { timestamp: new Date(Date.now() - 10000), level: 'debug', source: 'Scanner', message: 'Token scan completed', details: { tokensFound: 22, duration: '1.2s' } },
  { timestamp: new Date(Date.now() - 15000), level: 'info', source: 'Engine', message: 'Analysis cycle started', details: { mint: 'So11111111111111111111111111111111111111112' } },
  { timestamp: new Date(Date.now() - 20000), level: 'debug', source: 'Agents', message: 'Token Scout analyzing', details: { token: 'SOL' } },
  { timestamp: new Date(Date.now() - 25000), level: 'info', source: 'Risk', message: 'Risk check passed', details: { mint: 'So11111111111111111111111111111111111111112', score: 0.85 } },
  { timestamp: new Date(Date.now() - 30000), level: 'warn', source: 'DB', message: 'Slow query detected', details: { query: 'getTokens', duration: '1.8s' } },
  { timestamp: new Date(Date.now() - 35000), level: 'error', source: 'API', message: 'Rate limit exceeded', details: { endpoint: '/tokens', retryAfter: '30s' } },
  { timestamp: new Date(Date.now() - 40000), level: 'info', source: 'Engine', message: 'Position opened', details: { mint: 'AyiQP43hqPXR...', solAmount: 0.1 } },
  { timestamp: new Date(Date.now() - 45000), level: 'critical', source: 'Risk', message: 'Emergency stop triggered', details: { reason: 'Daily loss limit exceeded' } },
];

const LEVEL_COLORS: Record<string, string> = {
  debug: 'text-hive-textDim',
  info: 'text-cyan',
  warn: 'text-yellow',
  error: 'text-red',
  critical: 'bg-red text-hive-bg font-bold',
};

const LEVEL_BG: Record<string, string> = {
  debug: 'bg-hive-bg/50',
  info: 'bg-cyan/10',
  warn: 'bg-yellow/10',
  error: 'bg-red/10',
  critical: 'bg-red/20',
};

const SOURCE_COLORS: Record<string, string> = {
  API: 'text-cyan',
  WS: 'text-purple',
  Agents: 'text-green',
  Engine: 'text-orange',
  DB: 'text-blue',
  Scanner: 'text-yellow',
  Risk: 'text-red',
};

function LogEntry({ log }: { log: LogEntry }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${LEVEL_BG[log.level]} border-${log.level === 'critical' ? 'red' : log.level}/30 hover:bg-hive-bgCardHover/50 transition-colors`}>
      <div className="flex-shrink-0 w-24 text-right font-mono text-xs text-hive-textDim">
        {log.timestamp.toLocaleTimeString()}
      </div>
      <div className="flex-shrink-0 w-16">
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${LEVEL_COLORS[log.level]}`}>
          {log.level.toUpperCase()}
        </span>
      </div>
      <div className="flex-shrink-0 w-20">
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${SOURCE_COLORS[log.source]}`}>
          {log.source}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-hive-text">{log.message}</p>
        {log.details && (
          <p className="text-hive-textDim text-xs font-mono truncate mt-1">
            {JSON.stringify(log.details)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SystemLogsPage() {
  const { wsConnected } = useWebSocket();
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [levelFilter, setLevelFilter] = useState<string[]>(LOG_LEVELS);
  const [sourceFilter, setSourceFilter] = useState<string[]>(LOG_SOURCES);
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [liveMode, setLiveMode] = useState(true);

  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        timestamp: new Date(),
        level: LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)] as LogEntry['level'],
        source: LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)],
        message: 'Simulated log entry',
        details: { auto: true },
      };
      setLogs(prev => [newLog, ...prev.slice(0, 199)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveMode]);

  const filteredLogs = logs.filter(log => 
    levelFilter.includes(log.level) &&
    sourceFilter.includes(log.source) &&
    (search === '' || log.message.toLowerCase().includes(search.toLowerCase()) || 
     JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">System Logs</h1>
          <p className="text-hive-textDim mt-1">Structured logging with real-time tail mode</p>
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
              checked={liveMode}
              onChange={(e) => setLiveMode(e.target.checked)}
              className="w-4 h-4 rounded border-hive-border/50 bg-transparent text-cyan focus:ring-cyan/50"
            />
            Live Tail
          </label>
        </div>
      </div>

      <div className="glass rounded-xl border border-hive-border/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
              <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full glass rounded-xl px-10 py-2.5 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-hive-textDim text-xs">Level:</span>
              {LOG_LEVELS.map((level) => (
                <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={levelFilter.includes(level)}
                    onChange={(e) => setLevelFilter(prev => e.target.checked ? [...prev, level] : prev.filter(l => l !== level))}
                    className="w-4 h-4 rounded border-hive-border/50 bg-transparent text-cyan focus:ring-cyan/50"
                  />
                  <span className={`text-xs font-mono ${LEVEL_COLORS[level]}`}>{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-hive-textDim text-xs">Source:</span>
          {LOG_SOURCES.map((source) => (
            <label key={source} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sourceFilter.includes(source)}
                onChange={(e) => setSourceFilter(prev => e.target.checked ? [...prev, source] : prev.filter(s => s !== source))}
                className="w-4 h-4 rounded border-hive-border/50 bg-transparent text-cyan focus:ring-cyan/50"
              />
              <span className={`text-xs font-mono ${SOURCE_COLORS[source]}`}>{source}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl border border-hive-border/50 overflow-hidden">
        <div className="p-4 border-b border-hive-border/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-mono text-hive-textDim">{filteredLogs.length} entries</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan/10 text-cyan">{liveMode ? 'LIVE' : 'PAUSED'}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-hive-textDim text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-4 h-4 rounded border-hive-border/50 bg-transparent text-cyan focus:ring-cyan/50"
              />
              Auto-scroll
            </label>
            <button className="glass px-3 py-1.5 rounded-lg border border-hive-border/50 hover:border-cyan/30 text-sm font-medium">
              Clear
            </button>
            <button className="glass px-3 py-1.5 rounded-lg border border-hive-border/50 hover:border-cyan/30 text-sm font-medium">
              Export
            </button>
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto" style={{ scrollBehavior: autoScroll ? 'smooth' : 'auto' }}>
          <div className="p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-hive-textDim py-12">
                <p>No logs match current filters</p>
              </div>
            ) : (
              filteredLogs.map((log, idx) => (
                <LogEntry key={idx} log={log} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}