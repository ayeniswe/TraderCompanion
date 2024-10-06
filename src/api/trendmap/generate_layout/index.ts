import { emit, listen as tauriListener } from "@tauri-apps/api/event";
import type { Event } from "@tauri-apps/api/event";
import { RPCRequest, RPCResponse, Version } from "../../model";
import { Trend, type Ticker as TrendMapTicker } from "../model";
import { Ticker } from "../../ticker/model";
import { trendMap } from "../../../store";
import { get } from "svelte/store";
import { save_layout } from "../save_layout";
import { generateUID } from "../../../lib/utils";
import { get_latest_bars } from "../../ticker/get_latest_bars";

/**
 * Listen for response to `trendmap/generate_layout` route
 */
function listen_generate_layout() {
  const { store, loading, closeAddTickerDialog, errorMessage, hotNReadyStore } =
    trendMap;
  return tauriListener(
    "trendmap/generate_layout",
    (event: Event<RPCResponse<TrendMapTicker[]>>) => {
      if (!event.payload.error) {
        const tickers = event.payload.response!;
        // Setup mapping for easier lookup
        const tickerMap = new Map<number, TrendMapTicker[]>();
        tickers.forEach((ticker) => {
          if (!tickerMap.has(ticker.group_id)) {
            tickerMap.set(ticker.group_id, []);
          }
          tickerMap.get(ticker.group_id)!.push(ticker);
        });

        // Update hot n ready tab if found optimal trades
        let readyTickers: Ticker[] = tickers
          .map((ticker) => {
            if (ticker.long_term === Trend.Up && ticker.mid_term === Trend.Up) {
              return { name: ticker.name, price: 0 };
            }
            // Return undefined implicitly if the condition is not met
          })
          .filter((ticker) => ticker !== undefined);
        if (readyTickers.length) {
          get_latest_bars(
            new RPCRequest(Version.V1, readyTickers, generateUID()),
          );
        }

        // Iterate through each group and update its tickers
        const updatedGroups = get(store).map((group) => {
          const tickers = tickerMap.get(group.id);
          return {
            ...group,
            tickers: tickers !== undefined ? tickers : group.tickers,
          };
        });

        // Updates all tickers that changed
        store.restore(updatedGroups);

        save_layout(new RPCRequest(Version.V1, get(store), generateUID()));

        closeAddTickerDialog();
      } else {
        store.pop(); // revert new potential group
        errorMessage.set(event.payload.error.message);
      }

      loading.set(false);
    },
  );
}

/**
 * Send request to `trendmap/generate_layout` route
 */
function generate_layout(payload: RPCRequest<TrendMapTicker[]>) {
  emit("trendmap/generate_layout", payload);
}

export { generate_layout, listen_generate_layout };
