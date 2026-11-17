import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { mockCandles, mockIndicators, mockSignals } from "./mockData";

export function StrategyTestPage() {
  return (
    <main className="mx-auto max-w-[1800px] space-y-6">
      <div>
        <h1 className="m-0 text-3xl font-semibold tracking-tight">Strategy Test</h1>
        <p className="mt-2 mb-0 text-sm text-[#a1b0b7]">BTC/USDT · 1D · mock data</p>
      </div>
      <section className="overflow-hidden border border-[#344149] bg-[#192127]">
        <CandlestickChart candles={mockCandles} indicators={mockIndicators} signals={mockSignals} />
      </section>
    </main>
  );
}
