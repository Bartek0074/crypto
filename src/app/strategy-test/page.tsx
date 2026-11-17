import { StrategyTestPage } from "@/components/pages/strategy-test/StrategyTestPage";
import { fetchCandles } from "@/queries/fetchCandles";
import type { Candle } from "@/types/chart";

export const dynamic = "force-dynamic";

const SYMBOL = "BTCUSDT";
const INTERVAL = "1d";
const FROM = new Date("2026-01-01T00:00:00Z");

async function loadCandles(): Promise<{ candles: Candle[]; error?: string }> {
  try {
    return { candles: await fetchCandles({ symbol: SYMBOL, interval: INTERVAL, from: FROM }) };
  } catch (e) {
    return { candles: [], error: e instanceof Error ? e.message : "Failed to load candles" };
  }
}

export default async function Page() {
  const { candles, error } = await loadCandles();
  
  return <StrategyTestPage candles={candles} symbol={SYMBOL} interval={INTERVAL} error={error} />;
}
