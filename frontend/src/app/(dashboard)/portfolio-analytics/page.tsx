'use client';

import React from 'react';
import { usePortfolio, usePerformance, useValidation } from '@/hooks/useApi';
import { EquityCurveChart, useEquityCurveData, PositionAllocationChart, PositionAllocationLegend, PerformanceMetricsChart } from '@/components/Charts';
import type { UTCTimestamp } from 'lightweight-charts';
import { clsx } from 'clsx';
import type { Snapshot } from '@/types';

export default function PortfolioAnalyticsPage() {
  const { portfolio, positions, portfolioConfig } = usePortfolio();
  const { fetchAgentPerformance, fetchStrategyPerformance } = usePerformance();
  const { fetchReconciliation } = useValidation();
  const [agentPerformance, setAgentPerformance] = React.useState<any[]>([]);
  const [strategyPerformance, setStrategyPerformance] = React.useState<any[]>([]);
  const [snapshots, setSnapshots] = React.useState<Snapshot[]>([]);
  const [reconciliation, setReconciliation] = React.useState<any>(null);
  const [selectedPositionMint, setSelectedPositionMint] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const loadPerformance = async () => {
      const [agentPerf, stratPerf, recon] = await Promise.all([
        fetchAgentPerformance(),
        fetchStrategyPerformance(),
        fetchReconciliation(),
      ]);
      setAgentPerformance(agentPerf || []);
      setStrategyPerformance(stratPerf || []);
      if (recon) setReconciliation(recon);
    };
    loadPerformance();
  }, [fetchAgentPerformance, fetchStrategyPerformance, fetchReconciliation]);

  // Calculate portfolio metrics
  const totalInvested = positions.reduce((sum, p) => sum + (p.sol_invested || 0), 0);
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
  const totalPortfolioValue = (portfolioConfig?.balance || 0) + totalInvested + totalUnrealizedPnl;
  const availableBalance = portfolioConfig?.balance || 0;
  const netROI = totalPortfolioValue > 1 ? ((totalPortfolioValue - 1) / 1) * 100 : 0;

  // Generate equity curve data from snapshots or use mock data
  const equityData = useEquityCurveData(snapshots.length > 0 ? snapshots : [
    { ts: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), balance: 1.0 },
    { ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), balance: 1.02 },
    { ts: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), balance: 0.98 },
    { ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), balance: 1.05 },
    { ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), balance: 1.03 },
    { ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), balance: 1.08 },
    { ts: new Date().toISOString(), balance: totalPortfolioValue },
  ]);

  // Mock performance metrics over time
  const winRateData = React.useMemo(() => [
    { time: Math.floor((Date.now() - 6 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 45 },
    { time: Math.floor((Date.now() - 5 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 52 },
    { time: Math.floor((Date.now() - 4 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 48 },
    { time: Math.floor((Date.now() - 3 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 55 },
    { time: Math.floor((Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 58 },
    { time: Math.floor((Date.now() - 1 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 62 },
    { time: Math.floor(Date.now() / 1000) as UTCTimestamp, value: 65 },
  ], []);

  const profitFactorData = React.useMemo(() => [
    { time: Math.floor((Date.now() - 6 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 1.2 },
    { time: Math.floor((Date.now() - 5 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 1.4 },
    { time: Math.floor((Date.now() - 4 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 1.3 },
    { time: Math.floor((Date.now() - 3 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 1.6 },
    { time: Math.floor((Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 1.7 },
    { time: Math.floor((Date.now() - 1 * 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp, value: 1.8 },
    { time: Math.floor(Date.now() / 1000) as UTCTimestamp, value: 2.1 },
  ], []);

  return (
    <div className="space-y-6 p-4 lg:p-6 xl:p-8 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Portfolio Analytics</h1>
          <p className="text-hive-textDim mt-1">Performance metrics, P&L analysis, and portfolio insights</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="text-xs font-mono text-green">LIVE</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Portfolio Value</p>
          <p className="text-3xl font-bold font-mono text-gradient-cyan mt-1">{totalPortfolioValue.toFixed(4)} SOL</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Available Balance</p>
          <p className="text-3xl font-bold font-mono text-gradient-cyan mt-1">{availableBalance.toFixed(4)} SOL</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Invested in Positions</p>
          <p className="text-3xl font-bold font-mono text-cyan mt-1">{totalInvested.toFixed(4)} SOL</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Unrealized P&L</p>
          <p className={clsx('text-3xl font-bold font-mono mt-1', totalUnrealizedPnl >= 0 ? 'text-green' : 'text-red')}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}{totalUnrealizedPnl.toFixed(4)} SOL
          </p>
        </div>
      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Net ROI</p>
          <p className={clsx('text-3xl font-bold font-mono mt-1', netROI >= 0 ? 'text-green' : 'text-red')}>
            {netROI >= 0 ? '+' : ''}{netROI.toFixed(2)}%
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Open Positions</p>
          <p className="text-3xl font-bold font-mono text-cyan mt-1">{positions.length} / {portfolioConfig?.max_positions || 3}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Max Allocation</p>
          <p className="text-3xl font-bold font-mono text-cyan mt-1">{(portfolioConfig?.max_alloc || 0.1) * 100}% per position</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-hive-border/50">
          <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Stop Loss / Take Profit</p>
          <p className="text-3xl font-bold font-mono text-cyan mt-1">
            {(portfolioConfig?.stop_loss || 0.15) * 100}% / {(portfolioConfig?.take_profit || 0.3) * 100}%
          </p>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="glass rounded-2xl border border-hive-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-hive-text">Equity Curve</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-cyan" />
              <span className="text-hive-textMuted font-mono text-xs">Equity</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-red" />
              <span className="text-hive-textMuted font-mono text-xs">Drawdown</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-green" />
              <span className="text-hive-textMuted font-mono text-xs">P&L</span>
            </div>
          </div>
        </div>
        <EquityCurveChart
          height={350}
          data={equityData}
          initialBalance={1}
          showDrawdown={true}
          showPnL={true}
        />
        <div className="mt-4 grid grid-cols-3 gap-4 text-left max-w-md mx-auto">
          <div className="glass rounded-xl p-4">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Starting Capital</p>
            <p className="font-mono font-semibold">1.0000 SOL</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Current Value</p>
            <p className="font-mono font-semibold text-gradient-cyan">{totalPortfolioValue.toFixed(4)} SOL</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Net P&L</p>
            <p className={clsx('font-mono font-semibold', totalUnrealizedPnl >= 0 ? 'text-green' : 'text-red')}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}{totalUnrealizedPnl.toFixed(4)} SOL
            </p>
          </div>
        </div>
      </div>

      {/* Position Allocation & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-hive-text">Position Allocation</h3>
            {selectedPositionMint && (
              <button
                onClick={() => setSelectedPositionMint(undefined)}
                className="text-hive-textDim text-xs font-mono hover:text-cyan transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>
          {positions.length > 0 ? (
            <>
              <PositionAllocationChart
                height={250}
                positions={positions}
                totalInvested={totalInvested}
                onSegmentClick={setSelectedPositionMint}
              />
              <PositionAllocationLegend
                positions={positions}
                totalInvested={totalInvested}
                activeMint={selectedPositionMint}
                onClick={setSelectedPositionMint}
              />
            </>
          ) : (
            <div className="text-center text-hive-textDim py-12">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
                <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
              </svg>
              <p>No open positions</p>
              <p className="text-sm mt-2">Execute a paper trade to open a position</p>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <h3 className="font-semibold text-hive-text mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Starting Capital</p>
              <p className="font-mono font-semibold">1.0000 SOL</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Current Value</p>
              <p className="font-mono font-semibold text-gradient-cyan">{totalPortfolioValue.toFixed(4)} SOL</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Net P&L</p>
              <p className={clsx('font-mono font-semibold', totalUnrealizedPnl >= 0 ? 'text-green' : 'text-red')}>
                {totalUnrealizedPnl >= 0 ? '+' : ''}{totalUnrealizedPnl.toFixed(4)} SOL
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">ROI</p>
              <p className={clsx('font-mono font-semibold', netROI >= 0 ? 'text-green' : 'text-red')}>
                {netROI >= 0 ? '+' : ''}{netROI.toFixed(2)}%
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Available Balance</p>
              <p className="font-mono font-semibold text-gradient-cyan">{availableBalance.toFixed(4)} SOL</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Invested</p>
              <p className="font-mono font-semibold text-cyan">{totalInvested.toFixed(4)} SOL</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Positions</p>
              <p className="font-mono font-semibold">{positions.length} / {portfolioConfig?.max_positions || 3}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-1">Max Drawdown</p>
              <p className="font-mono font-semibold text-red">
                {reconciliation?.maxDrawdown?.toFixed(2) ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Win Rate & Profit Factor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <h3 className="font-semibold text-hive-text mb-4">Win Rate Trend</h3>
          <PerformanceMetricsChart
            height={200}
            data={winRateData}
            metricName="Win Rate %"
            color="#00ff88"
            showArea={true}
            yAxisFormatter={(value) => value.toFixed(0) + '%'}
          />
        </div>
        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <h3 className="font-semibold text-hive-text mb-4">Profit Factor Trend</h3>
          <PerformanceMetricsChart
            height={200}
            data={profitFactorData}
            metricName="Profit Factor"
            color="#00e5ff"
            showArea={true}
            yAxisFormatter={(value) => value.toFixed(2)}
          />
        </div>
      </div>

      {/* Agent Performance */}
      {agentPerformance.length > 0 && (
        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <h3 className="font-semibold text-hive-text mb-4">Agent Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hive-border/50">
                  <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Agent</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Recs</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">BUY Recs</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Win Rate</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Avg Return</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-border/30">
                {agentPerformance.map((agent: any) => (
                  <tr key={agent.agent} className="hover:bg-hive-bgCardHover/50">
                    <td className="px-4 py-3 font-medium">{agent.agent}</td>
                    <td className="px-4 py-3 text-right font-mono">{agent.totalRecommendations || agent.total}</td>
                    <td className="px-4 py-3 text-right font-mono text-green">{agent.buyRecommendations || agent.buys}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyan">
                      {((agent.successfulPredictions || 0) / Math.max(agent.totalRecommendations || agent.total || 1) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {agent.avgReturn?.toFixed(2) ?? '—'}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="w-2 h-2 rounded-full bg-green animate-pulse inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategy Performance */}
      {strategyPerformance.length > 0 && (
        <div className="glass rounded-2xl border border-hive-border/50 p-6">
          <h3 className="font-semibold text-hive-text mb-4">Strategy Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hive-border/50">
                  <th className="px-4 py-3 text-left text-hive-textDim text-xs font-mono uppercase tracking-wider">Strategy</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Trades</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Win Rate</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Avg Return</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Profit Factor</th>
                  <th className="px-4 py-3 text-right text-hive-textDim text-xs font-mono uppercase tracking-wider">Sharpe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-border/30">
                {strategyPerformance.map((strat: any) => (
                  <tr key={strat.name} className="hover:bg-hive-bgCardHover/50">
                    <td className="px-4 py-3 font-medium">{strat.name}</td>
                    <td className="px-4 py-3 text-right font-mono">{strat.totalTrades}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyan">{strat.winRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {strat.avgReturn >= 0 ? '+' : ''}{strat.avgReturn.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-green">{strat.profitFactor.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">{strat.sharpeRatio?.toFixed(2) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}