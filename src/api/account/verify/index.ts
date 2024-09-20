import { emit } from '@tauri-apps/api/event';
import { RPCRequest } from '../../model';
import { type AlpacaCredentials } from '../model';

/**
 * Send request to `account/verify` route
 */
function send(payload: RPCRequest<AlpacaCredentials>) {
	emit('account/verify', payload);
}

export { send };
