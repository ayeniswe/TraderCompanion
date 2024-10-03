import { emit, listen as tauriListener } from "@tauri-apps/api/event";
import type { RPCResponse } from "../../model";
import type { Event } from "@tauri-apps/api/event";
import { app } from "../../../store";

/**
 * Listen for response to `account/verify` route
 */
function listen_verify() {
  const { ready } = app;

  return tauriListener(
    "account/verify",
    (event: Event<RPCResponse<string>>) => {
      if (!event.payload.error) {
        ready.set(true);
      }
    },
  );
}

/**
 * Send request to `account/verify` route
 */
function send() {
  emit("account/verify");
}

export { send, listen_verify };
