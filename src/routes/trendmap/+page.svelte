<script lang="ts">
  import { onMount } from "svelte";
  import { trendMap } from "../../store";
  import { ThemeButton } from "../../lib";
  import { listen_get_latest_bars } from "../../api/ticker/get_latest_bars";
  import Watchlist from "./watchlist.svelte";
  import HotNReady from "./hot_n_ready.svelte";
  import { listen_generate_layout } from "../../api/trendmap/generate_layout";
  import { listen_get_layout } from "../../api/trendmap/get_layout";

  const {
    hotNReady,
    watchlist,
    setTabMenu,
    startUpdateWatchlist,
    stopUpdateWatchlist,
    stopUpdateReadyTickers,
    startUpdateReadyTickers,
    selectedTabMenu,
  } = trendMap;

  onMount(() => {
    // Set active tab
    setTabMenu($watchlist);

    // Start internal api routes
    const unlisten_get_latest_bars = listen_get_latest_bars();
    const unlisten_generate_layout = listen_generate_layout();
    const unlisten_get_layout = listen_get_layout();

    // Start intervals
    startUpdateReadyTickers();
    stopUpdateWatchlist();

    // Cleanup on component unmount
    return async () => {
      (await unlisten_get_layout)();
      (await unlisten_generate_layout)();
      (await unlisten_get_latest_bars)();
      stopUpdateReadyTickers;
      startUpdateWatchlist();
    };
  });
</script>

<div class="w-screen h-screen primary-theme border-2">
  <!-- Dynamic view tab -->
  {#if $selectedTabMenu === $watchlist}
    <Watchlist />
  {:else if $selectedTabMenu === $hotNReady}
    <HotNReady />
  {/if}
  <!-- Theme Change -->
  <ThemeButton />
  <!-- Mini-Menu -->
  <div
    class="absolute flex left-1/2 top-0 transform border border-black shadow-sm shadow-black -translate-x-1/2 translate-y-0"
  >
    <button
      bind:this={$hotNReady}
      on:click={() => setTabMenu($hotNReady)}
      class="text-sm w-28 {$selectedTabMenu === $hotNReady
        ? 'bg-blue-600-important'
        : ''} font-bold tertiary-theme focus:duration-0 p-1 transition-all duration-200 border-r-2"
      >Hot-N-Ready</button
    >
    <button
      bind:this={$watchlist}
      on:click={() => setTabMenu($watchlist)}
      class="text-sm w-24 {$selectedTabMenu === $watchlist
        ? 'bg-blue-600-important'
        : ''} font-bold tertiary-theme focus:duration-0 p-1 transition-all duration-200"
      >Watchlist</button
    >
  </div>
</div>
