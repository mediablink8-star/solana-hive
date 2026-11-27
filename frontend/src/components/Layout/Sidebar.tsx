'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useUIStore } from '@/store';
import type { TabConfig, TabId } from '@/types';

const TABS: TabConfig[] = [
  { id: 'command-center', label: 'Command Center', icon: 'cpu', description: 'Main dashboard overview' },
  { id: 'hive-network', label: 'Hive Network', icon: 'network', description: 'Spider hive visualization' },
  { id: 'agent-hq', label: 'Agent HQ', icon: 'users', description: 'Agent profiles & activity' },
  { id: 'live-chat', label: 'Live Team Chat', icon: 'message-square', description: 'Agent communications' },
  { id: 'token-scanner', label: 'Token Scanner', icon: 'search', description: 'Live market scanner' },
  { id: 'token-intelligence', label: 'Token Intelligence', icon: 'file-text', description: 'Deep token analysis' },
  { id: 'open-positions', label: 'Open Positions', icon: 'briefcase', description: 'Current paper positions' },
  { id: 'trade-history', label: 'Trade History', icon: 'history', description: 'Completed trades' },
  { id: 'portfolio-analytics', label: 'Portfolio Analytics', icon: 'bar-chart-2', description: 'P&L & performance' },
  { id: 'risk-management', label: 'Risk Management', icon: 'shield', description: 'Risk controls & vetoes' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet', description: 'Balance & transactions' },
  { id: 'strategy-lab', label: 'Strategy Lab', icon: 'flask-conical', description: 'Strategy backtesting' },
  { id: 'system-logs', label: 'System Logs', icon: 'terminal', description: 'System events & errors' },
  { id: 'validation-progress', label: 'Validation Progress', icon: 'check-circle-2', description: '7-day experiment status' },
  { id: 'settings', label: 'Settings', icon: 'settings', description: 'Configuration' },
];

const ICONS: Record<string, React.ReactNode> = {
  cpu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.5" />
      <path d="M9 9h6M9 12h6M9 15h4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  network: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
      <path d="M12 1v4M12 19v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="1.5" />
      <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="1.5" />
    </svg>
  ),
  'message-square': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
      <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'file-text': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" />
      <path d="M14 2v6h6" strokeWidth="1.5" />
      <path d="M16 13H8M16 17H8M10 9H8" strokeWidth="1.5" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
      <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeWidth="1.5" />
      <path d="M3 3v5h5" strokeWidth="1.5" />
    </svg>
  ),
  'bar-chart-2': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 3v18h18" strokeWidth="1.5" />
      <path d="M7 16h4M15 8h4M19 12h4" strokeWidth="1.5" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5" />
    </svg>
  ),
  wallet: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="1.5" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-4" strokeWidth="1.5" />
      <path d="M3 11h18" strokeWidth="1.5" />
    </svg>
  ),
  'flask-conical': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M10 2v7.31" strokeWidth="1.5" />
      <path d="M14 2v7.31" strokeWidth="1.5" />
      <path d="M6 14a6 6 0 0 0 12 0" strokeWidth="1.5" />
      <path d="M8 14a8 8 0 0 0 12 0" strokeWidth="1.5" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" strokeWidth="1.5" />
    </svg>
  ),
  terminal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M8 9h8M8 13h6M8 5h10M8 17h10" strokeWidth="1.5" />
    </svg>
  ),
  'check-circle-2': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="1" />
    </svg>
  ),
};

