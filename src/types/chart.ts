import type { UTCTimestamp } from "lightweight-charts";

// All timestamps in the app are UTC seconds (UTCTimestamp), never milliseconds.
export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorPoint {
  time: UTCTimestamp;
  value: number;
}

export interface Indicator {
  id: string;
  title: string;
  color: string;
  visible: boolean;
  data: IndicatorPoint[];
}

// Spot only: BUY and SELL are the only supported signals.
export type SignalType = "BUY" | "SELL";

export interface Signal {
  id: string;
  time: UTCTimestamp;
  type: SignalType;
  price: number;
  strategyName?: string;
  description?: string;
}

// An executed spot trade; an open position has exitTime, exitPrice and pnl set to null.
export interface Trade {
  id: string;
  entryTime: UTCTimestamp;
  exitTime: UTCTimestamp | null;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  pnl: number | null;
}

export type CandleSymbol = "BTCUSDT" | "ETHUSDT";
export type CandleInterval = "1h" | "2h" | "4h" | "1d";
