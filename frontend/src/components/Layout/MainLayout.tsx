'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, 
  GitBranch, 
  Users, 
  MessageSquare,
  Search, 
  Briefcase, 
  History, 
  BarChart, 
  Shield, 
  Wallet, 
  FlaskConical, 
  Terminal, 
  FileText, 
  CheckCircle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Zap,
  Brain,
  Network,
} from 'lucide-react';
import { useUIStore } from '@/store';

const TABS = [
  { id: 'command-center' as const, label: 'Command Center', icon: LayoutDashboard, description: 'System overview & metrics' },
  { id: 'hive-network' as const, label: 'Hive Network', icon: GitBranch, description: 'Agent collaboration graph' },
  { id: 'agent-hq' as const, label: 'Agent HQ', icon: Users, description: 'Individual agent profiles' },
  { id: 'live-chat' as const, label: 'Live Chat', icon: MessageSquare, description: 'Agent communication log' },
  { id: 'token-scanner' as const, label: 'Token Scanner', icon: Search, description: 'Live market discovery' },
  { id: 'open-positions' as const, label: 'Open Positions', icon: Briefcase, description: 'Active trades' },
  { id: 'trade-history' as const, label: 'Trade History', icon: History, description: 'Completed trades' },
  { id: 'portfolio-analytics' as const, label: 'Portfolio', icon: BarChart, description: 'Performance analytics' },
  { id: 'risk-management' as const, label: 'Risk', icon: Shield, description: 'Risk controls' },
  { id: 'wallet' as const, label: 'Wallet', icon: Wallet, description: 'Balance & transactions' },
  { id: 'strategy-lab' as const, label: 'Strategy Lab', icon: FlaskConical, description: 'Strategy backtesting' },
  { id: 'system-logs' as const, label: 'System Logs', icon: Terminal, description: 'Debug & audit trail' },
  { id: 'validation-progress' as const, label: 'Validation', icon: CheckCircle, description: 'Data validation status' },
  { id: 'settings' as const, label: 'Settings', icon: Settings, description: 'Configuration' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    setMounted(true);
    // Simulate WebSocket connection
    const timer = setTimeout(() => setWsStatus('connected'), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const tab = TABS.find(t => pathname === `/${t.id}` || pathname.startsWith(`/${t.id}/`));
    if (tab) setActiveTab(tab.id);
  }, [pathname, setActiveTab]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-hive-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan/50 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-hive-textMuted">Loading SOLANA HIVE...</p>
        </div>
      </div>
    );
  }

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-hive-bg flex">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 h-screen bg-hive-bgSecondary/95 backdrop-blur-xl border-r border-hive-border/50 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-72' : 'w-20'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-hive-border/50">
          <Link href="/command-center" className="flex items-center gap-3" aria-label="SOLANA HIVE Home">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan to-purple rounded-xl opacity-20" />
              <svg className="w-9 h-9 text-cyan relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M12 6v6l4 2" />
                <circle cx="17.5" cy="17.5" r="1.5" />
                <circle cx="6.5" cy="6.5" r="1.5" />
              </svg>
            </div>
            {sidebarOpen && (
              <span className="font-display font-bold text-xl text-gradient-cyan">SOLANA HIVE</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={clsx(
              'w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan transition-colors',
              !sidebarOpen && 'ml-auto'
            )}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Dashboard sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/${tab.id}`}
                className={clsx(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-cyan/10 to-purple/10 text-cyan border border-cyan/30 shadow-glow-cyan'
                    : 'text-hive-textMuted hover:text-hive-text hover:bg-hive-bgCard/50'
                )}
                onClick={() => setActiveTab(tab.id)}
                title={sidebarOpen ? undefined : `${tab.label} - ${tab.description}`}
              >
                <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors', isActive ? 'bg-cyan/20' : 'bg-hive-bg/50')}>
                  <Icon className={clsx('w-5 h-5', isActive ? 'text-cyan' : 'text-hive-textMuted')} aria-hidden="true" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sm truncate">{tab.label}</p>
                    <p className="text-[10px] text-hive-textDim truncate font-mono">{tab.description}</p>
                  </div>
                )}
                {isActive && sidebarOpen && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-3 border-t border-hive-border/50" style={{ display: sidebarOpen ? 'block' : 'none' }}>
          <div className="glass rounded-xl p-3 border border-hive-border/50">
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx('w-2 h-2 rounded-full', wsStatus === 'connected' ? 'bg-green animate-pulse' : 'bg-yellow')}></span>
              <span className="text-xs font-mono text-hive-textMuted uppercase tracking-wider">
                {wsStatus === 'connected' ? 'WS Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="glass rounded-lg p-2">
                <p className="text-lg font-bold font-mono text-gradient-cyan">8</p>
                <p className="text-[10px] text-hive-textDim">Agents</p>
              </div>
              <div className="glass rounded-lg p-2">
                <p className="text-lg font-bold font-mono text-gradient-green">15</p>
                <p className="text-[10px] text-hive-textDim">Links</p>
              </div>
              <div className="glass rounded-lg p-2">
                <p className="text-lg font-bold font-mono text-gradient-purple">LIVE</p>
                <p className="text-[10px] text-hive-textDim">Mode</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {!sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main 
        className={clsx(
          'flex-1 min-h-screen transition-all duration-300',
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        )}
        role="main"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-hive-border/30 backdrop-blur-xl">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan transition-colors"
                aria-label="Open navigation"
              >
                <Network className="w-5 h-5" />
              </button>
              <div style={{ display: sidebarOpen ? 'none' : 'block' }}>
                <h1 className="font-display font-bold text-xl text-gradient-cyan">SOLANA HIVE</h1>
              </div>
              {sidebarOpen && currentTab && (
                <div className="hidden lg:block">
                  <h1 className="font-display font-bold text-xl text-gradient-cyan">{currentTab.label}</h1>
                  <p className="text-[11px] text-hive-textDim font-mono">{currentTab.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Global search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hive-textDim" />
                <input
                  type="search"
                  placeholder="Search tokens, agents, decisions..."
                  className="w-64 sm:w-80 bg-hive-bg/50 border border-hive-border/50 rounded-lg pl-10 pr-4 py-2 text-sm text-hive-text placeholder-hive-textDim focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all"
                  aria-label="Global search"
                />
              </div>
              
              {/* System indicators */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-hive-border/50">
                  <span className={clsx('w-2 h-2 rounded-full', wsStatus === 'connected' ? 'bg-green animate-pulse' : 'bg-red')}></span>
                  <span className={clsx('text-xs font-mono', wsStatus === 'connected' ? 'text-green' : 'text-red')}>
                    {wsStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
                <button className="w-10 h-10 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan hover:bg-cyan/10 transition-colors" aria-label="Notifications">
                  <Zap className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan hover:bg-cyan/10 transition-colors" aria-label="Command palette">
                  <Brain className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6 pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}