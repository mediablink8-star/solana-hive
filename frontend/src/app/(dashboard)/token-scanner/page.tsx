'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useTokens, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Token } from '@/types';

export default function TokenScannerPage() {
  const { tokens, refetch } = useTokens();
  const { wsConnected } = useWebSocket();
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Token; direction: 'asc' | 'desc' } | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const filteredTokens = useMemo(() => {
    let result = tokens;
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        t.symbol?.toLowerCase().includes(searchLower) ||
        t.mint.toLowerCase().includes(searchLower) ||
        t.name?.toLowerCase().includes(searchLower)
      );
    }

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === undefined || bVal === undefined) return 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [tokens, search, sortConfig]);

  const handleSort = (key: keyof Token) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '—';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const getLiquidityColor = (liquidity: number) => {
    if (liquidity >= 1e6) return 'text-green';
    if (liquidity >= 1e5) return 'text-yellow';
    if (liquidity >= 1e4) return 'text-orange';
    return 'text-red';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Token Scanner</h1>
            <p className="text-hive-textDim mt-1">Live Solana token discovery and market data</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
              <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
              <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
                {wsConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <button
              onClick={refetch}
              className="glass px-4 py-2 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M23 4v6h-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 20v-6h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Scan Now
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-4 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Total Discovered</p>
            <p className="text-2xl font-bold font-mono text-gradient-cyan">{tokens.length}</p>
          </div>
          <div className="glass p-4 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">High Liquidity (100k+)</p>
            <p className="text-2xl font-bold font-mono text-green">
              {tokens.filter(t => (t.liquidity || 0) >= 100000).length}
            </p>
          </div>
          <div className="glass p-4 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Avg Liquidity</p>
            <p className="text-2xl font-bold font-mono text-cyan">
              ${formatNumber(tokens.reduce((sum, t) => sum + (t.liquidity || 0), 0) / (tokens.length || 1))}
            </p>
          </div>
          <div className="glass p-4 rounded-2xl border border-hive-border/50">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Last Scan</p>
            <p className="text-2xl font-bold font-mono text-hive-text">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass rounded-2xl border border-hive-border/50 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by symbol, name, or mint address..."
                className="w-full glass rounded-xl px-10 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Sort:</label>
              <select
                value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : ''}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  if (key) setSortConfig({ key: key as keyof Token, direction: direction as 'asc' | 'desc' });
                  else setSortConfig(null);
                }}
                className="glass rounded-xl px-3 py-2 text-sm text-hive-text border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent"
              >
                <option value="">Default</option>
                <option value="symbol-asc">Symbol A-Z</option>
                <option value="symbol-desc">Symbol Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="liquidity-asc">Liquidity Low-High</option>
                <option value="liquidity-desc">Liquidity High-Low</option>
                <option value="updated_at-asc">Oldest First</option>
                <option value="updated_at-desc">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Token Table */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('price')}>
                    Price
                    {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('liquidity')}>
                    Liquidity
                    {sortConfig?.key === 'liquidity' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('volume24h')}>
                    24h Volume
                  </th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('priceChange24h')}>
                    24h Change
                  </th>
                  <th className="px-5 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Mint</th>
                  <th className="px-5 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-cyan transition-colors"
                      onClick={() => handleSort('updated_at')}>
                    Updated
                    {sortConfig?.key === 'updated_at' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-border/30">
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-hive-textDim">
                      {tokens.length === 0 ? 'No tokens discovered yet. Scanner runs every 30 seconds.' : 'No tokens match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((token) => (
                    <tr 
                      key={token.mint}
                      className="hover:bg-hive-bgCardHover/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedToken(token)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-green">{token.symbol?.charAt(0) || '$'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-hive-text truncate max-w-[150px]">{token.symbol || 'Unknown'}</p>
                            <p className="text-hive-textDim text-xs truncate max-w-[150px]">{token.name || 'Unknown Token'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-hive-text tabular-nums">
                        ${token.price?.toFixed(6) || '0'}
                      </td>
                      <td className="px-5 py-4 text-right font-mono tabular-nums">
                        <span className={clsx(getLiquidityColor(token.liquidity || 0))}>
                          ${formatNumber(token.liquidity)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-hive-textDim tabular-nums">
                        ${formatNumber(token.volume24h)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono tabular-nums">
                        <span className={clsx(
                          token.priceChange24h !== undefined && token.priceChange24h > 0 ? 'text-green' :
                          token.priceChange24h !== undefined && token.priceChange24h < 0 ? 'text-red' : 'text-hive-text'
                        )}>
                          {token.priceChange24h !== undefined ? (token.priceChange24h > 0 ? '+' : '') + token.priceChange24h.toFixed(2) + '%' : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-hive-textDim text-xs truncate max-w-[120px]">
                        {token.mint.slice(0, 12)}...
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-hive-textDim text-xs">
                        {new Date(token.updated_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {filteredTokens.length > 0 && (
            <div className="px-5 py-3 border-t border-hive-border/50 flex items-center justify-between">
              <span className="text-hive-textDim text-sm font-mono">
                Showing {filteredTokens.length} of {tokens.length} tokens
              </span>
              <span className="text-hive-textDim text-xs">
                Auto-refresh: 30s
              </span>
            </div>
          )}
        </div>

        {/* Token Detail Modal */}
        {selectedToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
               onClick={() => setSelectedToken(null)}
               role="dialog"
               aria-modal="true"
               aria-label={`${selectedToken.symbol} details`}>
            <div className="w-full max-w-2xl glass-strong border border-cyan/30 rounded-2xl overflow-hidden animate-slide-in"
                 onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-hive-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green/20 to-cyan/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-green">{selectedToken.symbol?.charAt(0) || '$'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-hive-text text-lg">{selectedToken.symbol}</h3>
                    <p className="text-hive-textDim text-sm">{selectedToken.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-red transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Current Price</p>
                    <p className="text-2xl font-bold font-mono text-gradient-cyan">${selectedToken.price?.toFixed(6) || '0'}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Liquidity</p>
                    <p className="text-2xl font-bold font-mono text-green">${formatNumber(selectedToken.liquidity)}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">24h Volume</p>
                    <p className="text-2xl font-bold font-mono text-cyan">${formatNumber(selectedToken.volume24h)}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">24h Change</p>
                    <p className={clsx(
                      'text-2xl font-bold font-mono',
                      selectedToken.priceChange24h !== undefined && selectedToken.priceChange24h > 0 ? 'text-green' :
                      selectedToken.priceChange24h !== undefined && selectedToken.priceChange24h < 0 ? 'text-red' : 'text-hive-text'
                    )}>
                      {selectedToken.priceChange24h !== undefined ? (selectedToken.priceChange24h > 0 ? '+' : '') + selectedToken.priceChange24h.toFixed(2) + '%' : '—'}
                    </p>
                  </div>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-2">Mint Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-hive-text text-sm font-mono bg-hive-bg/50 px-3 py-2 rounded-lg border border-hive-border/50 truncate">
                      {selectedToken.mint}
                    </code>
                    <button className="w-10 h-10 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-cyan transition-colors"
                            onClick={() => navigator.clipboard.writeText(selectedToken.mint)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="1.5" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 glass px-4 py-3 rounded-xl border border-hive-border/50 hover:border-cyan/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Run Analysis
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-cyan to-purple px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-hive-bg font-medium hover:opacity-90 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 11h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Paper Trade
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}