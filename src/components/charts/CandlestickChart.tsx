"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  createSeriesMarkers,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import { palette } from "@/config/theme";
import type { Candle, Indicator, Signal } from "@/types/chart";

const UP = palette.up;
const DOWN = palette.down;
const VOLUME_ALPHA = "66"; // 40% opacity as an 8-digit hex suffix

interface CandlestickChartProps {
  candles: Candle[];
  indicators?: Indicator[];
  signals?: Signal[];
  initialHeight?: number;
}

// Stable references so omitted props never retrigger effects.
const NO_INDICATORS: Indicator[] = [];
const NO_SIGNALS: Signal[] = [];
const INITIAL_VISIBLE_BARS = 120;

export function CandlestickChart({
  candles: data,
  indicators = NO_INDICATORS,
  signals = NO_SIGNALS,
  initialHeight = 520,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const lineSeriesRef = useRef(new Map<string, ISeriesApi<"Line">>());
  const candlesByTimeRef = useRef(new Map<number, Candle>());
  const [height, setHeight] = useState(initialHeight);
  const [hovered, setHovered] = useState<Candle | null>(null);

  // The chart is created once; data changes are applied by the effects below,
  // so zoom, scroll position and size are never reset by re-renders.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const lineSeries = lineSeriesRef.current;

    const chart = createChart(container, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: palette.surface }, textColor: palette.textSecondary },
      localization: { locale: "pl-PL" },
      crosshair: { mode: CrosshairMode.Normal },
      grid: { vertLines: { color: palette.grid }, horzLines: { color: palette.grid } },
      rightPriceScale: { borderColor: palette.border, scaleMargins: { top: 0.1, bottom: 0.25 } },
      timeScale: {
        borderColor: palette.border,
        timeVisible: true,
        rightOffset: 10,
        minBarSpacing: 0.5,
        shiftVisibleRangeOnNewBar: true,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: { time: true, price: true }, axisDoubleClickReset: { time: true, price: true } },
      kineticScroll: { mouse: true, touch: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP, downColor: DOWN, borderVisible: false, wickUpColor: UP, wickDownColor: DOWN,
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" }, priceScaleId: "", lastValueVisible: false, priceLineVisible: false,
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      const candle = typeof param.time === "number" && param.seriesData.has(candleSeries)
        ? candlesByTimeRef.current.get(param.time) ?? null
        : null;
      setHovered(candle);
    };
    chart.subscribeCrosshairMove(handleCrosshairMove);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    markersRef.current = createSeriesMarkers(candleSeries, []);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      markersRef.current?.detach();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      markersRef.current = null;
      lineSeries.clear();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    candlesByTimeRef.current = new Map(data.map((candle) => [candle.time, candle]));
    candleSeriesRef.current.setData(data);
    volumeSeriesRef.current.setData(data.map(({ time, volume, open, close }) => ({
      time, value: volume, color: close >= open ? `${UP}${VOLUME_ALPHA}` : `${DOWN}${VOLUME_ALPHA}`,
    })));

    // Like TradingView: show the latest bars with some room on the right, the rest is reachable by scrolling.
    chart.timeScale().setVisibleLogicalRange({
      from: Math.max(0, data.length - INITIAL_VISIBLE_BARS),
      to: data.length + 10,
    });
  }, [data]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const lineSeries = lineSeriesRef.current;
    const visible = indicators.filter((indicator) => indicator.visible);
    const visibleIds = new Set(visible.map((indicator) => indicator.id));

    for (const [id, series] of lineSeries) {
      if (!visibleIds.has(id)) {
        chart.removeSeries(series);
        lineSeries.delete(id);
      }
    }
    for (const { id, title, color, data: values } of visible) {
      let series = lineSeries.get(id);
      if (!series) {
        series = chart.addSeries(LineSeries, { lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
        lineSeries.set(id, series);
      }
      series.applyOptions({ title, color });
      series.setData(values);
    }
  }, [indicators]);

  useEffect(() => {
    markersRef.current?.setMarkers(signals.map(({ time, type }) => {
      const bullish = type === "BUY";
      return {
        time, text: type, color: bullish ? UP : DOWN,
        position: bullish ? "belowBar" : "aboveBar",
        shape: bullish ? "arrowUp" : "arrowDown",
      };
    }));
  }, [signals]);

  const candleColor = hovered && hovered.close >= hovered.open ? UP : DOWN;
  const format = (value: number) => value.toLocaleString("pl-PL", { minimumFractionDigits: 2 });
  const changePercent = hovered ? ((hovered.close - hovered.open) / hovered.open) * 100 : 0;

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full" style={{ height }} />
      {hovered && (
        <div
          className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap gap-x-4 gap-y-1 border px-3 py-2 text-xs tabular-nums"
          style={{ borderColor: palette.border, backgroundColor: `${palette.sidebar}e6` }}
        >
          <span style={{ color: palette.textSecondary }}>
            {new Date(hovered.time * 1000).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
          </span>
          <span>O <span style={{ color: candleColor }}>{format(hovered.open)}</span></span>
          <span>H <span style={{ color: candleColor }}>{format(hovered.high)}</span></span>
          <span>L <span style={{ color: candleColor }}>{format(hovered.low)}</span></span>
          <span>C <span style={{ color: candleColor }}>{format(hovered.close)}</span></span>
          <span>Vol <span style={{ color: candleColor }}>{hovered.volume.toLocaleString("pl-PL")}</span></span>
          <span style={{ color: candleColor }}>{changePercent >= 0 ? "+" : ""}{format(changePercent)}%</span>
        </div>
      )}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize chart height"
        tabIndex={0}
        className="flex h-3 cursor-row-resize touch-none items-center justify-center border-t"
        style={{ borderColor: palette.border, backgroundColor: palette.sidebar }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          setHeight((current) => Math.min(1200, Math.max(240, current + event.movementY)));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") setHeight((current) => Math.min(1200, current + 20));
          if (event.key === "ArrowUp") setHeight((current) => Math.max(240, current - 20));
        }}
      >
        <span className="h-0.5 w-10 rounded" style={{ backgroundColor: palette.muted }} />
      </div>
    </div>
  );
}
