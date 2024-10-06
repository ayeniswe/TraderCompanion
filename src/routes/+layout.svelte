<script>
  import { onMount } from "svelte";
  import "../app.css";
  import Trendmap from "./trendmap/+page.svelte";
  import { app } from "../store";
  import { Theme } from "../store/app/model";
  import { listen_verify, send } from "../api/account/verify";
  import { listen_create_api_credential } from "../api/account/create_api_credentials";

  const { theme, ready, setupForm, errorMessage, loading, setApiCredential } =
    app;

  onMount(() => {
    // Start internal api routes
    let unlisten_verify = listen_verify();
    let unlisten_create_api_credential = listen_create_api_credential();

    // Check credentials
    send();

    // Cleanup on component unmount
    return async () => {
      (await unlisten_verify)();
      (await unlisten_create_api_credential)();
    };
  });
</script>

<div class={$theme === Theme.Dark ? "dark" : "light"}>
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
            src={"logo.png"}
            alt="robot with arms raised high and title below displaying 'Trader Companion'"
          />
          <div class="flex flex-col items-center">
            <h1 class="text-3xl font-bold">T R A D E R</h1>
            <h2 class="text-xl flex justify-center items-center gap-1">
              Com<span class="w-2 h-2 rounded-full relative top-0.5 logo-theme"
              ></span>pan<span
                class="w-2 h-2 rounded-full relative top-0.5 logo-theme"
              ></span>ion
            </h2>
          </div>
        </div>
        <fieldset class="flex flex-col w-3/5 gap-3">
          <input
            disabled={$loading}
            name="alpaca-key"
            placeholder="Alpaca API Key"
            class="p-1 w-full {$errorMessage !== ''
              ? 'border-red-important'
              : ''} rounded-md border text-sm font-normal transition-all focus:duration-0"
          />
          <input
            disabled={$loading}
            name="alpaca-secret"
            placeholder="Alpaca Secret Key"
            class="p-1 w-full {$errorMessage !== ''
              ? 'border-red-important'
              : ''} rounded-md border text-sm font-normal transition-all focus:duration-0"
          />
          {#if $errorMessage !== ""}
            <p class="text-xs text-red-600 flex items-center gap-1">
              <img
                width="12"
                alt="error sign"
                src={"error.png"}
              />{$errorMessage}
            </p>
          {/if}
        </fieldset>
        {#if !$loading}
          <button
            on:click={setApiCredential}
            class="rounded-sm flex focus:duration-0 items-center justify-center font-normal p-1 w-16 h-6 active:scale-90 text-sm hover:opacity-90 transition-all duration-200"
            >Enter</button
          >
        {:else}
          <div
            class="animate-spin w-6 h-6 border-t-4 rounded-full border-blue-500"
          ></div>
        {/if}
      </form>
    </div>
  {:else}
    <Trendmap />
  {/if}
</div>
<!-- <slot /> -->
