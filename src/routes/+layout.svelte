<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import Trend from './trendmap/+page.svelte';
	import { app } from '../store';
	import { Theme } from '../store/app/model';
	import { listen, send } from '../api/account/verify';

	const { theme, ready, setupForm, setupError, loading, setApiCredential } = app;

	onMount(() => {
		// Start internal api routes
		let unlisten = listen();

		// Check credentials
		send();

		// Cleanup on component unmount
		return async () => {
			(await unlisten)();
		};
	});
</script>

<div class={$theme === Theme.Dark ? 'dark' : 'light'}>
	{#if !$ready}
		<div
			class="primary-theme w-screen h-screen border-8 rounded-sm font-semibold flex items-center justify-center"
		>
			<form
				bind:this={$setupForm}
				class="secondary-theme rounded-lg flex flex-col items-center justify-center w-96 h-80 gap-4"
			>
				<div class="flex flex-col items-center">
					<img
						width="75px"
						src={'logo.png'}
						alt="robot with arms raised high and title below displaying 'Trader Companion'"
					/>
					<div class="flex flex-col items-center">
						<h1 class="text-3xl font-bold">T R A D E R</h1>
						<h2 class="text-xl flex justify-center items-center gap-1">Com<span class="w-2 h-2 rounded-full relative top-0.5 logo-theme"></span>pan<span class="w-2 h-2 rounded-full relative top-0.5 logo-theme"></span>ion</h2>
					</div>
				</div>
				<fieldset class="flex flex-col w-3/5 gap-3">
					<input
						name="alpaca-key"
						placeholder="Alpaca API Key"
						class="p-1 w-full {$setupError
							? 'border-red-important'
							: ''} rounded-md border text-sm font-normal transition-all focus:duration-0"
					/>
					<input
						name="alpaca-secret"
						placeholder="Alpaca Secret Key"
						class="p-1 w-full {$setupError
							? 'border-red-important'
							: ''} rounded-md border text-sm font-normal transition-all focus:duration-0"
					/>
					{#if $setupError}
						<p class="text-xs text-red-600">API credentials are incorrect</p>
					{/if}
				</fieldset>
				{#if !$loading}
					<button
						on:click={setApiCredential}
						class="rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
						>Enter</button
					>
				{:else}
					<div class="animate-spin w-6 h-6 border-t-4 rounded-full border-blue-500"></div>
				{/if}
			</form>
		</div>
	{:else}
		<Trend />
	{/if}
</div>
<!-- <slot /> -->
