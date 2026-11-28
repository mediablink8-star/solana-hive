'use client';

import React, { useState } from 'react';
import { useTokens } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { Search, Filter, ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus, DollarSign, RefreshCw } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'priceChange24h', label: '24h Change', icon: TrendingUp },
  { key: 'volume24h', label: 'Volume', icon: DollarSign },
  { key: 'liquidity', label: 'Liquidity', icon: DollarSign },
  { key: 'marketCap', label: 'Market Cap', icon: TrendingUp },
  { key: 'price', label: 'Price', icon: DollarSign },
];

export default function TokenScannerPage() {
  const { tokens, loading, refetch } = useTokens();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('priceChange24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedToken, setSelectedToken] = useState<any>(null);

  const filteredTokens = tokens
    .filter(t => t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a] || 0;
      const bVal = b[sortKey as keyof typeof b] || 0;
      return sortDir === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Token Scanner</h1>
          <p className="text-hive-textDim mt-1">Live market discovery and token intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-hive-border/50 text-hive-textMuted hover:text-cyan hover:border-cyan/50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass rounded-2xl border border-hive-border/50 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-textDim" />
            <input
              type="search"
              placeholder="Search tokens by symbol or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg pl-12 pr-4 py-3 text-hive-text placeholder-hive-textDim focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              className="bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-3 text-hive-text focus:outline-none focus:border-cyan/50"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-3 text-hive-text hover:border-cyan/50 transition-colors"
            >
              {sortDir === 'desc' ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Token Table */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hive-border/50 bg-hive-bg/50">
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">24h Change</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Volume</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Liquidity</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Market Cap</th>
                <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Holders</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-hive-textDim">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-cyan/50 border-t-transparent rounded-full animate-spin" />
                      <span>Loading tokens...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-hive-textDim">No tokens found</td>
                </tr>
              ) : (
                filteredTokens.map((token, idx) => (
                  <tr key={token.mint} className="border-b border-hive-border/30 hover:bg-hive-bgCard/50 transition-colors cursor-pointer" onClick={() => setSelectedToken(token)}>
                    <td className="px-4 py-3 text-hive-textDim text-xs font-mono">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-hive-bgCard flex items-center justify-center border border-hive-border/50">
                          <span className="text-xs font-bold text-hive-text">{token.symbol.slice(0, 3)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-hive-text">{token.symbol}</p>
                          <p className="text-hive-textDim text-xs truncate max-w-[150px]">{token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-hive-text">${token.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full', token.priceChange24h && token.priceChange24h > 0 ? 'bg-green/20 text-green' : token.priceChange24h && token.priceChange24h < 0 ? 'bg-red/20 text-red' : 'bg-hive-border/50 text-hive-textDim')}>
                        {token.priceChange24h ? `${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-hive-textDim">${token.volume24h?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-hive-textDim">${token.liquidity?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-hive-textDim">${token.marketCap?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-hive-textDim">{token.holders?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-hive-textDim hover:text-cyan transition-colors">Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Token Detail Modal */}
      {selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedToken(null)}>
          <div className="w-full max-w-2xl glass-strong border border-cyan/30 rounded-2xl overflow-hidden animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-hive-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-hive-bgCard flex items-center justify-center border border-hive-border/50">
                  <span className="text-sm font-bold text-hive-text">{selectedToken.symbol.slice(0, 4)}</span>
                </div>
                <div>
                  <p className="font-semibold text-hive-text">{selectedToken.symbol}</p>
                  <p className="text-hive-textDim text-xs">{selectedToken.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedToken(null)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-red">✕</button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4 border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Current Price</p>
                  <p className="text-2xl font-bold font-mono text-gradient-cyan">${selectedToken.price.toLocaleString()}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">24h Change</p>
                  <p className={clsx('text-2xl font-bold font-mono', selectedToken.priceChange24h && selectedToken.priceChange24h > 0 ? 'text-green' : 'text-red')}>
                    {selectedToken.priceChange24h ? `${selectedToken.priceChange24h > 0 ? '+' : ''}${selectedToken.priceChange24h.toFixed(2)}%` : '—'}
                  </p>
                </div>
                <div className="glass rounded-xl p-4 border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">24h Volume</p>
                  <p className="text-lg font-mono text-hive-text">${selectedToken.volume24h?.toLocaleString() || '—'}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Liquidity</p>
                  <p className="text-lg font-mono text-hive-text">${selectedToken.liquidity?.toLocaleString() || '—'}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Market Cap</p>
                  <p className="text-lg font-mono text-hive-text">${selectedToken.marketCap?.toLocaleString() || '—'}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-hive-border/50">
                  <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Holders</p>
                  <p className="text-lg font-mono text-hive-text">{selectedToken.holders?.toLocaleString() || '—'}</p>
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-hive-border/50">
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-2">Mint Address</p>
                <code className="text-hive-text text-xs font-mono break-all">{selectedToken.mint}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}