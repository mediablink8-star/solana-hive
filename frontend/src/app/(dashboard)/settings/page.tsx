'use client';

import React, { useState } from 'react';
import { usePortfolio, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';

export default function SettingsPage() {
  const { portfolioConfig } = usePortfolio();
  const { wsConnected } = useWebSocket();
  const [activeSection, setActiveSection] = useState('general');

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
    settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="1.5" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="1" /></svg>,
    wifi: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0114.08 0" strokeWidth="1.5" /><path d="M1.42 9a16 16 0 0121.16 0" strokeWidth="1.5" /><path d="M8.53 16.11a6 6 0 016.94 0" strokeWidth="1.5" /><line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    activity: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    shield: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5" /></svg>,
    palette: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="2.5" strokeWidth="1.5" /><circle cx="18.5" cy="10.5" r="2.5" strokeWidth="1.5" /><circle cx="8.5" cy="10.5" r="2.5" strokeWidth="1.5" /><circle cx="13.5" cy="14.5" r="2.5" strokeWidth="1.5" /></svg>,
    bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="1.5" /><path d="M13.73 21a2 2 0 01-3.46 0" strokeWidth="1.5" /></svg>,
    cpu: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.5" /><path d="M9 9h6M9 12h6M9 15h4" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'connection':
        return <ConnectionSettings />;
      case 'trading':
        return <TradingSettings portfolioConfig={portfolioConfig} />;
      case 'risk':
        return <RiskSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Settings</h1>
            <p className="text-hive-textDim mt-1">Configure your trading terminal preferences</p>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
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
              
              <div className="mt-8 pt-6 border-t border-hive-border/50">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-bgCardHover/50 border border-hive-border/50">
                  <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green animate-pulse' : 'bg-red'}`} />
                  <span className={`text-xs font-mono ${wsConnected ? 'text-green' : 'text-red'}`}>
                    {wsConnected ? 'CONNECTED' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
  );
}



function GeneralSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">General Settings</h2>
        <p className="text-hive-textDim">Basic application preferences and information</p>
      </div>

      <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6 space-y-6">
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
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" /><polyline points="17 8 12 3 7 8" strokeWidth="1.5" /><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" /></svg>
              Export Data
            </button>
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" /><polyline points="7 8 12 3 17 8" strokeWidth="1.5" /><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" /></svg>
              Import Data
            </button>
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl border border-red/30 hover:border-red/50 transition-colors text-sm font-medium flex items-center gap-2 text-red">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" strokeWidth="1.5" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="1.5" /></svg>
              Clear Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionSettings() {
  const [apiUrl, setApiUrl] = useState('https://solana-hive-api.onrender.com');
  const [wsUrl, setWsUrl] = useState('wss://solana-hive-api.onrender.com');
  
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Connection Settings</h2>
        <p className="text-hive-textDim">Configure backend API and WebSocket connections</p>
      </div>

      <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">API Endpoint</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-hive-textDim text-sm mb-2">API Base URL</label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-hive-bgCardHover/50 rounded-xl px-4 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent"
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
                className="w-full bg-hive-bgCardHover/50 rounded-xl px-4 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent"
                placeholder="wss://api.example.com"
              />
              <p className="text-hive-textDim text-xs">WebSocket endpoint for real-time updates</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Connection Status</h3>
          <div className="bg-hive-bgCardHover/50 rounded-xl p-4">
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

      <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Paper Trading Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingInput label="Starting Capital (SOL)" value={1.0} type="number" step={0.1} readonly />
            <SettingInput label="Max Positions" value={portfolioConfig?.max_positions || 3} type="number" min={1} max={10} readonly />
            <SettingInput label="Max Allocation per Position (%)" value={Math.round((portfolioConfig?.max_alloc || 0.1) * 100)} type="number" min={1} max={100} readonly />
            <SettingInput label="Stop Loss (%)" value={Math.round((portfolioConfig?.stop_loss || 0.15) * 100)} type="number" min={1} max={50} readonly />
            <SettingInput label="Take Profit (%)" value={Math.round((portfolioConfig?.take_profit || 0.3) * 100)} type="number" min={1} max={200} readonly />
            <SettingInput label="Default Trade Size (% of capital)" value={10} type="number" min={1} max={100} />
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
          <div className="space-y-3">
            <SettingToggle label="Minimum liquidity filter" description="Only trade tokens with $100k+ liquidity" defaultChecked />
            <SettingToggle label="Maximum market cap" description="Skip tokens above $100M market cap" />
            <SettingToggle label="Exclude stablecoins" description="Don't trade USDC, USDT, etc." defaultChecked />
            <SettingToggle label="New token delay" description="Wait 5 minutes after token discovery" defaultChecked />
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
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Risk Settings</h2>
        <p className="text-hive-textDim">Configure risk management rules</p>
      </div>

      <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Risk Rules</h3>
          <div className="space-y-3">
            <SettingToggle label="Enable stop loss" description="Automatically exit positions at stop loss" defaultChecked />
            <SettingToggle label="Enable take profit" description="Automatically exit positions at take profit" defaultChecked />
            <SettingToggle label="Max position size enforcement" description="Strictly enforce max allocation per position" defaultChecked />
            <SettingToggle label="Daily loss limit" description="Stop trading after 10% daily loss" defaultChecked />
            <SettingToggle label="Cooldown after losses" description="Wait 1 hour after 3 consecutive losses" defaultChecked />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Risk Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingInput label="Max Daily Loss (%)" value={10} type="number" min={1} max={50} />
            <SettingInput label="Cooldown Period (hours)" value={1} type="number" min={0} max={24} />
            <SettingInput label="Max Consecutive Losses" value={3} type="number" min={1} max={10} />
            <SettingInput label="Max Drawdown (%)" value={20} type="number" min={5} max={50} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [animations, setAnimations] = useState(true);
  
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Appearance</h2>
        <p className="text-hive-textDim">Customize the look and feel of the terminal</p>
      </div>

      <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setTheme('dark')}
              className={`p-6 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-cyan bg-cyan/10' : 'border-hive-border/50 hover:border-cyan/30'}`}
            >
              <div className="w-16 h-16 rounded-xl bg-hive-bgCardHover/50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth="1.5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="1.5" /></svg>
              </div>
              <p className="font-medium text-hive-text">Dark</p>
              <p className="text-hive-textDim text-sm">Default theme</p>
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={`p-6 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-cyan bg-cyan/10' : 'border-hive-border/50 hover:border-cyan/30'}`}
            >
              <div className="w-16 h-16 rounded-xl bg-hive-bgCardHover/50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth="1.5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="1.5" /></svg>
              </div>
              <p className="font-medium text-hive-text">Light</p>
              <p className="text-hive-textDim text-sm">Bright theme</p>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Animations</h3>
          <div className="space-y-3">
            <SettingToggle label="Enable animations" description="UI transitions and micro-interactions" checked={animations} onChange={setAnimations} />
            <SettingToggle label="Reduced motion" description="Disable non-essential animations for accessibility" />
            <SettingToggle label="Particle effects" description="Show particle animations in Spider Hive" checked={animations} onChange={setAnimations} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Notifications</h2>
        <p className="text-hive-textDim">Configure notification preferences</p>
      </div>

      <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Notification Types</h3>
          <div className="space-y-3">
            <SettingToggle label="Trade executions" description="Notify when paper trades are executed" defaultChecked />
            <SettingToggle label="Risk alerts" description="Stop loss and take profit triggers" defaultChecked />
            <SettingToggle label="New token discoveries" description="Notify when scanner finds new tokens" defaultChecked />
            <SettingToggle label="Agent decisions" description="Notify on BUY/REJECT recommendations" />
            <SettingToggle label="System health" description="Backend connectivity and errors" defaultChecked />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Delivery Settings</h3>
          <div className="space-y-3">
            <SettingToggle label="Browser notifications" description="Show native browser notifications" defaultChecked />
            <SettingToggle label="Sound alerts" description="Play sound for important events" />
            <SettingToggle label="Auto-refresh" description="Automatically refresh data" checked={autoRefresh} onChange={setAutoRefresh} />
            <div className="flex items-center gap-4">
              <label className="text-hive-textDim text-sm w-32">Refresh interval</label>
              <select 
                value={refreshInterval} 
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="flex-1 bg-hive-bgCardHover/50 rounded-xl px-4 py-2 text-hive-text border border-hive-border/50 focus:outline-none focus:border-cyan/50"
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
              </select>
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
        <h2 className="text-gradient-cyan font-display font-bold text-2xl mb-2">Advanced</h2>
        <p className="text-hive-textDim">Developer and experimental settings</p>
      </div>

      <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-hive-text mb-4">Debug</h3>
          <div className="space-y-3">
            <SettingToggle label="Debug mode" description="Show debug information in console" />
            <SettingToggle label="Verbose logging" description="Log all API requests and responses" />
            <SettingToggle label="Performance monitor" description="Show FPS and render times" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Experimental Features</h3>
          <div className="space-y-3">
            <SettingToggle label="Live trading (DISABLED)" description="Enable real trading - NOT AVAILABLE" disabled />
            <SettingToggle label="Multi-wallet support" description="Manage multiple paper trading wallets" />
            <SettingToggle label="Custom strategies" description="Load custom trading strategies" />
          </div>
        </div>

        <div className="pt-6 border-t border-hive-border/50">
          <h3 className="font-semibold text-hive-text mb-4">Data Export</h3>
          <div className="flex flex-wrap gap-3">
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" /><polyline points="17 8 12 3 7 8" strokeWidth="1.5" /><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" /></svg>
              Export All Data (JSON)
            </button>
            <button className="bg-hive-bgCardHover/50 px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" /><polyline points="17 8 12 3 7 8" strokeWidth="1.5" /><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" /></svg>
              Export Trades (CSV)
            </button>
            <button className="bg-red/10 px-4 py-2 rounded-xl border border-red/30 hover:border-red/50 transition-colors text-sm font-medium flex items-center gap-2 text-red">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" strokeWidth="1.5" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="1.5" /></svg>
              Factory Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hive-border/50">
      <span className="text-hive-textDim">{label}</span>
      <span className={`font-mono ${highlight ? 'font-semibold text-gradient-cyan' : 'text-hive-text'}`}>{value}</span>
    </div>
  );
}

