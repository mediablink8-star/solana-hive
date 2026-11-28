'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, CrosshairMode, Time } from 'lightweight-charts';
import { clsx } from 'clsx';
import type { Position } from '@/types';

interface AllocationDataPoint {
  time: Time;
  value: number;
  color: string;
}

interface PositionAllocationChartProps {
  className?: string;
  height?: number;
  positions: Position[];
  totalInvested: number;
  onSegmentClick?: (mint: string) => void;
}

const CYAN = '#00e5ff';
const PURPLE = '#b87dff';
const GREEN = '#00ff88';
const RED = '#ff3366';
const ORANGE = '#ff8800';
const BG_COLOR = '#03050a';
const GRID_COLOR = 'rgba(26, 40, 66, 0.5)';
const TEXT_COLOR = '#7a8fa3';

const COLORS = [CYAN, PURPLE, GREEN, RED, ORANGE, '#00e5ff80', '#b87dff80', '#00ff8880'];

export function PositionAllocationChart({
  className,
  height = 300,
  positions,
  totalInvested,
  onSegmentClick,
}: PositionAllocationChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);

  const processedData = useMemo(() => {
    if (!positions || positions.length === 0 || totalInvested <= 0) return [];

    return positions.map((pos, i) => ({
      time: i as Time,
      value: (pos.sol_invested / totalInvested) * 100,
      color: COLORS[i % COLORS.length],
      mint: pos.mint,
      symbol: pos.symbol,
    }));
  }, [positions, totalInvested]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: 'color', color: BG_COLOR },
        textColor: TEXT_COLOR,
        fontSize: 11,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        attributionLogo: false,
      } as any,
      grid: {
        vertLines: { visible: false },
        horzLines: { color: GRID_COLOR, style: 0 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { visible: false },
        horzLine: { color: 'rgba(0, 229, 255, 0.3)', style: 0, width: 1, labelBackgroundColor: '#0a0f1a' },
      },
      rightPriceScale: {
        visible: false,
        borderColor: GRID_COLOR,
      },
      timeScale: {
        visible: false,
        borderColor: GRID_COLOR,
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: false, axisDoubleClickReset: false },
    });

    chartRef.current = chart;

    const series = chart.addSeries('Histogram' as any, {
      color: CYAN,
      base: 0,
      priceLineVisible: false,
      lastValueVisible: false,
      title: 'Allocation %',
    });
    seriesRef.current = series;

    if (processedData.length > 0) {
      series.setData(processedData);
    }

    // Handle click for interactivity
    const handleClick = (param: any) => {
      if (param.time !== undefined && onSegmentClick) {
        const index = param.time as number;
        if (processedData[index]) {
          onSegmentClick(processedData[index].mint);
        }
      }
    };

    chart.subscribeClick(handleClick);

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.unsubscribeClick(handleClick);
      chart.removeSeries(series);
      chart.remove();
      chartRef.current = null;
    };
  }, [height, onSegmentClick]);

  useEffect(() => {
    if (seriesRef.current && processedData.length > 0) {
      seriesRef.current.setData(processedData);
    }
  }, [processedData]);

  return (
    <div
      ref={containerRef}
      className={clsx('w-full rounded-2xl', className)}
      style={{ height, minHeight: height }}
    />
  );
}

export function PositionAllocationLegend({
  positions,
  totalInvested,
  activeMint,
  onClick,
}: {
  positions: Position[];
  totalInvested: number;
  activeMint?: string | null;
  onClick?: (mint: string) => void;
}) {
  if (!positions || positions.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      {positions.map((pos, i) => {
        const allocation = totalInvested > 0 ? (pos.sol_invested / totalInvested) * 100 : 0;
        const isActive = activeMint === pos.mint;
        
        return (
          <button
            key={pos.mint}
            onClick={() => onClick?.(pos.mint)}
            className={clsx(
              'glass p-3 rounded-xl border transition-all duration-200 text-left',
              isActive
                ? 'border-cyan/50 bg-cyan/10 shadow-glow-cyan ring-1 ring-cyan/30'
                : 'border-hive-border/50 hover:border-cyan/30 hover:bg-hive-bgCardHover/50'
            )}
            style={{ borderLeft: `4px solid ${COLORS[i % COLORS.length]}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="font-medium text-sm truncate">{pos.symbol || pos.mint.slice(0, 8)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-gradient-cyan">{pos.sol_invested.toFixed(4)} SOL</span>
              <span className="font-mono text-hive-textDim">{allocation.toFixed(1)}%</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={(pos.unrealized_pnl ?? 0) >= 0 ? 'text-green' : 'text-red'} font-mono>
                {pos.unrealized_pnl !== undefined ? ((pos.unrealized_pnl >= 0 ? '+' : '') + pos.unrealized_pnl.toFixed(4) + ' SOL') : '—'}
              </span>
              <span className={pos.unrealized_pnl_pct !== undefined && pos.unrealized_pnl_pct >= 0 ? 'text-green' : 'text-red'} font-mono>
                ({pos.unrealized_pnl_pct !== undefined ? pos.unrealized_pnl_pct.toFixed(2) + '%' : '—'})
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}