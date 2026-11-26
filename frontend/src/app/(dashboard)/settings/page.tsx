'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { usePortfolio, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';

export default function SettingsPage() {
  const { portfolioConfig } = usePortfolio();
  const { wsConnected } = useWebSocket();
  const [activeSection, setActiveSection] = useState('general');
  const [apiUrl, setApiUrl] = useState('http://localhost:4000');
  const [wsUrl, setWsUrl] = useState('ws://localhost:4000');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [animations, setAnimations] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const sections = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'connection', label: 'Connection', icon: 'wifi' },
    { id: 'trading', label: 'Trading', icon: 'activity' },
    { id: 'risk', label: 'Risk', icon: 'shield' },
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'advanced', label: 'Advanced', icon: 'cpu' },
  ];

  const ICONS: Record<string, React.ReactNode> = {
    settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="1.5" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="1" /></svg>,
    wifi: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0114.08 0" strokeWidth="1.5" /><path d="M1.42 9a16 16 0 0121.16 0" strokeWidth="1.5" /><path d="M8.53 16.11a6 6 0 016.94 0" strokeWidth="1.5" /><line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    activity: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    shield: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5" /></svg>,
    palette: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="2.5" strokeWidth="1.5" /><circle cx="18.5" cy="10.5" r="2.5" strokeWidth="1.5" /><circle cx="8.5" cy="10.5" r="2.5" strokeWidth="1.5" /><circle cx="13.5" cy="14.5" r="2.5" strokeWidth="1.5" /></svg>,
    bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="1.5" /><path d="M13.73 21a2 2 0 01-3.46 0" strokeWidth="1.5" /></svg>,
    cpu: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.5" /><path d="M9 9h6M9 12h6M9 15h4" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Settings</h1>
            <p className="text-hive-textDim mt-1">Configure your trading terminal preferences</p>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Navigation */}
            <div className="lg:w-52 border-r border-hive-border/50 p-4">
              <nav className="space-y-1" role="navigation" aria-label="Settings sections">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200',
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-cyan/10 to-purple/10 text-cyan border border-cyan/30 shadow-glow-cyan'
                        : 'text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50'
                    )}
                  >
                    <span className="flex-shrink-0" aria-hidden="true">{ICONS[section.icon]}</span>
                    <span className="font-medium truncate">{section.label}</span>
                  </button>
                ))}
              </nav>
              
              {/* Status */}
              <div className="mt-8 pt-6 border-t border-hive-border/50">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
                  <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
                  <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
                    {wsConnected ? 'CONNECTED' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {activeSection === 'general' && <GeneralSettings />}
              {activeSection === 'connection' && <ConnectionSettings apiUrl={apiUrl} setApiUrl={setApiUrl} wsUrl={wsUrl} setWsUrl={setWsUrl} />}
              {activeSection === 'trading' && <TradingSettings portfolioConfig={portfolioConfig} />}
              {activeSection === 'risk' && <RiskSettings />}
              {activeSection === 'appearance' && <AppearanceSettings theme={theme} setTheme={setTheme} animations={animations} setAnimations={setAnimations} />}
              {activeSection === 'notifications' && <NotificationSettings notifications={notifications} setNotifications={setNotifications} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} refreshInterval={refreshInterval} setRefreshInterval={setRefreshInterval} />}
              {activeSection === 'advanced' && <AdvancedSettings />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">General Settings</h2>
        <p className="text-hive-textDim">Basic application preferences and information</p>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Application Info</h3>
          <div className="space-y-3">
            <InfoRow label="Application" value="SOLANA HIVE Trading Terminal" />
            <InfoRow label="Version" value="2.0.0" />
            <InfoRow label="Build Date" value={new Date().toLocaleDateString()} />
            <InfoRow label="Mode" value="Paper Trading Only" highlight />
            <InfoRow label="Live Trading" value="DISABLED" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Default Preferences</h3>
          <div className="space-y-4">
            <SettingToggle label="Auto-refresh data" description="Automatically refresh market data and portfolio" defaultChecked />
            <SettingToggle label="Show notifications" description="Display toast notifications for events" defaultChecked />
            <SettingToggle label="Animations" description="Enable UI animations and transitions" defaultChecked />
            <SettingToggle label="Compact mode" description="Reduce spacing for more data density" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Data Management</h3>
          <div className="flex flex-wrap gap-3">
            <button className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" /><polyline points="17 8 12 3 7 8" strokeWidth="1.5" /><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" /></svg>
              Export Data
            </button>
            <button className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" /><polyline points="7 8 12 3 17 8" strokeWidth="1.5" /><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" /></svg>
              Import Data
            </button>
            <button className="glass px-4 py-2 rounded-xl border border-red/30 hover:border-red/50 transition-colors text-sm font-medium flex items-center gap-2 text-red">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" strokeWidth="1.5" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="1.5" /></svg>
              Clear Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionSettings({ apiUrl, setApiUrl, wsUrl, setWsUrl }: { apiUrl: string; setApiUrl: (v: string) => void; wsUrl: string; setWsUrl: (v: string) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Connection Settings</h2>
        <p className="text-hive-textDim">Configure backend API and WebSocket connections</p>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">API Endpoint</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-hive-textDim text-sm mb-2">API Base URL</label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent"
                placeholder="https://api.example.com"
              />
              <p className="text-hive-textDim text-xs">REST API endpoint for all HTTP requests</p>
            </div>
            <div>
              <label className="block text-hive-textDim text-sm mb-2">WebSocket URL</label>
              <input
                type="url"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent"
                placeholder="wss://api.example.com"
              />
              <p className="text-hive-textDim text-xs">WebSocket endpoint for real-time updates</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Connection Status</h3>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green animate-pulse" />
                <span className="font-medium text-hive-text">Backend API</span>
              </div>
              <span className="text-green font-mono text-sm">● CONNECTED</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">CORS & Security</h3>
          <div className="space-y-3">
            <SettingToggle label="Allow localhost" description="Allow connections from localhost for development" defaultChecked />
            <SettingToggle label="Enforce HTTPS" description="Require HTTPS for production connections" defaultChecked />
            <SettingToggle label="WebSocket auto-reconnect" description="Automatically reconnect on disconnect" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

function TradingSettings({ portfolioConfig }: { portfolioConfig: any }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Trading Settings</h2>
        <p className="text-hive-textDim">Configure paper trading parameters</p>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Paper Trading Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingInput label="Starting Capital (SOL)" value="1.0" type="number" step="0.1" readonly />
            <SettingInput label="Max Positions" value={portfolioConfig?.max_positions || 3} type="number" min="1" max="10" readonly />
            <SettingInput label="Max Allocation per Position (%)" value={Math.round((portfolioConfig?.max_alloc || 0.1) * 100)} type="number" min="1" max="100" readonly />
            <SettingInput label="Stop Loss (%)" value={Math.round((portfolioConfig?.stop_loss || 0.15) * 100)} type="number" min="1" max="50" readonly />
            <SettingInput label="Take Profit (%)" value={Math.round((portfolioConfig?.take_profit || 0.3) * 100)} type="number" min="1" max="200" readonly />
            <SettingInput label="Default Trade Size (% of capital)" value="10" type="number" min="1" max="100" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Execution Settings</h3>
          <div className="space-y-4">
            <SettingToggle label="Simulate slippage" description="Apply 1% slippage simulation" defaultChecked />
            <SettingToggle label="Simulate fees" description="Apply 0.25% trading fee simulation" defaultChecked />
            <SettingToggle label="Partial exits enabled" description="Allow partial position exits" defaultChecked />
            <SettingToggle label="Auto-close at stop loss" description="Automatically close positions at stop loss" defaultChecked />
            <SettingToggle label="Auto-close at take profit" description="Automatically close positions at take profit" defaultChecked />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Strategy Filters</h3>
          <div className="space-y-4">
            <SettingToggle label="Minimum liquidity filter" description="Only trade tokens with sufficient liquidity" defaultChecked />
            <SettingInput label="Minimum liquidity (USD)" value="10000" type="number" step="1000" />
            <SettingToggle label="Maximum holder concentration" description="Reject tokens with high holder concentration" defaultChecked />
            <SettingInput label="Max top holder %" value="10" type="number" min="1" max="50" />
            <SettingToggle label="Require social signals" description="Only trade tokens with social activity" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Risk Management</h2>
        <p className="text-hive-textDim">Configure risk limits and safety controls</p>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Portfolio Risk Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingInput label="Max Portfolio Drawdown (%)" value="20" type="number" min="1" max="100" />
            <SettingInput label="Max Daily Loss (%)" value="5" type="number" min="1" max="50" />
            <SettingInput label="Max Position Size (% of portfolio)" value="10" type="number" min="1" max="100" />
            <SettingInput label="Max Sector Exposure (%)" value="30" type="number" min="1" max="100" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Safety Controls</h3>
          <div className="space-y-4">
            <SettingToggle label="Emergency stop enabled" description="Allow emergency stop of all trading" defaultChecked />
            <SettingToggle label="Auto-pause on drawdown" description="Pause trading when max drawdown reached" defaultChecked />
            <SettingToggle label="Require risk manager approval" description="All trades must pass risk manager veto" defaultChecked />
            <SettingToggle label="Position correlation check" description="Prevent highly correlated positions" defaultChecked />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Risk Manager Veto Settings</h3>
          <div className="space-y-4">
            <SettingToggle label="Enable risk manager veto" description="Allow risk manager to reject trades" defaultChecked />
            <SettingInput label="Veto confidence threshold (%)" value="50" type="number" min="0" max="100" />
            <SettingToggle label="Auto-veto on high concentration" description="Automatically veto if holder concentration too high" defaultChecked />
            <SettingToggle label="Auto-veto on low liquidity" description="Automatically veto if liquidity below threshold" defaultChecked />
            <SettingToggle label="Auto-veto on suspicious activity" description="Automatically veto on detected rug pull patterns" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ theme, setTheme, animations, setAnimations }: { theme: 'dark' | 'light'; setTheme: (v: 'dark' | 'light') => void; animations: boolean; setAnimations: (v: boolean) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Appearance</h2>
        <p className="text-hive-textDim">Customize the look and feel of your terminal</p>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={clsx(
                'glass rounded-xl p-6 border-2 transition-all flex flex-col items-center gap-3',
                theme === 'dark' ? 'border-cyan/50 bg-cyan/5' : 'border-hive-border/50 hover:border-cyan/30'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hive-bg to-hive-bgSecondary border border-hive-border flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" strokeWidth="1.5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-medium text-hive-text">Dark</span>
              <span className="text-hive-textDim text-xs">Default theme</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={clsx(
                'glass rounded-xl p-6 border-2 transition-all flex flex-col items-center gap-3',
                theme === 'light' ? 'border-cyan/50 bg-cyan/5' : 'border-hive-border/50 hover:border-cyan/30'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-100 border border-gray-200 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" strokeWidth="1.5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-medium text-hive-text">Light</span>
              <span className="text-hive-textDim text-xs">Experimental</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Animations & Motion</h3>
          <div className="space-y-4">
            <SettingToggle label="Enable animations" description="UI transitions and micro-interactions" defaultChecked={animations} onChange={setAnimations} />
            <SettingToggle label="Reduced motion" description="Respect system prefers-reduced-motion setting" defaultChecked />
            <SettingToggle label="Particle effects" description="Spider hive particle animations" defaultChecked />
            <SettingToggle label="Chart animations" description="Animated charts and transitions" defaultChecked />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Color Scheme</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 p-3 glass rounded-xl border border-hive-border/50">
              <div className="w-6 h-6 rounded-full bg-cyan" title="Primary: Cyan" />
              <span className="text-hive-textDim text-sm">Primary: Cyan</span>
            </div>
            <div className="flex items-center gap-3 p-3 glass rounded-xl border border-hive-border/50">
              <div className="w-6 h-6 rounded-full bg-purple" title="Secondary: Purple" />
              <span className="text-hive-textDim text-sm">Secondary: Purple</span>
            </div>
            <div className="flex items-center gap-3 p-3 glass rounded-xl border border-hive-border/50">
              <div className="w-6 h-6 rounded-full bg-green" title="Success: Green" />
              <span className="text-hive-textDim text-sm">Success: Green</span>
            </div>
            <div className="flex items-center gap-3 p-3 glass rounded-xl border border-hive-border/50">
              <div className="w-6 h-6 rounded-full bg-red" title="Danger: Red" />
              <span className="text-hive-textDim text-sm">Danger: Red</span>
            </div>
            <div className="flex items-center gap-3 p-3 glass rounded-xl border border-hive-border/50">
              <div className="w-6 h-6 rounded-full bg-yellow" title="Warning: Yellow" />
              <span className="text-hive-textDim text-sm">Warning: Yellow</span>
            </div>
            <div className="flex items-center gap-3 p-3 glass rounded-xl border border-hive-border/50">
              <div className="w-6 h-6 rounded-full bg-orange" title="Info: Orange" />
              <span className="text-hive-textDim text-sm">Info: Orange</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ notifications, setNotifications, autoRefresh, setAutoRefresh, refreshInterval, setRefreshInterval }: { 
  notifications: boolean; 
  setNotifications: (v: boolean) => void; 
  autoRefresh: boolean; 
  setAutoRefresh: (v: boolean) => void; 
  refreshInterval: number; 
  setRefreshInterval: (v: number) => void; 
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Notifications</h2>
        <p className="text-hive-textDim">Configure how you receive alerts and updates</p>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">General</h3>
          <div className="space-y-4">
            <SettingToggle label="Enable notifications" description="Show toast notifications for events" defaultChecked={notifications} onChange={setNotifications} />
            <SettingToggle label="Sound notifications" description="Play sound for important alerts" />
            <SettingToggle label="Desktop notifications" description="Show browser desktop notifications" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Event Types</h3>
          <div className="space-y-3">
            <SettingToggle label="New token discovered" defaultChecked />
            <SettingToggle label="Analysis cycle started" defaultChecked />
            <SettingToggle label="Trade executed" defaultChecked />
            <SettingToggle label="Position opened/closed" defaultChecked />
            <SettingToggle label="Stop loss triggered" defaultChecked />
            <SettingToggle label="Take profit triggered" defaultChecked />
            <SettingToggle label="Risk manager veto" defaultChecked />
            <SettingToggle label="System errors" defaultChecked />
            <SettingToggle label="Scanner updates" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Auto-refresh</h3>
          <div className="space-y-4">
            <SettingToggle label="Enable auto-refresh" description="Automatically refresh data" defaultChecked={autoRefresh} onChange={setAutoRefresh} />
            <div className="grid grid-cols-2 gap-4">
              <SettingInput label="Refresh interval (seconds)" value={refreshInterval} type="number" min="5" max="300" step={5} onChange={setRefreshInterval} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Advanced Settings</h2>
        <p className="text-hive-textDim">Developer and power user options</p>
      </div>

      <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Developer Tools</h3>
          <div className="flex flex-wrap gap-3">
            <button className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5" /></svg>
              Open DevTools
            </button>
            <button className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeWidth="1.5" /><polyline points="14 2 14 8 20 8" strokeWidth="1.5" /><line x1="16" y1="13" x2="8" y2="13" strokeWidth="1.5" /><line x1="16" y1="17" x2="8" y2="17" strokeWidth="1.5" /><polyline points="10 9 9 9 8 9" strokeWidth="1.5" /></svg>
              View Logs
            </button>
            <button className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.5" /><path d="M8 21h8M12 17v4" strokeWidth="1.5" /></svg>
              Performance Monitor
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Debug Options</h3>
          <div className="space-y-4">
            <SettingToggle label="Debug logging" description="Enable verbose console logging" />
            <SettingToggle label="Mock data mode" description="Use mock data instead of live API" />
            <SettingToggle label="Simulate network latency" description="Add artificial delay to API calls" />
            <SettingToggle label="Force error states" description="Test error handling UI" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Danger Zone</h3>
          <p className="text-hive-textDim text-sm mb-4">These actions cannot be undone.</p>
          <div className="flex flex-wrap gap-3">
            <button className="glass px-4 py-2 rounded-xl border border-red/30 hover:border-red/50 transition-colors text-sm font-medium flex items-center gap-2 text-red">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" strokeWidth="1.5" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="1.5" /></svg>
              Reset All Settings
            </button>
            <button className="glass px-4 py-2 rounded-xl border border-red/30 hover:border-red/50 transition-colors text-sm font-medium flex items-center gap-2 text-red">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><line x1="15" y1="9" x2="9" y2="15" strokeWidth="1.5" /><line x1="9" y1="9" x2="15" y2="15" strokeWidth="1.5" /></svg>
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared Components
function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hive-border/50">
      <span className="text-hive-textDim">{label}</span>
      <span className={clsx('font-mono', highlight ? 'text-gradient-cyan font-semibold' : 'text-hive-text')}>{value}</span>
    </div>
  );
}

function SettingToggle({ label, description, defaultChecked, onChange }: { 
  label: string; 
  description: string; 
  defaultChecked?: boolean; 
  onChange?: (v: boolean) => void;
}) {
  const [checked, setChecked] = React.useState(defaultChecked || false);
  
  const handleChange = (v: boolean) => {
    setChecked(v);
    onChange?.(v);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium text-hive-text">{label}</p>
        <p className="text-hive-textDim text-sm">{description}</p>
      </div>
      <button
        onClick={() => handleChange(!checked)}
        className={clsx(
          'relative w-12 h-7 rounded-full transition-all',
          checked ? 'bg-gradient-to-r from-cyan to-purple' : 'bg-hive-border/50'
        )}
        aria-checked={checked}
        role="switch"
      >
        <span className={clsx(
          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )} />
      </button>
    </div>
  );
}

function SettingInput({ label, value, type, step, min, max, readonly, onChange }: { 
  label: string; 
  value: string | number; 
  type?: string; 
  step?: number;
  min?: number;
  max?: number;
  readonly?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-hive-textDim text-sm mb-2">{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readonly}
        step={step}
        min={min}
        max={max}
        className={clsx(
          'w-full glass rounded-xl px-4 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent',
          readonly && 'opacity-50 cursor-not-allowed'
        )}
      />
    </div>
  );
}