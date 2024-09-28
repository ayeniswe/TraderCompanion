import { emit, listen as tauriListener } from "@tauri-apps/api/event";
import type { Event } from "@tauri-apps/api/event";
import { Method, RPCRequest, RPCResponse, Version } from "../../model";
import { type Ticker } from "../model";
import { trendMap } from "../../../store";
import { get } from "svelte/store";
import { save_layout } from "../save_layout";
import { generateUID } from "../../../lib/utils";

/**
 * Listen for response to `trendmap/tickers` route
 */
function listen_ticker() {
  const { store, loading, closeAddTickerDialog, errorMessage } = trendMap;
  return tauriListener(
    "trendmap/tickers",
    (event: Event<RPCResponse<Ticker[]>>) => {
      if (!event.payload.error) {
        // Setup mapping for easier lookup
        const tickerMap = new Map<number, Ticker[]>();
        event.payload.response!.forEach((ticker) => {
          if (!tickerMap.has(ticker.group_id)) {
            tickerMap.set(ticker.group_id, []);
          }
          tickerMap.get(ticker.group_id)!.push(ticker);
        });

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

        save_layout(
          new RPCRequest(Version.V1, get(store), generateUID(), Method.Put),
        );

        closeAddTickerDialog();
      } else {
        errorMessage.set(event.payload.error.message);
      }

      loading.set(false);
    },
  );
}

/**
 * Send request to `trendmap/tickers` route
 */
function send(payload: RPCRequest<Ticker[]>) {
  emit("trendmap/tickers", payload);
}

export { send, listen_ticker };
