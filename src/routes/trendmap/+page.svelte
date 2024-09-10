<script lang="ts">
	import { generateUID } from '$lib';
	import { trendMap } from '../../store';

	const {
		store,
		ticker,
		addTickerDialog,
		deleteTickerDialog,
		showDeleteTickerWarning,
		addTicker,
		setTicker,
		openAddTickerDialog,
		closeAddTickerDialog,
		closeDeleteTickerDialog,
		deleteTicker,
		toColor,
		handleDragEnd,
		handleDragLeave,
		handleDragOver,
		handleDragEnter,
		handleDragStart,
		handleDrop
	} = trendMap;
</script>

<div class="opacity w-screen h-screen">
	<div
		class="absolute w-full h-full flex items-end p-3 {$addTickerDialog || $deleteTickerDialog
			? 'justify-center items-center z-10'
			: null}"
	>
		{#if $addTickerDialog}
			<div
				class="bg-gray-800 text-slate-200 w-72 h-14 border rounded-sm border-black font-semibold flex items-center justify-between p-3 gap-3"
			>
				<div class="flex items-center w-full justify-around">
					<h1>Ticker</h1>
					<input
						on:input={setTicker}
						placeholder="TSLA"
						class="p-1 rounded-md border text-sm font-normal bg-gray-700 hover:bg-gray-600 transition-all focus:duration-0 focus:bg-gray-700 border-gray-500 w-24"
					/>
				</div>
				<button
					on:click={addTicker}
					class="bg-blue-500 rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Save</button
				>
				<button
					on:click={closeAddTickerDialog}
					class="bg-red-500 rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Cancel</button
				>
			</div>
		{/if}
		{#if $deleteTickerDialog}
			<div
				class="bg-gray-800 text-slate-200 w-96 h-14 border rounded-sm border-black font-semibold flex items-center justify-between p-3 gap-3"
			>
				<div class="flex items-center w-full justify-around">
					<p>Delete<span class="text-red-500 pl-1 pr-1">{$ticker}</span>. Are you sure?</p>
				</div>
				<button
					on:click={deleteTicker}
					class="bg-red-500 rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Delete</button
				>
				<button
					on:click={closeDeleteTickerDialog}
					class="bg-blue-500 rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
					>Cancel</button
				>
			</div>
		{/if}
	</div>
	<div
		class="bg-gray-400 w-full h-full absolute border-black border-2 rounded-md p-9 grid max-2xl:grid-cols-8 max-xl:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2"
	>
		{#each $store as [name, { mid_term, long_term, short_term }]}
			<!-- svelte-ignore a11y-no-static-element-interactions (redudant role) -->
			<section
				class="h-full text-slate-200 p-16 relative rounded-md border border-gray-400 transition-all duration-200 flex flex-col items-center gap-1"
				on:dragleave={handleDragLeave}
				on:dragenter={handleDragEnter}
				on:dragover={handleDragOver}
				on:drop={handleDrop}
				id={generateUID()}
			>
				<div class="h-full flex flex-col">
					<button
						on:dragstart={handleDragStart}
						on:dragend={handleDragEnd}
						on:contextmenu={showDeleteTickerWarning}
						draggable="true"
						id={name}
					>
						<div class="bg-gray-200 w-36 h-8 rounded-md absolute border border-black"></div>
						<div
							class="bg-gray-800 w-36 h-8 rounded-md relative -top-1 border border-black p-1 flex gap-3"
						>
							<span class="font-semibold text-sm flex items-center justify-center">{name}</span>
							<div class="flex gap-1 items-center w-full">
								<svg class="rounded-full {toColor(long_term)} w-5 h-5 border border-black"></svg>
								<svg class="rounded-full {toColor(mid_term)} w-4 h-4 border border-black"></svg>
								<svg class="rounded-full {toColor(short_term)} w-3 h-3 border border-black"></svg>
							</div>
						</div>
					</button>
				</div>
				<input
					class="hidden font-extrabold absolute left-0 top-0 m-4 p-1 w-3/4 bg-gray-400"
					placeholder="Untitled"
				/>
			</section>
		{/each}
		{#if !$addTickerDialog}
			<button
				on:click={openAddTickerDialog}
				class="absolute bottom-0 m-3 w-20 h-8 focus:duration-0 rounded-md text-slate-200 bg-blue-500 flex items-center justify-center font-normal p-1 active:scale-90 hover:bg-blue-600 transition-all duration-200"
				>+ New</button
			>
		{/if}
	</div>
</div>
