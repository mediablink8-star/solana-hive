'use client';

import React, { useState } from 'react';
import { useTokens, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Token } from '@/types';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
  { id: 'technical', label: 'Technical', icon: 'trending-up' },
  { id: 'social', label: 'Social', icon: 'users' },
  { id: 'rug-check', label: 'Rug Check', icon: 'shield-alert' },
  { id: 'holders', label: 'Holders', icon: 'user-round' },
  { id: 'transactions', label: 'Transactions', icon: 'arrow-right-left' },
];

const ICONS: Record<string, React.ReactNode> = {
  'layout-dashboard': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" /><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" /><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" /><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5" /></svg>,
  'trending-up': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="1.5" /><polyline points="17 6 23 6 23 12" strokeWidth="1.5" /></svg>,
  'users': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="1.5" /><circle cx="9" cy="7" r="4" strokeWidth="1.5" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="1.5" /></svg>,
  'shield-alert': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5" /><path d="M12 8v4M12 16h.01" strokeWidth="1.5" /></svg>,
  'user-round': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" strokeWidth="1.5" /><circle cx="12" cy="7" r="4" strokeWidth="1.5" /></svg>,
  'arrow-right-left': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v10M7 17H7v-5H2" strokeWidth="1.5" /><path d="M17 7v10h-5" strokeWidth="1.5" /></svg>,
};

function TokenSelector({ tokens, selectedToken, onSelect }: { tokens: Token[]; selectedToken: Token | null; onSelect: (token: Token) => void }) {
  return (
    <div className="glass rounded-xl border border-hive-border/50 p-4">
      <h3 className="font-semibold text-hive-text mb-3">Select Token</h3>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {tokens.map((token) => (
          <button
            key={token.mint}
            onClick={() => onSelect(token)}
            className={clsx(
              'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
              selectedToken?.mint === token.mint
                ? 'bg-gradient-to-r from-cyan/10 to-purple/10 border border-cyan/30'
                : 'hover:bg-hive-bgCardHover/50 border border-hive-border/50'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
              <span className="text-sm font-bold text-green">{token.symbol?.charAt(0) || '$'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-hive-text truncate">{token.symbol || 'Unknown'}</p>
              <p className="text-hive-textDim text-xs truncate">{token.name || 'Unknown Token'}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-hive-text text-sm">${token.price?.toFixed(6) || '0'}</p>
              <p className="text-hive-textDim text-xs">${(token.liquidity || 0).toLocaleString()} liq.</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ token }: { token: Token | null }) {
  if (!token) return <div className="text-center text-hive-textDim py-12">Select a token to view details</div>;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Current Price</p>
          <p className="text-2xl font-bold font-mono text-gradient-cyan">${token.price?.toFixed(6) || '0'}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Liquidity</p>
          <p className="text-2xl font-bold font-mono text-green">${(token.liquidity || 0).toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">24h Volume</p>
          <p className="text-2xl font-bold font-mono text-cyan">${(token.volume24h || 0).toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">24h Change</p>
          <p className={`text-2xl font-bold font-mono ${token.priceChange24h && token.priceChange24h > 0 ? 'text-green' : token.priceChange24h && token.priceChange24h < 0 ? 'text-red' : 'text-hive-text'}`}>
            {token.priceChange24h ? (token.priceChange24h > 0 ? '+' : '') + token.priceChange24h.toFixed(2) + '%' : '—'}
          </p>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold text-hive-text mb-3">Token Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Symbol</p>
            <p className="font-mono text-hive-text">{token.symbol || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Name</p>
            <p className="font-mono text-hive-text">{token.name || 'Unknown Token'}</p>
          </div>
          <div>
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Mint Address</p>
            <p className="font-mono text-hive-textDim truncate">{token.mint}</p>
          </div>
          <div>
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Market Cap</p>
            <p className="font-mono text-hive-text">${(token.marketCap || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="text-center text-hive-textDim py-12">
      <p className="text-lg">{label} analysis coming soon</p>
      <p className="text-sm mt-2">Data integration in progress</p>
    </div>
  );
}

export default function TokenIntelligencePage() {
  const { tokens } = useTokens();
  const { wsConnected } = useWebSocket();
  const [selectedToken, setSelectedToken] = useState<Token | null>(tokens[0] || null);
  const [activeTab, setActiveTab] = useState('overview');

  const validTokens = tokens.filter(t => t.symbol !== 'UNKNOWN');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Token Intelligence</h1>
          <p className="text-hive-textDim mt-1">Deep token analysis and market intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
            <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
            <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
              {wsConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TokenSelector tokens={validTokens} selectedToken={selectedToken} onSelect={setSelectedToken} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="glass rounded-xl border border-hive-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-hive-border/50 flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan/10 to-purple/10 text-cyan border border-cyan/30'
                      : 'text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50'
                  )}
                >
                  <span className="flex items-center gap-1.5">{ICONS[tab.icon]} {tab.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab token={selectedToken} />}
              {activeTab === 'technical' && <PlaceholderTab label="Technical" />}
              {activeTab === 'social' && <PlaceholderTab label="Social" />}
              {activeTab === 'rug-check' && <PlaceholderTab label="Rug Check" />}
              {activeTab === 'holders' && <PlaceholderTab label="Holders" />}
              {activeTab === 'transactions' && <PlaceholderTab label="Transactions" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}