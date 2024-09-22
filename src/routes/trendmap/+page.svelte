<script lang="ts">
	import { onMount } from 'svelte';
	import { trendMap } from '../../store';
	import { listen } from '../../api/trendmap/tickers';

	const {
		store,
		ticker,
		addTickerDialog,
		deleteTickerDialog,
		allowGroupNameChange,
		disableGroupNameChange,
		showDeleteTickerWarning,
		addTicker,
		setTicker,
		openAddTickerDialog,
		closeAddTickerDialog,
		closeDeleteTickerDialog,
		deleteTicker,
		toColor,
		handleTickerDragEnd,
		handleTickerDragStart,
		handleTickerGroupingDragLeave,
		handleTickerGroupingDragEnter,
		handleTickerGroupingDragOver,
		handleTickerGroupingDrop,
		validateGroupInput
	} = trendMap;

	onMount(() => {
		// Start internal api routes
		let unlisten = listen();

		// Start intervals
		trendMap.startUpdateTrendMap();

		// Cleanup on component unmount
		return async () => {
			(await unlisten)();
			trendMap.stopUpdateTrendMap();
		};
	});
</script>

<div class="w-screen h-screen">
	<div
		class="absolute w-full h-full flex items-end p-3 {$addTickerDialog || $deleteTickerDialog
			? 'justify-center items-center z-10'
			: null}"
	>
		{#if $addTickerDialog}
			<div
				class="secondary-theme border w-72 h-14 rounded-sm font-semibold flex items-center justify-between p-3 gap-3"
			>
				<div class="flex items-center w-full justify-around">
					<h1>Ticker</h1>
					<input
						on:input={setTicker}
						placeholder="TSLA"
						class="p-1 rounded-md border text-sm font-normal transition-all focus:duration-0 w-24"
					/>
				</div>
				<button
					on:click={addTicker}
					class="rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Save</button
				>
				<button
					on:click={closeAddTickerDialog}
					class="bg-red-important rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Cancel</button
				>
			</div>
		{/if}
		{#if $deleteTickerDialog}
			<div
				class="secondary-theme border w-96 h-14 rounded-sm font-semibold flex items-center justify-between p-3 gap-3"
			>
				<div class="flex items-center w-full justify-around">
					<p>Delete<span class="text-red-500 pl-1 pr-1">{$ticker}</span>. Are you sure?</p>
				</div>
				<button
					on:click={deleteTicker}
					class="bg-red-important rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Delete</button
				>
				<button
					on:click={closeDeleteTickerDialog}
					class="rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Cancel</button
				>
			</div>
		{/if}
	</div>
	<div
		class="primary-theme w-full h-full border-8 overflow-y-auto p-9 grid grid-cols-10 max-2xl:grid-cols-8 max-xl:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2"
	>
		{#each $store as [id, { name, tickers }]}
			<!-- svelte-ignore a11y-no-static-element-interactions (redudant role) -->
			<section
				class="h-64 w-44 group select-none p-16 relative rounded-lg transition-all duration-200 flex flex-col items-center gap-1"
				on:dragleave={handleTickerGroupingDragLeave}
				on:dragenter={handleTickerGroupingDragEnter}
				on:dragover={handleTickerGroupingDragOver}
				on:drop={handleTickerGroupingDrop}
				{id}
			>
				<div class="h-full flex flex-col gap-1.5 p-0.5 overflow-y-auto">
					{#each tickers as [name, { mid_term, long_term, short_term }]}
						<div
							class="cursor-pointer relative"
							on:dragstart={handleTickerDragStart}
							on:dragend={handleTickerDragEnd}
							on:contextmenu={(e) => showDeleteTickerWarning(id, e)}
							draggable="true"
							id={name}
						>
							<div
								class="primary-theme w-36 h-8 rounded-md top-1 absolute border border-black"
							></div>
							<div
								class="tertiary-theme w-36 h-8 rounded-md relative border p-1 flex gap-3 border-black"
							>
								<span class="font-semibold text-sm flex items-center justify-center">{name}</span>
								<div class="flex gap-1 items-center w-full">
									<svg class="rounded-full {toColor(long_term)} w-5 h-5"></svg>
									<svg class="rounded-full {toColor(mid_term)} w-4 h-4"></svg>
									<svg class="rounded-full {toColor(short_term)} w-3 h-3"></svg>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<input
					on:focusout={disableGroupNameChange}
					on:dblclick={allowGroupNameChange}
					on:input={(e) => validateGroupInput(id, e)}
					tabindex="-1"
					class="hidden bg-transparent-important font-extrabold absolute rounded-sm left-0 top-0 m-4 p-1 w-3/4"
					value={name}
					placeholder={'Untitled'}
					readonly
				/>
			</section>
		{/each}
	</div>
	{#if !$addTickerDialog}
		<button
			on:click={openAddTickerDialog}
			class="absolute bottom-0 m-6 w-20 h-8 focus:duration-0 rounded-md flex items-center justify-center font-normal p-1 active:scale-90 transition-all duration-200"
			>+ New</button
		>
	{/if}
</div>