function SettingToggle({ label, description, defaultChecked, checked, onChange, disabled }: { 
  label: string; 
  description: string; 
  defaultChecked?: boolean; 
  checked?: boolean; 
  onChange?: (v: boolean) => void; 
  disabled?: boolean;
}) {
  const [isOn, setIsOn] = useState(defaultChecked || false);
  const handleChange = (v: boolean) => { setIsOn(v); onChange?.(v); };
  const value = checked !== undefined ? checked : isOn;
  
  return (
    <label className={`flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div>
        <p className="font-medium text-hive-text">{label}</p>
        <p className="text-hive-textDim text-sm">{description}</p>
      </div>
      <button
        onClick={() => !disabled && handleChange(!value)}
        disabled={disabled}
        className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-gradient-to-r from-cyan to-purple' : 'bg-hive-border/50'}`}
        aria-pressed={value}
      >
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

function SettingInput({ label, value, type, step, min, max, readonly, disabled }: { 
  label: string; 
  value: number | string; 
  type?: 'number' | 'text';
  step?: number;
  min?: number;
  max?: number;
  readonly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-hive-textDim text-sm mb-2">{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={() => {}}
        step={step}
        min={min}
        max={max}
        readOnly={readonly}
        disabled={disabled}
        className={`w-full bg-hive-bgCardHover/50 rounded-xl px-4 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 ${readonly ? 'bg-hive-bg/50 text-hive-textDim' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}