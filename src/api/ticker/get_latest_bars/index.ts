import { emit, listen as tauriListener } from "@tauri-apps/api/event";
import type { Event } from "@tauri-apps/api/event";
import { RPCRequest, RPCResponse } from "../../model";
import { trendMap } from "../../../store";
import { Ticker } from "../model";
import { Trend } from "../../trendmap/model";

/**
 * Listen for response to `ticker/get_latest_bars` route
 */
function listen_get_latest_bars() {
  const { hotNReadyStore } = trendMap;
  return tauriListener(
    "ticker/get_latest_bars",
    (event: Event<RPCResponse<Ticker[]>>) => {
      if (event.payload.response) {
        hotNReadyStore.restore(event.payload.response);
      }
    },
  );
}

/**
 * Send request to `ticker/get_latest_bars` route
 */
function get_latest_bars(payload: RPCRequest<Ticker[]>) {
  emit("ticker/get_latest_bars", payload);
}

export { get_latest_bars, listen_get_latest_bars };
