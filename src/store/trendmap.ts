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
		handleTickerDragStart(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			let ticker = event.currentTarget 
			ticker.classList.add('animate-bounce');
			event.dataTransfer!.effectAllowed = 'move';
			// Group id is needed to prevent reentry on drag
			event.dataTransfer?.setData(
				'text',
				JSON.stringify({
					ticker: ticker.id,
					// All section groups will have a internal div to contain the tickers
					// which result in a <section><div> draggable is here </div></section>
					group: ticker.parentElement!.parentElement!.id
				})
			);
		},
		handleTickerDragEnd(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.currentTarget.classList.remove('animate-bounce');
		},
		handleTickerGroupingDragOver(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.preventDefault(); // Necessary to allow for drop
			event.dataTransfer!.dropEffect = 'move';
		},
		handleTickerGroupingDragEnter(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			let newPotentialGroup = event.currentTarget

			// Children ele will disrupt drag n drop
			Array.from(newPotentialGroup.children).forEach((child) =>
				child.classList.add('pointer-events-none')
			);

			// Prevent child from invoking
			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			if (data.group !== newPotentialGroup.id && newPotentialGroup.role !== 'group') {
				// Show grouping box
				newPotentialGroup.classList.remove('border-gray-400');
				newPotentialGroup.classList.add('border-gray-800');
				newPotentialGroup.classList.add('bg-gray-500');
			} else if (data.group !== newPotentialGroup.id) {
				newPotentialGroup.classList.add('border-blue-500');
			}
		},
		handleTickerGroupingDragLeave(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			let newPotentialGroup = event.currentTarget

			// Children ele will disrupt drag n drop
			Array.from(newPotentialGroup.children).forEach((child) =>
				child.classList.remove('pointer-events-none')
			);

			// Prevent child from invoking
			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			if (data.group !== newPotentialGroup.id && newPotentialGroup.role !== 'group') {
				// Remove grouping box
				newPotentialGroup.classList.add('border-gray-400');
				newPotentialGroup.classList.remove('border-gray-800');
				newPotentialGroup.classList.remove('bg-gray-500');
			} else if (data.group !== newPotentialGroup.id) {
				newPotentialGroup.classList.remove('border-blue-500');
			}
		},
		handleTickerGroupingDrop(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.preventDefault();

			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			let newGroup = event.currentTarget
			let oldGroup = document.getElementById(data.group)!
			if (data.group !== event.currentTarget.id) {
				// Children ele will disrupt drag n drop
				Array.from(newGroup.children).forEach((child) =>
					child.classList.remove('pointer-events-none')
				);

				// All tickers live in their own potential group which will
				// always be the first element but upon adding to a potential group it will
				// not be considered as a group but rather groups are valid when atleast a single element 
				// is present
				if (newGroup.firstElementChild!.children.length) {				
					// Show title name for grouping and will always be last child
					// since a div and input reside in section for holding tickers (<div>) and naming (<input/>)
					newGroup.lastElementChild!.classList.remove('hidden');
					newGroup.lastElementChild!.classList.remove('bg-gray-400');
					newGroup.lastElementChild!.classList.add('bg-gray-500');
					
					// Set group as active to keep wrapping
					newGroup.role = 'group';
				} else if (newGroup.role !== "group") {
					// Remove grouping box
					newGroup.classList.add('border-gray-400');
					newGroup.classList.remove('border-gray-800');
					newGroup.classList.remove('bg-gray-500');
				}

				newGroup.classList.remove('border-blue-500');
				// Outside div will be containing group for scrolling
				newGroup.firstElementChild!.appendChild(document.getElementById(data.ticker)!);
				
				if (!oldGroup.firstElementChild!.children.length) {
					oldGroup.lastElementChild!.classList.add('hidden');
					// Remove grouping box
					oldGroup.classList.add('border-gray-400');
					oldGroup.classList.remove('border-gray-800');
					oldGroup.classList.remove('bg-gray-500');

					oldGroup.role = null
				}
			}
		},
	};
}

export { trendMapStore };
