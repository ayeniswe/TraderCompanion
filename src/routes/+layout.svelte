<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import Trend from './trendmap/+page.svelte';
	import { listen } from '../api/trendmap/tickers';
	import { trendMap } from '../store';

	onMount(() => {
		// Start internal api routes
		let unlisten = listen();

		// Start intervals
		trendMap.startUpdateTrendMap();

		// Cleanup on component unmount
		return async () => {
			(await unlisten)();
		};
	});
</script>

<Trend />
<!-- <slot /> -->
