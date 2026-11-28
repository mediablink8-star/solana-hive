'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store';
import { clsx } from 'clsx';
import { 
  SlidersHorizontal, Wifi, Shield, Bell, Palette, 
  Terminal, Key, Database, Moon, Monitor, 
  ToggleLeft, ToggleRight, Save, Loader2
} from 'lucide-react';

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: SlidersHorizontal, description: 'Core application settings' },
  { id: 'connection', label: 'Connection', icon: Wifi, description: 'API and WebSocket configuration' },
  { id: 'trading', label: 'Trading', icon: Terminal, description: 'Trading parameters and limits' },
  { id: 'risk', label: 'Risk', icon: Shield, description: 'Risk management controls' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display options' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert and notification preferences' },
  { id: 'advanced', label: 'Advanced', icon: Database, description: 'Developer and debug settings' },
];

export default function SettingsPage() {
  const { activeTab, setActiveTab } = useUIStore();
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Settings</h1>
          <p className="text-hive-textDim mt-1">Configure your SOLANA HIVE experience</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-cyan/30 bg-cyan/5 text-cyan hover:bg-cyan/10 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl border border-hive-border/50 p-3 sticky top-24 h-fit">
            <nav className="space-y-1" role="navigation" aria-label="Settings sections">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-cyan/10 to-purple/10 text-cyan border border-cyan/30'
                        : 'text-hive-textMuted hover:text-hive-text hover:bg-hive-bgCard/50'
                    )}
                  >
                    <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', isActive ? 'bg-cyan/20' : 'bg-hive-bg/50')}>
                      <Icon className={clsx('w-4 h-4', isActive ? 'text-cyan' : 'text-hive-textMuted')} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-sm truncate">{section.label}</p>
                      <p className="text-[10px] text-hive-textDim truncate">{section.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeSection === 'general' && (
            <GeneralSettings />
          )}
          {activeSection === 'connection' && (
            <ConnectionSettings />
          )}
          {activeSection === 'trading' && (
            <TradingSettings />
          )}
          {activeSection === 'risk' && (
            <RiskSettings />
          )}
          {activeSection === 'appearance' && (
            <AppearanceSettings />
          )}
          {activeSection === 'notifications' && (
            <NotificationsSettings />
          )}
          {activeSection === 'advanced' && (
            <AdvancedSettings />
          )}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  const [autoStart, setAutoStart] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
      <h2 className="font-semibold text-hive-text flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-cyan" />
        General Settings
      </h2>
      <div className="space-y-4">
        <SettingToggle label="Auto-start on login" description="Automatically start the trading engine when you log in" value={autoStart} onChange={setAutoStart} />
        <SettingToggle label="Sound notifications" description="Play sounds for trade executions and alerts" value={soundEnabled} onChange={setSoundEnabled} />
        <SettingToggle label="Compact mode" description="Reduce spacing for more information density" value={compactMode} onChange={setCompactMode} />
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ConnectionSettings() {
  const [apiUrl, setApiUrl] = useState('https://solana-hive-api.onrender.com');
  const [wsUrl, setWsUrl] = useState('wss://solana-hive-api.onrender.com');
  const [reconnectEnabled, setReconnectEnabled] = useState(true);
  const [timeout, setTimeout] = useState(30000);

  return (
    <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
      <h2 className="font-semibold text-hive-text flex items-center gap-2">
        <Wifi className="w-5 h-5 text-cyan" />
        Connection Settings
      </h2>
      <div className="space-y-4">
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">API Endpoint</label>
          <input type="url" value={apiUrl} onChange={e => setApiUrl(e.target.value)} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50 font-mono text-sm" />
        </div>
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">WebSocket Endpoint</label>
          <input type="url" value={wsUrl} onChange={e => setWsUrl(e.target.value)} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50 font-mono text-sm" />
        </div>
        <SettingToggle label="Auto-reconnect" description="Automatically reconnect WebSocket on disconnect" value={reconnectEnabled} onChange={setReconnectEnabled} />
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Request Timeout (ms)</label>
          <input type="number" value={timeout} onChange={e => setTimeout(Number(e.target.value))} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50 font-mono text-sm" />
        </div>
      </div>
    </div>
  );
}

function TradingSettings() {
  const [autoTrade, setAutoTrade] = useState(true);
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [priorityFee, setPriorityFee] = useState(0.001);
  const [mevProtection, setMevProtection] = useState(true);

  return (
    <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
      <h2 className="font-semibold text-hive-text flex items-center gap-2">
        <Terminal className="w-5 h-5 text-cyan" />
        Trading Settings
      </h2>
      <div className="space-y-4">
        <SettingToggle label="Auto-trading enabled" description="Allow agents to execute trades automatically" value={autoTrade} onChange={setAutoTrade} />
        <SettingToggle label="MEV protection" description="Use Jito bundles for frontrunning protection" value={mevProtection} onChange={setMevProtection} />
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Max Slippage (%)</label>
          <input type="range" min="0.1" max="2" step="0.1" value={maxSlippage} onChange={e => setMaxSlippage(Number(e.target.value))} className="w-full accent-cyan" />
          <p className="text-hive-textDim text-xs mt-1">{maxSlippage}%</p>
        </div>
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Priority Fee (SOL)</label>
          <input type="number" step="0.0001" min="0" max="0.01" value={priorityFee} onChange={e => setPriorityFee(Number(e.target.value))} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50 font-mono text-sm" />
        </div>
      </div>
    </div>
  );
}

