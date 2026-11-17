import type { Signal, Trade } from "@/types/chart";

export interface SpotPortfolio {
  cash: number;
  quantity: number;
}

export interface SpotBacktestResult {
  trades: Trade[];
  portfolio: SpotPortfolio;
}

/**
 * Simulates one strategy on its own virtual spot portfolio (no fees, no slippage).
 * BUY spends all cash, SELL sells the whole position. BUY while in a position and
 * SELL while in cash are ignored. Call once per strategy to keep portfolios independent.
 */
export function runSpotBacktest(signals: Signal[], initialCash: number): SpotBacktestResult {
  if (initialCash <= 0) throw new RangeError("initialCash must be positive");

  const trades: Trade[] = [];
  const portfolio: SpotPortfolio = { cash: initialCash, quantity: 0 };
  let openTrade: Trade | null = null;

  for (const signal of [...signals].sort((a, b) => a.time - b.time)) {
    if (signal.type === "BUY" && !openTrade) {
      openTrade = {
        id: `trade-${trades.length + 1}`,
        entryTime: signal.time,
        exitTime: null,
        entryPrice: signal.price,
        exitPrice: null,
        quantity: portfolio.cash / signal.price,
        pnl: null,
      };
      portfolio.quantity = openTrade.quantity;
      portfolio.cash = 0;
      trades.push(openTrade);
    } else if (signal.type === "SELL" && openTrade) {
      openTrade.exitTime = signal.time;
      openTrade.exitPrice = signal.price;
      openTrade.pnl = (signal.price - openTrade.entryPrice) * openTrade.quantity;
      portfolio.cash = signal.price * openTrade.quantity;
      portfolio.quantity = 0;
      openTrade = null;
    }
  }

  return { trades, portfolio };
}