// Mobile bottom navigation tabs (top 5 most used)
const MOBILE_TABS: TabConfig[] = [
  { id: 'command-center', label: 'Command', icon: 'cpu', description: 'Main dashboard' },
  { id: 'hive-network', label: 'Hive', icon: 'network', description: 'Spider hive' },
  { id: 'token-scanner', label: 'Scanner', icon: 'search', description: 'Token scanner' },
  { id: 'agent-hq', label: 'Agents', icon: 'users', description: 'Agent HQ' },
  { id: 'settings', label: 'Settings', icon: 'settings', description: 'Configuration' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, activeTab, setActiveTab } = useUIStore();
  
  const isActive = (tabId: TabId) => {
    const pathTab = pathname.replace('/', '') as TabId;
    return TABS.some(t => t.id === pathTab) ? pathTab === tabId : activeTab === tabId;
  };

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-full glass-strong lg:border-r lg:border-hive-border/50 lg:transition-all lg:duration-300',
          'lg:flex lg:flex-col lg:overflow-y-auto',
          sidebarOpen ? 'lg:w-72' : 'lg:w-20'
        )}
        style={{ height: '100vh' }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="lg:flex lg:items-center lg:gap-3 lg:p-4 lg:border-b lg:border-hive-border/50">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple lg:flex lg:items-center lg:justify-center">
              <svg className="w-6 h-6 text-hive-bg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green rounded-full border-2 border-hive-bg" />
          </div>
          {sidebarOpen && (
            <div className="lg:flex-1 lg:min-w-0">
              <h1 className="text-gradient-cyan font-display font-bold text-lg truncate">SOLANA HIVE</h1>
              <p className="text-hive-textDim text-xs font-mono truncate">AI Trading Command Center</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="lg:flex-1 lg:p-3 lg:space-y-1 lg:overflow-y-auto" role="navigation" aria-label="Main navigation">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={clsx(
                'lg:w-full lg:flex lg:items-center lg:gap-3 lg:px-3 lg:py-2.5 lg:rounded-xl lg:transition-all lg:duration-200',
                'lg:text-hive-textMuted lg:hover:text-hive-text',
                'lg:focus:outline-none lg:focus:ring-2 lg:focus:ring-cyan/50 lg:focus:ring-offset-2 lg:focus:ring-offset-hive-bg',
                isActive(tab.id)
                  ? 'lg:bg-gradient-to-r lg:from-cyan/10 lg:to-purple/10 lg:text-cyan lg:border lg:border-cyan/30 lg:shadow-glow-cyan'
                  : 'lg:hover:bg-hive-bgCardHover/50'
              )}
              title={sidebarOpen ? undefined : tab.description}
              aria-current={isActive(tab.id) ? 'page' : undefined}
            >
              <span className="lg:flex-shrink-0" aria-hidden="true">{ICONS[tab.icon]}</span>
              {sidebarOpen && (
                <span className="lg:flex-1 lg:text-left lg:font-medium lg:truncate">{tab.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Status Bar */}
        <div className="lg:p-3 lg:border-t lg:border-hive-border/50">
          {sidebarOpen && (
            <div className="lg:space-y-2">
              <div className="lg:flex lg:items-center lg:gap-2 lg:text-xs">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                <span className="font-mono text-green">LIVE</span>
                <span className="lg:flex-1 lg:text-hive-textDim">Paper Trading</span>
              </div>
              <div className="lg:flex lg:items-center lg:gap-2 lg:text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                <span className="font-mono text-cyan">WS Connected</span>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="lg:flex lg:flex-col lg:items-center lg:gap-2">
              <div className="w-2 h-2 rounded-full bg-green animate-pulse" title="Live" />
              <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" title="WebSocket Connected" />
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={clsx(
            'lg:absolute lg:-right-2 lg:bottom-4 lg:z-10 lg:w-8 lg:h-8 lg:rounded-full lg:glass',
            'lg:flex lg:items-center lg:justify-center lg:text-hive-textMuted lg:hover:text-cyan',
            'lg:transition-all lg:duration-200 lg:border lg:border-hive-border/50',
            sidebarOpen ? 'lg:rotate-180' : 'lg:rotate-0'
          )}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </aside>

      {/* Mobile Overlay */}
      <div
        className={clsx(
          'lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar Drawer */}
      <aside
        className={clsx(
          'lg:hidden fixed left-0 top-0 z-40 h-full glass-strong border-r border-hive-border/50 transition-transform duration-300 ease-out',
          'flex flex-col overflow-y-auto w-72',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ height: '100vh' }}
        aria-label="Mobile navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-hive-border/50">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
              <svg className="w-6 h-6 text-hive-bg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green rounded-full border-2 border-hive-bg" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-gradient-cyan font-display font-bold text-lg truncate">SOLANA HIVE</h1>
            <p className="text-hive-textDim text-xs font-mono truncate">AI Trading Command Center</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-red transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/${tab.id}`}
              onClick={() => { handleTabClick(tab.id); setSidebarOpen(false); }}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                'text-hive-textMuted hover:text-hive-text',
                'focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:ring-offset-2 focus:ring-offset-hive-bg',
                isActive(tab.id)
                  ? 'bg-gradient-to-r from-cyan/10 to-purple/10 text-cyan border border-cyan/30 shadow-glow-cyan'
                  : 'hover:bg-hive-bgCardHover/50'
              )}
              aria-current={isActive(tab.id) ? 'page' : undefined}
            >
              <span className="flex-shrink-0" aria-hidden="true">{ICONS[tab.icon]}</span>
              <span className="flex-1 text-left font-medium truncate">{tab.label}</span>
            </Link>
          ))}
        </nav>

        {/* Status Bar */}
        <div className="p-3 border-t border-hive-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="font-mono text-green">LIVE</span>
              <span className="flex-1 text-hive-textDim">Paper Trading</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              <span className="font-mono text-cyan">WS Connected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-hive-border/50 backdrop-blur" aria-label="Bottom navigation">
        <div className="grid grid-cols-5">
          {MOBILE_TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all duration-200',
                'text-hive-textMuted',
                'focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:ring-offset-2 focus:ring-offset-hive-bg',
                isActive(tab.id)
                  ? 'text-cyan bg-cyan/10'
                  : 'hover:text-hive-text'
              )}
              aria-current={isActive(tab.id) ? 'page' : undefined}
              aria-label={tab.description}
            >
              <span className="w-6 h-6" aria-hidden="true">{ICONS[tab.icon]}</span>
              <span className="text-[10px] font-medium truncate max-w-[60px]">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}