'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, Time, LineStyle, CrosshairMode } from 'lightweight-charts';
import { clsx } from 'clsx';

interface EquityDataPoint {
  time: UTCTimestamp;
  value: number;
}

interface DrawdownDataPoint {
  time: UTCTimestamp;
  value: number;
}

interface PnLDataPoint {
  time: UTCTimestamp;
  value: number;
  color: string;
}

interface EquityCurveChartProps {
  className?: string;
  height?: number;
  data: EquityDataPoint[];
  initialBalance?: number;
  showDrawdown?: boolean;
  showPnL?: boolean;
  onTimeRangeChange?: (from: Time, to: Time) => void;
}

const CYAN = '#00e5ff';
const PURPLE = '#b87dff';
const GREEN = '#00ff88';
const RED = '#ff3366';
const BG_COLOR = '#03050a';
const GRID_COLOR = 'rgba(26, 40, 66, 0.5)';
const TEXT_COLOR = '#7a8fa3';

export function EquityCurveChart({
  className,
  height = 400,
  data,
  initialBalance = 1,
  showDrawdown = true,
  showPnL = true,
  onTimeRangeChange,
}: EquityCurveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<any> | null>(null);
  const drawdownSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const pnlSeriesRef = useRef<ISeriesApi<any> | null>(null);

  // Process data for drawdown and P&L
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return { equity: [], drawdown: [], pnl: [] };

    let peak = initialBalance;
    const equity = data.map(d => ({ time: d.time, value: d.value }));
    const drawdown: DrawdownDataPoint[] = [];
    const pnl: PnLDataPoint[] = [];

    data.forEach((d, i) => {
      const value = d.value;
      if (value > peak) peak = value;
      const dd = peak > 0 ? ((value - peak) / peak) * 100 : 0;
      drawdown.push({ time: d.time, value: dd });

      // P&L as histogram (difference from previous)
      if (i === 0) {
        pnl.push({ time: d.time, value: value - initialBalance, color: value >= initialBalance ? GREEN : RED });
      } else {
        const change = value - data[i - 1].value;
        pnl.push({ time: d.time, value: change, color: change >= 0 ? GREEN : RED });
      }
    });

    return { equity, drawdown, pnl };
  }, [data, initialBalance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: 'solid', color: BG_COLOR },
        textColor: TEXT_COLOR,
        fontSize: 11,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        attributionLogo: false,
      } as any,
      grid: {
        vertLines: { color: GRID_COLOR, style: 0 },
        horzLines: { color: GRID_COLOR, style: 0 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(0, 229, 255, 0.5)', style: 0, width: 1, labelBackgroundColor: '#0a0f1a' },
        horzLine: { color: 'rgba(0, 229, 255, 0.5)', style: 0, width: 1, labelBackgroundColor: '#0a0f1a' },
      },
      rightPriceScale: {
        borderColor: GRID_COLOR,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        autoScale: true,
      },
      timeScale: {
        borderColor: GRID_COLOR,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisDoubleClickReset: true,
      },
    });

    chartRef.current = chart;

    // Equity curve line series
    const equitySeries = chart.addSeries('Line' as any, {
      color: CYAN,
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: CYAN,
      crosshairMarkerBackgroundColor: BG_COLOR,
      priceLineVisible: true,
      priceLineColor: CYAN,
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dashed,
      lastValueVisible: true,
      title: 'Equity',
    });
    equitySeriesRef.current = equitySeries;

    // Drawdown area (negative values)
    if (showDrawdown) {
      const drawdownSeries = chart.addSeries('Line' as any, {
        color: RED,
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        crosshairMarkerVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
        title: 'Drawdown %',
      });
      drawdownSeriesRef.current = drawdownSeries;
    }

    // P&L histogram
    if (showPnL) {
      const pnlSeries = chart.addSeries('Histogram' as any, {
        color: GREEN,
        base: 0,
        priceLineVisible: false,
        lastValueVisible: false,
        title: 'P&L',
      });
      pnlSeriesRef.current = pnlSeries;
    }

    // Set data
    if (processedData.equity.length > 0) {
      equitySeries.setData(processedData.equity);
      if (showDrawdown) drawdownSeriesRef.current?.setData(processedData.drawdown);
      if (showPnL) pnlSeriesRef.current?.setData(processedData.pnl);
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    // Time range change callback
    if (onTimeRangeChange) {
      chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
        if (range) {
          onTimeRangeChange(range.from, range.to);
        }
      });
    }

    return () => {
      resizeObserver.disconnect();
      chart.removeSeries(equitySeries);
      if (drawdownSeriesRef.current) chart.removeSeries(drawdownSeriesRef.current);
      if (pnlSeriesRef.current) chart.removeSeries(pnlSeriesRef.current);
      chart.remove();
      chartRef.current = null;
    };
  }, [height, showDrawdown, showPnL, onTimeRangeChange]);

  // Update data when it changes
  useEffect(() => {
    if (chartRef.current && equitySeriesRef.current && processedData.equity.length > 0) {
      equitySeriesRef.current.setData(processedData.equity);
      if (showDrawdown && drawdownSeriesRef.current) {
        drawdownSeriesRef.current.setData(processedData.drawdown);
      }
      if (showPnL && pnlSeriesRef.current) {
        pnlSeriesRef.current.setData(processedData.pnl);
      }
    }
  }, [processedData, showDrawdown, showPnL]);

  return (
    <div
      ref={containerRef}
      className={clsx('w-full rounded-2xl', className)}
      style={{ height, minHeight: height }}
    />
  );
}

interface Snapshot {
  ts: string;
  balance: number;
}

export function useEquityCurveData(snapshots: Snapshot[], initialBalance: number = 1) {
  return useMemo(() => {
    if (!snapshots || snapshots.length === 0) return [];
    
    return snapshots.map(s => ({
      time: Math.floor(new Date(s.ts).getTime() / 1000) as UTCTimestamp,
      value: s.balance,
    }));
  }, [snapshots, initialBalance]);
}