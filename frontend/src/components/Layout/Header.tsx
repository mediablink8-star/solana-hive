'use client';

import React from 'react';
import { useUIStore, useDataStore } from '@/store';
import { clsx } from 'clsx';
import type { PortfolioConfig } from '@/types';

export function Header() {
  const { portfolioConfig, wsConnected } = useDataStore();
  const { commandPaletteOpen, openCommandPalette, closeCommandPalette, sidebarOpen, toggleSidebar } = useUIStore();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'Escape') {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette, closeCommandPalette]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <header className={clsx(
      'fixed top-0 right-0 z-30 glass-strong border-b border-hive-border/50',
      'flex items-center justify-between px-4 py-3',
      'transition-all duration-300',
      'lg:px-6',
      sidebarOpen ? 'lg:left-72' : 'lg:left-20',
      'left-0'
    )}>
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-hive-textMuted hover:text-cyan transition-colors border border-hive-border/50 hover:border-cyan/30 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        
        <button
          onClick={toggleSidebar}
          className="hidden lg:w-10 lg:h-10 lg:rounded-xl lg:glass lg:flex lg:items-center lg:justify-center lg:text-hive-textMuted lg:hover:text-cyan lg:transition-colors lg:border lg:border-hive-border/50 lg:hover:border-cyan/30"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        
        <div className="hidden lg:block lg:ml-2">
          <h1 className="text-gradient-cyan font-display font-bold text-xl">SOLANA HIVE</h1>
          <p className="text-hive-textDim text-xs font-mono">AI Trading Command Center</p>
        </div>
        
        {/* Mobile title */}
        <div className="lg:hidden flex-1 text-center">
          <h1 className="text-gradient-cyan font-display font-bold text-lg">SOLANA HIVE</h1>
        </div>
      </div>

      {/* Center: Status Indicators (Desktop only) */}
      <div className="hidden lg:flex items-center gap-4">
        {/* WebSocket Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
          <span className={clsx(
            'w-2 h-2 rounded-full',
            wsConnected ? 'bg-green animate-pulse' : 'bg-red'
          )} />
          <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
            {wsConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Portfolio Balance */}
        {portfolioConfig && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
            <span className="text-hive-textDim text-xs">BALANCE</span>
            <span className="font-mono text-lg font-semibold text-gradient-cyan">
              {portfolioConfig.balance.toFixed(4)} SOL
            </span>
          </div>
        )}

        {/* Open Positions */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
          <span className="text-hive-textDim text-xs">POSITIONS</span>
          <span className="font-mono text-lg font-semibold">
            {portfolioConfig?.max_positions ?? 3} / {portfolioConfig?.max_positions ?? 3}
          </span>
        </div>
      </div>

      {/* Right: Time + Commands */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Time */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
          <span className="font-mono text-hive-text text-sm tabular-nums">{formatTime(time)}</span>
          <span className="text-hive-textDim text-xs hidden md:block">{formatDate(time)}</span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={openCommandPalette}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center gap-2 text-hive-textMuted hover:text-cyan transition-colors border border-hive-border/50 hover:border-cyan/30"
          aria-label="Open command palette (⌘K)"
        >
          <kbd className="text-xs font-mono px-1.5 py-0.5 rounded bg-hive-bg/50 border border-hive-border/30 hidden sm:block">⌘K</kbd>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}