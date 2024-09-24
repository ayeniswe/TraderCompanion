import { emit, listen as tauriListener } from '@tauri-apps/api/event';
import type { Event } from '@tauri-apps/api/event';
import { RPCResponse } from '../../model';
import { type Group } from '../model';
import { trendMap } from '../../../store';

/**
 * Listen for response to `trendmap/get_layout` route
 */
function listen_get_layout() {
	const { store } = trendMap;
	return tauriListener('trendmap/get_layout', (event: Event<RPCResponse<Group[]>>) => {
		store.restore(event.payload.response!);
	});
}

/**
 * Send request to `trendmap/get_layout` route
 */
function get_layout() {
	emit('trendmap/get_layout');
}

export { get_layout, listen_get_layout };
