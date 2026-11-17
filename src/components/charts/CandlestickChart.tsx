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
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import type { Candle, Indicator, Signal } from "@/types/chart";

const UP = "#35c99a";
const DOWN = "#f16d79";

interface CandlestickChartProps {
  candles: Candle[];
  indicators?: Indicator[];
  signals?: Signal[];
  initialHeight?: number;
}

export function CandlestickChart({ candles: data, indicators = [], signals = [], initialHeight = 520 }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(initialHeight);
  const [hovered, setHovered] = useState<Candle | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "#192127" }, textColor: "#a1b0b7" },
      crosshair: { mode: CrosshairMode.Normal },
      grid: { vertLines: { color: "#233038" }, horzLines: { color: "#233038" } },
      rightPriceScale: { borderColor: "#344149", scaleMargins: { top: 0.1, bottom: 0.25 } },
      timeScale: { borderColor: "#344149" },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: UP, downColor: DOWN, borderVisible: false, wickUpColor: UP, wickDownColor: DOWN,
    });
    candles.setData(data);

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" }, priceScaleId: "", lastValueVisible: false, priceLineVisible: false,
    });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volume.setData(data.map(({ time, volume: value, open, close }) => ({
      time, value, color: close >= open ? "rgba(53, 201, 154, 0.4)" : "rgba(241, 109, 121, 0.4)",
    })));

    for (const { title, color, data: values } of indicators.filter((indicator) => indicator.visible)) {
      const line = chart.addSeries(LineSeries, {
        color, title, lineWidth: 2, priceLineVisible: false, lastValueVisible: false,
      });
      line.setData(values);
    }

    const markers = createSeriesMarkers(candles, signals.map(({ time, type }) => {
      const bullish = type === "BUY";
      return {
        time, text: type, color: bullish ? UP : DOWN,
        position: bullish ? "belowBar" : "aboveBar",
        shape: bullish ? "arrowUp" : "arrowDown",
      };
    }));

    chart.timeScale().fitContent();

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      const hasCandle = param.time !== undefined && param.seriesData.has(candles);
      setHovered(hasCandle ? data.find((candle) => candle.time === param.time) ?? null : null);
    };
    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      markers.detach();
      chart.remove();
    };
  }, [data, indicators, signals]);

  const color = hovered && hovered.close >= hovered.open ? "text-[#35c99a]" : "text-[#f16d79]";
  const format = (value: number) => value.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full" style={{ height }} />
      {hovered && (
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap gap-x-4 gap-y-1 border border-[#344149] bg-[#151d22]/90 px-3 py-2 text-xs tabular-nums">
          <span className="text-[#a1b0b7]">
            {new Date(hovered.time * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
          </span>
          <span>O <span className={color}>{format(hovered.open)}</span></span>
          <span>H <span className={color}>{format(hovered.high)}</span></span>
          <span>L <span className={color}>{format(hovered.low)}</span></span>
          <span>C <span className={color}>{format(hovered.close)}</span></span>
          <span>Vol <span className={color}>{hovered.volume.toLocaleString("en-US")}</span></span>
        </div>
      )}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize chart height"
        tabIndex={0}
        className="flex h-3 cursor-row-resize touch-none items-center justify-center border-t border-[#344149] bg-[#151d22] hover:bg-[#293d43]"
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
        <span className="h-0.5 w-10 rounded bg-[#6d818a]" />
      </div>
    </div>
  );
}
