import { emit, listen as tauriListener } from '@tauri-apps/api/event';
import type { Event } from '@tauri-apps/api/event';
import { RPCRequest, RPCResponse } from '../../model';
import { type Ticker, type TickersResponse } from '../model';
import { trendMap } from '../../../store';

/**
 * Listen for response to `trendmap/tickers` route
 */
function listen() {
	return tauriListener('trendmap/tickers', (event: Event<RPCResponse<TickersResponse>>) => {
		const tickers = event.payload.response;
		for (const key in tickers) {
			const ticker = tickers[key];
			const groupId = ticker.group_id;
			const group = trendMap.store.get(groupId)!;
			group.tickers.set(key, ticker);
			trendMap.store.set(groupId, group);
		}
	});
}

/**
 * Send request to `trendmap/tickers` route
 */
function send(payload: RPCRequest<Map<string, Ticker>>) {
	const req = new RPCRequest(
		payload.version,
		Object.fromEntries(payload.payload.entries()),
		payload.id,
		payload.method
	);
	emit('trendmap/tickers', req);
}

export { send, listen };
