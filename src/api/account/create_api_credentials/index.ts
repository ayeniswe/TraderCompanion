import { emit } from '@tauri-apps/api/event';
import { RPCRequest } from '../../model';
import { type ApiCredential } from '../model';

/**
 * Send request to `account/create_api_credentials` route
 */
function send(payload: RPCRequest<ApiCredential>) {
	emit('account/create_api_credentials', payload);
}

export { send };
