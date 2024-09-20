import { emit, listen as tauriListener } from '@tauri-apps/api/event';
import type { Event } from '@tauri-apps/api/event';
import { Method, RPCRequest } from '../../model';
import { type Ticker } from '../model';
import { trendMap } from '../../../store';
/**
 * Listen for request(s) to `trendmap/tickers` route
 */
function listen() {
	return tauriListener('trendmap/tickers', (event: Event<RPCRequest<[Ticker]>>) => {
		if (event.payload.method === Method.Put) {
			let tickers = event.payload.payload;
			for (const key in tickers) {
				const ticker = tickers[key];
				const groupId = ticker.group_id;
				const group = trendMap.store.get(groupId)!;
				group.tickers.set(key, ticker);
				trendMap.store.set(groupId, group);
			}
		}
	});
}

/**
 * Send request to `trendmap/tickers` route
 */
function send(payload: RPCRequest<Map<string, Ticker>>) {
	let req = new RPCRequest(
		payload.version,
		Object.fromEntries(payload.payload.entries()),
		payload.id,
		payload.method
	);
	emit('trendmap/tickers', req);
}

export { send, listen };
