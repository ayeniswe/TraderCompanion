<script lang="ts">
  import { onMount } from "svelte";
  import { trendMap } from "../../store";
  import { generateUID } from "../../lib";
  import { get_latest_bars } from "../../api/ticker/get_latest_bars";
  import { RPCRequest, Version } from "../../api/model";

  const { hotNReadyStore, stopUpdateLatestPrices, startUpdateLatestPrices } =
    trendMap;

  onMount(() => {
    // Update latest 1min price
    if ($hotNReadyStore.length) {
      get_latest_bars(
        new RPCRequest(Version.V1, $hotNReadyStore, generateUID()),
      );
    }
  });
</script>

<!-- Table of Tickers -->
<div
  class="absolute mt-12 w-4/5 h-4/5 flex gap-4 flex-col left-1/2 top-0 transform -translate-x-1/2 translate-y-0"
>
  {#each $hotNReadyStore as { name, price }}
    <div class="flex flex-col relative">
      <div class="border primary-theme rounded-md h-16 w-full"></div>
      <div
        class="border absolute -top-1 secondary-theme rounded-md h-16 w-full flex justify-between items-center"
      >
        <div class="flex justify-center p-8">{name}</div>
        <span class="bg-gradient-to-r pinch-gradient h-full w-full"></span>
        <div class="flex justify-center p-8">{price}</div>
      </div>
    </div>
  {/each}
</div>
