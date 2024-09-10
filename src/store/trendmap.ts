import { createMapStore, generateUID } from '$lib';
import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { Trend, type Ticker } from '../api/trendmap/model';
import { send } from '../api/trendmap/tickers';
import { Method, RPCRequest } from '../api/model';

function trendMapStore() {
	const store = createMapStore<string, Ticker>();
	store.set('TEST', {
		name: 'TEST',
		mid_term: Trend.Unk,
		long_term: Trend.Unk,
		short_term: Trend.Unk
	});
	store.set('TESTe', {
		name: 'TESTe',
		mid_term: Trend.Unk,
		long_term: Trend.Unk,
		short_term: Trend.Unk
	});
	store.set('TESTer', {
		name: 'TESTer',
		mid_term: Trend.Unk,
		long_term: Trend.Unk,
		short_term: Trend.Unk
	});
	const ticker: Writable<string> = writable('');
	const addTickerDialog: Writable<boolean> = writable(false);
	const deleteTickerDialog: Writable<boolean> = writable(false);
	const updateShortTrendMap: Writable<number | null> = writable(null);
	const updateMidTrendMap: Writable<number | null> = writable(null);
	const updateLongTrendMap: Writable<number | null> = writable(null);

	interface DraggableTicker {
		ticker: string;
		group: string;
	}

	function closeAddTickerDialog() {
		addTickerDialog.set(false);
	}

	function timeUntilNextHour() {
		const now = new Date();
		const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
		return nextHour.getTime() - now.getTime();
	}

	function timeUntilNext8AM() {
		const now = new Date(); // Current time
		// Create a Date object for 8:00 AM of the next day
		const next8AM = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0, 0);
		return next8AM.getTime() - now.getTime(); // Difference in milliseconds
	}

	function timeUntilNext5DaysAt8AM() {
		const now = new Date();
		const next5Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 8, 0, 0, 0); // 8:00 AM in 5 days
		return next5Days.getTime() - now.getTime(); // Difference in milliseconds
	}

	return {
		ticker,
		store,
		addTickerDialog,
		deleteTickerDialog,
		deleteTicker() {
			store.delete(get(ticker))
			deleteTickerDialog.set(false)
		},
		showDeleteTickerWarning(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.preventDefault()
			deleteTickerDialog.set(true)
			ticker.set(event.currentTarget.id)
		},
		closeDeleteTickerDialog() {
			deleteTickerDialog.set(false)
		},
		startUpdateTrendMap() {
			// Calculate the initial delay to the next 4 hour
			const initial4HourDelay = timeUntilNextHour();
			setTimeout(() => {
				// Start the interval to run every top 4 hour
				const id = setInterval(
					() => {
						send(new RPCRequest('v1', store.all()!, generateUID(), Method.Get));
					},
					60 * 60 * 4 * 1000
				); // 4 hour in milliseconds
				updateShortTrendMap.set(id);
			}, initial4HourDelay);

			// Calculate delay until the next 8:00 AM
			const initialDayDelay = timeUntilNext8AM();
			setTimeout(() => {
				// Start the interval to run every day at 8:00 AM
				const id = setInterval(
					() => {
						send(new RPCRequest('v1', store.all()!, generateUID(), Method.Get));
					},
					24 * 60 * 60 * 1000
				); // 24 hours in milliseconds
				updateMidTrendMap.set(id);
			}, initialDayDelay);

			// Calculate delay until the next 8:00 AM in 5 days
			const initial5DayDelay = timeUntilNext5DaysAt8AM();
			setTimeout(() => {
				// Start the interval to run every 5 days at 8:00 AM
				const id = setInterval(
					() => {
						send(new RPCRequest('v1', store.all()!, generateUID(), Method.Get));
					},
					5 * 24 * 60 * 60 * 1000
				); // 5 days in milliseconds
				updateLongTrendMap.set(id);
			}, initial5DayDelay);
		},
		stopUpdateTrendMap() {
			updateShortTrendMap.update((id) => {
				if (id) clearInterval(id);
				return null;
			});
			updateMidTrendMap.update((id) => {
				if (id) clearInterval(id);
				return null;
			});
			updateLongTrendMap.update((id) => {
				if (id) clearInterval(id);
				return null;
			});
		},
		setTicker(event: Event & { currentTarget: HTMLInputElement }) {
			ticker.set(event.currentTarget.value);
		},
		addTicker() {
			if (get(ticker)) {
				let map = new Map<string, Ticker>();
				map.set(get(ticker), {
					name: get(ticker),
					mid_term: Trend.Unk,
					long_term: Trend.Unk,
					short_term: Trend.Unk
				});
				send(new RPCRequest('v1', map, get(ticker), Method.Get));
				closeAddTickerDialog();
			}
		},
		closeAddTickerDialog,
		openAddTickerDialog() {
			addTickerDialog.set(true);
		},
		toColor(val: Trend) {
			if (val == Trend.Down) {
				return 'bg-red-500';
			} else if (val == Trend.Up) {
				return 'bg-green-500';
			} else if (val == Trend.Range) {
				return 'bg-yellow-500';
			} else if (val == Trend.Unk) {
				return 'bg-white';
			}
		},
		handleDragStart(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.currentTarget.classList.add('animate-bounce');
			event.dataTransfer!.effectAllowed = 'move';
			// Group id is needed to prevent reentry on drag
			event.dataTransfer?.setData(
				'text',
				JSON.stringify({
					ticker: event.currentTarget.id,
					// All section groups will have a internal div to contain the tickers
					// which result in a <section><div> draggable is here </div></section>
					group: event.currentTarget.parentElement!.parentElement!.id
				})
			);
		},
		handleDragEnd(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.currentTarget.classList.remove('animate-bounce');
		},
		handleDragOver(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.preventDefault(); // Necessary to allow for drop
			event.dataTransfer!.dropEffect = 'move';
		},
		handleDragEnter(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			// Children ele will disrupt drag n drop
			Array.from(event.currentTarget.children).forEach((child) =>
				child.classList.add('pointer-events-none')
			);

			// Prevent child from invoking
			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			if (data.group !== event.currentTarget.id && event.currentTarget.role !== 'group') {
				// Show grouping box
				event.currentTarget.classList.remove('border-gray-400');
				event.currentTarget.classList.add('border-gray-800');
				event.currentTarget.classList.add('bg-gray-500');
			} else if (data.group !== event.currentTarget.id) {
				event.currentTarget.classList.add('border-green-500');
			}
		},
		handleDragLeave(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			// Children ele will disrupt drag n drop
			Array.from(event.currentTarget.children).forEach((child) =>
				child.classList.remove('pointer-events-none')
			);

			// Prevent child from invoking
			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			if (data.group !== event.currentTarget.id && event.currentTarget.role !== 'group') {
				// Remove grouping box
				event.currentTarget.classList.add('border-gray-400');
				event.currentTarget.classList.remove('border-gray-800');
				event.currentTarget.classList.remove('bg-gray-500');
			} else if (data.group !== event.currentTarget.id) {
				event.currentTarget.classList.remove('border-green-500');
			}
		},
		handleDrop(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.preventDefault();

			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			if (data.group !== event.currentTarget.id) {
				// Children ele will disrupt drag n drop
				Array.from(event.currentTarget.children).forEach((child) =>
					child.classList.remove('pointer-events-none')
				);

				// Outside div will be containing group for scrolling
				event.currentTarget.firstElementChild!.appendChild(document.getElementById(data.ticker)!);

				event.currentTarget.classList.remove('border-green-500');
				// Show title name for grouping and will always be last child
				// since a div and input reside in section for holding tickers (<div>) and naming (<input/>)
				event.currentTarget.lastElementChild!.classList.remove('hidden');
				event.currentTarget.lastElementChild!.classList.remove('bg-gray-400');
				event.currentTarget.lastElementChild!.classList.add('bg-gray-500');

				// All tickers live in their own potential group but
				// will be cleanup upon moving
				document.getElementById(data.group)!.remove();

				// Set group as active to keep wrapping
				event.currentTarget.role = 'group';
			}
		}
	};
}

export { trendMapStore };
