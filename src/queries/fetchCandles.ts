import type { UTCTimestamp } from 'lightweight-charts';
import type { Candle, CandleInterval, CandleSymbol } from '@/types/chart';

const MAX_LIMIT = 1000;

// Binance returns klines as positional arrays; only the first six fields are used.
type BinanceKline = [
	number, // Open time (ms)
	string, // Open
	string, // High
	string, // Low
	string, // Close
	string, // Volume
	...unknown[],
];

function isBinanceKline(value: unknown): value is BinanceKline {
	return (
		Array.isArray(value) &&
		value.length >= 6 &&
		typeof value[0] === 'number' &&
		value
			.slice(1, 6)
			.every(
				(field) => typeof field === 'string' && Number.isFinite(Number(field)),
			)
	);
}

function toCandle(kline: BinanceKline): Candle {
	return {
		time: Math.floor(kline[0] / 1000) as UTCTimestamp, // ms -> UTC seconds
		open: Number(kline[1]),
		high: Number(kline[2]),
		low: Number(kline[3]),
		close: Number(kline[4]),
		volume: Number(kline[5]),
	};
}

interface FetchCandlesParams {
	symbol: CandleSymbol;
	interval: CandleInterval;
	from: Date;
	/** Defaults to the current time. */
	to?: Date;
	signal?: AbortSignal;
}

/**
 * Fetches all candles opening within [from, to], oldest first, paging forward in
 * batches of up to 1000. Throws on network errors, non-2xx responses and malformed payloads.
 */
export async function fetchCandles({
	symbol,
	interval,
	from,
	to = new Date(),
	signal,
}: FetchCandlesParams): Promise<Candle[]> {
	if (from.getTime() >= to.getTime()) {
		throw new RangeError('`from` must be earlier than `to`');
	}

	const url = process.env.FETCH_CANDLES_URL;
	if (!url) {
		throw new Error('FETCH_CANDLES_URL environment variable is not set');
	}

	const candlesByTime = new Map<number, Candle>();
	let cursor = from.getTime();

	while (cursor <= to.getTime()) {
		const params = new URLSearchParams({
			symbol,
			interval,
			startTime: String(cursor),
			endTime: String(to.getTime()),
			limit: String(MAX_LIMIT),
		});
		const response = await fetch(`${url}?${params}`, { signal });

		if (!response.ok) {
			throw new Error(
				`Binance API error: ${response.status} ${response.statusText}`,
			);
		}

		const data: unknown = await response.json();
		if (!Array.isArray(data) || !data.every(isBinanceKline)) {
			throw new Error('Unexpected response format from Binance API');
		}

		for (const kline of data) {
			const candle = toCandle(kline);
			candlesByTime.set(candle.time, candle);
		}

		if (data.length < MAX_LIMIT) break;
		cursor = data[data.length - 1][0] + 1;
	}

	return [...candlesByTime.values()].sort((a, b) => a.time - b.time);
}
