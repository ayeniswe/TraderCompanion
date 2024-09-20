import { createMapStore, generateUID } from '$lib';
import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { Trend, type Group, type Ticker } from '../api/trendmap/model';
import { send } from '../api/trendmap/tickers';
import { Method, RPCRequest } from '../api/model';
import { app } from '.';

function trendMapStore() {
	const store = createMapStore<string, Group>();
	const ticker: Writable<string> = writable('');
	const trash: Writable<{ groupId: string; tickerId: string }> = writable({
		groupId: '',
		tickerId: ''
	});
	const addTickerDialog: Writable<boolean> = writable(false);
	const deleteTickerDialog: Writable<boolean> = writable(false);
	const updateShortTrendMap: Writable<number | null> = writable(null);
	const updateMidTrendMap: Writable<number | null> = writable(null);
	const updateLongTrendMap: Writable<number | null> = writable(null);

	interface DraggableTicker {
		tickerId: string;
		groupId: string;
	}

	function getAllTickers() {
		const map = new Map<string, Ticker>();
		get(store).forEach((group) => {
			group.tickers.forEach((value, key) => {
				map.set(key, value);
			});
		});

		return map;
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
		disableGroupNameChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
			event.currentTarget.readOnly = true;
			event.currentTarget.classList.add('outline-none');
		},
		allowGroupNameChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
			event.currentTarget.readOnly = false;
			event.currentTarget.classList.remove('outline-none');
		},
		validateGroupInput(
			id: string,
			event: Event & { currentTarget: EventTarget & HTMLInputElement }
		) {
			const target = event.target! as HTMLInputElement;
			target.value = target.value.replace(/[^a-zA-Z0-9]/g, '');
			store.get(id)!.name = target.value;
		},
		deleteTicker() {
			const { groupId, tickerId } = get(trash);

			// Remove ticker from persistent store
			const group = get(store).get(groupId)!;
			group.tickers.delete(tickerId);
			store.set(groupId, group);
			deleteTickerDialog.set(false);

			// Remove grouping box
			const grouping = document.getElementById(groupId)!;
			if (grouping.firstElementChild!.children.length <= 1) {
				grouping.lastElementChild!.classList.add('hidden');
				grouping.classList.remove('secondary-theme');

				grouping.role = null;
				group.name = '';
			}
		},
		showDeleteTickerWarning(
			id: string,
			event: MouseEvent & { currentTarget: EventTarget & HTMLElement }
		) {
			event.preventDefault();
			deleteTickerDialog.set(true);
			ticker.set(event.currentTarget.id);
			trash.set({ groupId: id, tickerId: event.currentTarget.id });
		},
		closeDeleteTickerDialog() {
			deleteTickerDialog.set(false);
		},
		startUpdateTrendMap() {
			// Calculate the initial delay to the next 4 hour
			const initial4HourDelay = timeUntilNextHour();
			setTimeout(() => {
				// Start the interval to run every top 4 hour
				const id = setInterval(
					() => {
						send(new RPCRequest('v1', getAllTickers(), generateUID(), Method.Get));
					},
					60 * 60 * 4 * 1000
				); // 4 hour in milliseconds
				updateShortTrendMap.set(id);
			}, initial4HourDelay);

			// Calculate delay until the next day at 8:00 AM
			const initialDayDelay = timeUntilNext8AM();
			setTimeout(() => {
				// Start the interval to run every day at 8:00 AM
				const id = setInterval(
					() => {
						send(new RPCRequest('v1', getAllTickers(), generateUID(), Method.Get));
					},
					24 * 60 * 60 * 1000
				); // 24 hours in milliseconds
				updateMidTrendMap.set(id);
			}, initialDayDelay);

			// Calculate delay until the next 8:00 AM in every 5days/week
			const initial5DayDelay = timeUntilNext5DaysAt8AM();
			setTimeout(() => {
				// Start the interval to run every 5days/week at 8:00 AM
				const id = setInterval(
					() => {
						send(new RPCRequest('v1', getAllTickers(), generateUID(), Method.Get));
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
			const target = event.target! as HTMLInputElement;
			target.value = target.value.replace(/[^a-zA-Z]/g, '');
			ticker.set(target.value);
		},
		addTicker() {
			if (get(ticker)) {
				const tickers = new Map<string, Ticker>();
				const id = generateUID();
				tickers.set(get(ticker), {
					name: get(ticker),
					group_id: id,
					mid_term: Trend.Unk,
					long_term: Trend.Unk,
					short_term: Trend.Unk
				});
				store.set(id, {
					name: '',
					tickers
				});
				send(new RPCRequest('v1', tickers, generateUID(), Method.Get));
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
			const ticker = event.currentTarget;
			ticker.classList.add('animate-bounce');
			event.dataTransfer!.effectAllowed = 'move';
			
			// Group id is needed to prevent reentry on drag
			event.dataTransfer?.setData(
				'text',
				JSON.stringify({
					tickerId: ticker.id,
					// All section groups will have a internal div to contain the tickers
					// which result in a <section><div> draggable is here </div></section>
					groupId: ticker.parentElement!.parentElement!.id
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
			const newPotentialGroup = event.currentTarget;

			// Children ele will disrupt drag n drop
			Array.from(newPotentialGroup.children).forEach((child) =>
				child.classList.add('pointer-events-none')
			);

			// Show grouping box
			newPotentialGroup.classList.add('secondary-theme');
		},
		handleTickerGroupingDragLeave(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			const newPotentialGroup = event.currentTarget;

			// Children ele will disrupt drag n drop
			Array.from(newPotentialGroup.children).forEach((child) =>
				child.classList.remove('pointer-events-none')
			);

			// Remove grouping box
			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			const { groupId } = data;
			if (groupId !== newPotentialGroup.id && newPotentialGroup.role !== 'group') {
				newPotentialGroup.classList.remove('secondary-theme');
			} 
		},
		handleTickerGroupingDrop(event: DragEvent & { currentTarget: EventTarget & HTMLElement }) {
			event.preventDefault();

			const data: DraggableTicker = JSON.parse(event.dataTransfer!.getData('text'));
			const { groupId, tickerId } = data;
			const newGroupId = event.currentTarget.id;
			const newGrouping = event.currentTarget;
			const oldGrouping = document.getElementById(groupId)!;

			// Children ele will disrupt drag n drop
			Array.from(newGrouping.children).forEach((child) =>
				child.classList.remove('pointer-events-none')
			);

			if (groupId !== newGroupId) {
				// Delete old group persistently
				const oldGroup = get(store).get(groupId)!;
				const ticker = oldGroup.tickers.get(tickerId)!;
				ticker.group_id = newGroupId;
				oldGroup.tickers.delete(tickerId);
				store.set(groupId, oldGroup);

				// Update new group persistently
				const newGroup = get(store).get(newGroupId)!;
				newGroup.tickers.set(tickerId, ticker);
				store.set(newGroupId, newGroup);

				// All tickers live in their own potential group which will
				// always be the first element but upon adding to a potential group it will
				// not be considered as a group but rather groups are valid when atleast a single element
				// is present
				if (newGrouping.firstElementChild!.children.length >= 1) {
					// Show title name for grouping and will always be last child
					// since a div and input reside in section for holding tickers (<div>) and naming (<input/>)
					newGrouping.lastElementChild!.classList.remove('hidden');

					// Set group as active to keep wrapping
					newGrouping.role = 'group';
				} else if (newGrouping.role !== 'group') {
					// Remove grouping box
					newGrouping.classList.remove('secondary-theme');
				}

				// The drop will lag and thinking a ticker is still in group
				// therefore 1 would represent 0 implying it was 1 ticker in the group before
				// moving
				if (oldGrouping.firstElementChild!.children.length <= 1) {
					oldGrouping.lastElementChild!.classList.add('hidden');
					// Remove grouping box
					oldGrouping.classList.remove('secondary-theme');
					
					// Reset store group name
					const group = store.get(groupId)!;
					group.name = '';
					// Reset actual user view group name
					store.set(groupId, group);
					let oldGroupingName = oldGrouping.lastElementChild as HTMLInputElement;
					oldGroupingName.value = '';

					oldGrouping.role = null;
				}
			}
		}
	};
}

export { trendMapStore };
