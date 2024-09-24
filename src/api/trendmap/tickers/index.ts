import { emit, listen as tauriListener } from '@tauri-apps/api/event';
import type { Event } from '@tauri-apps/api/event';
import { RPCRequest, RPCResponse } from '../../model';
import { type Ticker } from '../model';
import { trendMap } from '../../../store';
import { get } from 'svelte/store';

/**
 * Listen for response to `trendmap/tickers` route
 */
function listen_ticker() {
	const { store } = trendMap
	return tauriListener('trendmap/tickers', (event: Event<RPCResponse<Ticker[]>>) => {
		// Setup mapping for easier lookup
		const tickerMap = new Map<number, Ticker[]>();
		event.payload.response!.forEach(ticker => {
			if (!tickerMap.has(ticker.group_id)) {
				tickerMap.set(ticker.group_id, []);
			}
			tickerMap.get(ticker.group_id)!.push(ticker);
		});

		// Iterate through each group and update its tickers
		const updatedGroups = get(store).map(group => {
			return {
				...group,
				tickers: tickerMap.get(group.id)!
			};
		});
		console.log(updatedGroups)
	});
}

/**
 * Send request to `trendmap/tickers` route
 */
function send(payload: RPCRequest<Ticker[]>) {
	emit('trendmap/tickers', payload);
}

export { send, listen_ticker };
