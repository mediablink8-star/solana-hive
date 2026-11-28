'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, CrosshairMode, Time } from 'lightweight-charts';
import { clsx } from 'clsx';

interface MetricDataPoint {
  time: Time;
  value: number;
}

interface PerformanceMetricsChartProps {
  className?: string;
  height?: number;
  data: MetricDataPoint[];
  metricName: string;
  color?: string;
  showArea?: boolean;
  yAxisFormatter?: (value: number) => string;
}

const CYAN = '#00e5ff';
const PURPLE = '#b87dff';
const GREEN = '#00ff88';
const RED = '#ff3366';
const BG_COLOR = '#03050a';
const GRID_COLOR = 'rgba(26, 40, 66, 0.5)';
const TEXT_COLOR = '#7a8fa3';

export function PerformanceMetricsChart({
  className,
  height = 200,
  data,
  metricName,
  color = CYAN,
  showArea = true,
  yAxisFormatter,
}: PerformanceMetricsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: 'color', color: BG_COLOR },
        textColor: TEXT_COLOR,
        fontSize: 10,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        attributionLogo: false,
      } as any,
      grid: {
        vertLines: { visible: false },
        horzLines: { color: GRID_COLOR, style: 0 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(0, 229, 255, 0.3)', style: 0, width: 1, labelBackgroundColor: '#0a0f1a' },
        horzLine: { color: 'rgba(0, 229, 255, 0.3)', style: 0, width: 1, labelBackgroundColor: '#0a0f1a' },
      },
      rightPriceScale: {
        borderColor: GRID_COLOR,
        autoScale: true,
      },
      timeScale: {
        visible: false,
        borderColor: GRID_COLOR,
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: false, axisDoubleClickReset: false },
    });

    chartRef.current = chart;

    const series = chart.addSeries('Line' as any, {
      color,
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 3,
      crosshairMarkerBorderColor: color,
      crosshairMarkerBackgroundColor: BG_COLOR,
      priceLineVisible: true,
      priceLineColor: color,
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dashed,
      lastValueVisible: true,
      title: metricName,
    });
    seriesRef.current = series;

    if (showArea) {
      series.applyOptions({
        crosshairMarkerVisible: false,
      });
    }

    // Convert data to proper format for lightweight-charts (time as unix timestamp in seconds)
    const formattedData = data.map(d => ({
      time: d.time,
      value: d.value,
    }));
    series.setData(formattedData);

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.removeSeries(series);
      // chart.destroy() - not available in this version
      chartRef.current = null;
    };
  }, [height, metricName, color, showArea, yAxisFormatter]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      className={clsx('w-full rounded-2xl', className)}
      style={{ height, minHeight: height }}
    />
  );
}

interface CandleDataPoint {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function TokenPriceChart({
  className,
  height = 300,
  data,
  symbol,
}: {
  className?: string;
  height?: number;
  data: CandleDataPoint[];
  symbol?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: 'color', color: BG_COLOR },
        textColor: TEXT_COLOR,
        fontSize: 10,
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
        autoScale: true,
      },
      timeScale: {
        borderColor: GRID_COLOR,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
      handleScale: { mouseWheel: true, pinch: true, axisDoubleClickReset: true },
    });

    chartRef.current = chart;

    const series = chart.addSeries('Candlestick' as any, {
      upColor: GREEN,
      downColor: RED,
      borderUpColor: GREEN,
      borderDownColor: RED,
      wickUpColor: GREEN,
      wickDownColor: RED,
      priceLineVisible: true,
      lastValueVisible: true,
    });
    seriesRef.current = series;

    // Convert data to proper format for lightweight-charts (time as unix timestamp in seconds)
    // Candlestick data uses open, high, low, close instead of value
    const formattedData = data.map(d => ({
      time: typeof d.time === 'number' ? Math.floor(d.time / 1000) : d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    series.setData(formattedData as any);

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.removeSeries(series);
      // chart.destroy() - not available in this version
      chartRef.current = null;
    };
  }, [height, symbol]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      className={clsx('w-full rounded-2xl', className)}
      style={{ height, minHeight: height }}
    />
  );
}