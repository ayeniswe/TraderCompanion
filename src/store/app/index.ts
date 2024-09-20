import { generateUID } from '$lib';
import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { send } from '../../api/account/verify';
import { Method, RPCRequest } from '../../api/model';
import type { AlpacaCredentials } from '../../api/account/model';
import { Theme } from './model';

function appStore() {
	const theme: Writable<Theme> = writable(Theme.Dark);
	const ready: Writable<boolean> = writable(false);
	const loading: Writable<boolean> = writable(false);
	const setupError: Writable<boolean> = writable(false);
	const setupForm: Writable<HTMLFormElement | null> = writable(null);

	return {
		theme,
		ready,
		loading,
		setupError,
		setupForm,
		async setAlpacaCredentials(event: Event & { currentTarget: HTMLButtonElement }) {
			event.preventDefault();

			const formData = new FormData(get(setupForm)!);
			const key = formData.get('alpaca-key')?.toString();
			const secret = formData.get('alpaca-secret')?.toString();
			if (key && secret) {
				// Verify api credentials
				loading.set(true)
				await fetch('/alpaca/account', {
					method: 'GET',
					headers: {
						'APCA-API-KEY-ID': key,
						'APCA-API-SECRET-KEY': secret
					}
				}).then((response) => {
					loading.set(false)
					if (response.ok) {
						// Update system env for later reading of creds
						send(
							new RPCRequest<AlpacaCredentials>(
								'v1',
								{
									key,
									secret
								},
								generateUID(),
								Method.Put
							)
						);
						ready.set(true);
						setupError.set(false);
					} else {
						setupError.set(true);
					}
				});
			}
		}
	};
}

export { appStore };