function RiskSettings() {
  const [maxPositions, setMaxPositions] = useState(10);
  const [maxAlloc, setMaxAlloc] = useState(20);
  const [stopLoss, setStopLoss] = useState(15);
  const [takeProfit, setTakeProfit] = useState(50);

  return (
    <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
      <h2 className="font-semibold text-hive-text flex items-center gap-2">
        <Shield className="w-5 h-5 text-cyan" />
        Risk Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RiskSlider label="Max Positions" value={maxPositions} min={1} max={20} unit="" onChange={setMaxPositions} />
        <RiskSlider label="Max Allocation per Position" value={maxAlloc} min={5} max={50} unit="%" onChange={setMaxAlloc} />
        <RiskSlider label="Stop Loss" value={stopLoss} min={5} max={50} unit="%" onChange={setStopLoss} />
        <RiskSlider label="Take Profit" value={takeProfit} min={20} max={200} unit="%" onChange={setTakeProfit} />
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('cyan');
  const [animations, setAnimations] = useState(true);
  const [particles, setParticles] = useState(true);

  return (
    <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
      <h2 className="font-semibold text-hive-text flex items-center gap-2">
        <Palette className="w-5 h-5 text-cyan" />
        Appearance
      </h2>
      <div className="space-y-4">
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Theme</label>
          <div className="flex gap-2">
            {['dark', 'light', 'system'].map(t => (
              <button key={t} onClick={() => setTheme(t)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${theme === t ? 'bg-cyan/20 text-cyan border border-cyan/30' : 'bg-hive-bg/50 text-hive-textMuted hover:bg-hive-bgCard/50'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Accent Color</label>
          <div className="flex gap-2">
            {['cyan', 'purple', 'green', 'orange', 'red'].map(c => (
              <button key={c} onClick={() => setAccentColor(c)} className={`w-10 h-10 rounded-lg border-2 transition-colors ${accentColor === c ? 'border-white scale-110' : 'border-hive-border/50 hover:border-hive-border'}`} style={{ backgroundColor: `var(--hive-${c})` }} />
            ))}
          </div>
        </div>
        <SettingToggle label="Animations" description="Enable UI animations and transitions" value={animations} onChange={setAnimations} />
        <SettingToggle label="Particle effects" description="Show background particle animations" value={particles} onChange={setParticles} />
      </div>
    </div>
  );
}

function NotificationsSettings() {
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);

  return (
    <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
      <h2 className="font-semibold text-hive-text flex items-center gap-2">
        <Bell className="w-5 h-5 text-cyan" />
        Notifications
      </h2>
      <div className="space-y-4">
        <SettingToggle label="Trade executions" description="Notify when trades are executed" value={tradeAlerts} onChange={setTradeAlerts} />
        <SettingToggle label="Risk alerts" description="Notify when risk limits are approached" value={riskAlerts} onChange={setRiskAlerts} />
        <SettingToggle label="System alerts" description="Notify for system events and maintenance" value={systemAlerts} onChange={setSystemAlerts} />
        <SettingToggle label="Email notifications" description="Send notifications via email" value={emailAlerts} onChange={setEmailAlerts} />
      </div>
    </div>
  );
}

function AdvancedSettings() {
  const [debugMode, setDebugMode] = useState(false);
  const [logLevel, setLogLevel] = useState('info');
  const [dataRetention, setDataRetention] = useState(30);

  return (
    <div className="glass rounded-2xl border border-hive-border/50 p-6 space-y-6">
      <h2 className="font-semibold text-hive-text flex items-center gap-2">
        <Database className="w-5 h-5 text-cyan" />
        Advanced Settings
      </h2>
      <div className="space-y-4">
        <SettingToggle label="Debug mode" description="Enable verbose logging and debug panels" value={debugMode} onChange={setDebugMode} />
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Log Level</label>
          <select value={logLevel} onChange={e => setLogLevel(e.target.value)} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50">
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="glass rounded-xl p-4 border border-hive-border/50">
          <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">Data Retention (days)</label>
          <input type="number" value={dataRetention} onChange={e => setDataRetention(Number(e.target.value))} className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-2 text-hive-text focus:outline-none focus:border-cyan/50 font-mono text-sm" />
        </div>
        <div className="glass rounded-xl p-4 border border-red/30 bg-red/5">
          <h3 className="font-medium text-red mb-2">Danger Zone</h3>
          <button className="px-4 py-2 bg-red/20 text-red rounded-lg hover:bg-red/30 transition-colors text-sm font-mono">Reset All Settings</button>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="glass rounded-xl p-4 border border-hive-border/50 flex items-center justify-between">
      <div>
        <p className="font-medium text-hive-text">{label}</p>
        <p className="text-hive-textDim text-xs">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={clsx('relative w-12 h-7 rounded-full transition-colors', value ? 'bg-cyan' : 'bg-hive-border')}
        role="switch"
        aria-checked={value}
      >
        <span className={clsx('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform', value ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

function RiskSlider({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="glass rounded-xl p-4 border border-hive-border/50">
      <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider block mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-cyan" />
        <span className="text-lg font-bold font-mono text-cyan w-16 text-right">{value}{unit}</span>
      </div>
    </div>
  );
}