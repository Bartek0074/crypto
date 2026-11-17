import { CandlestickChart } from "@/components/charts/CandlestickChart";
import type { Candle, CandleInterval, CandleSymbol } from "@/types/chart";

interface StrategyTestPageProps {
  candles: Candle[];
  symbol: CandleSymbol;
  interval: CandleInterval;
  error?: string;
}

export function StrategyTestPage({ candles, symbol, interval, error }: StrategyTestPageProps) {
  return (
    <main className="mx-auto max-w-[1800px] space-y-6">
      <div>
        <h1 className="m-0 text-3xl font-semibold tracking-tight">Strategy Test</h1>
        <p className="mt-2 mb-0 text-sm text-[#a1b0b7]">{symbol} · {interval} · Binance Spot</p>
      </div>
      <section className="overflow-hidden border border-[#344149] bg-[#192127]">
        {error ? (
          <div role="alert" className="px-5 py-4 text-sm">
            <div className="font-semibold text-[#f16d79]">Could not load market data</div>
            <div className="mt-1 text-[#a1b0b7]">{error}</div>
          </div>
        ) : (
          <CandlestickChart candles={candles} />
        )}
      </section>
    </main>
  );
}
