import { emit, listen as tauriListener } from "@tauri-apps/api/event";
import { RPCRequest, RPCResponse } from "../../model";
import { type ApiCredential } from "../model";
import type { Event } from "@tauri-apps/api/event";
import { app } from "../../../store";

/**
 * Listen for response to `account/create_api_credentials` route
 */
function listen_create_api_credential() {
  const { ready, loading, errorMessage } = app;

  return tauriListener(
    "account/create_api_credentials",
    (event: Event<RPCResponse<string>>) => {
      if (event.payload.response) {
        ready.set(true);
      } else {
        errorMessage.set(event.payload.error!.message);
      }
      loading.set(false);
    },
  );
}

/**
 * Send request to `account/create_api_credentials` route
 */
function send(payload: RPCRequest<ApiCredential>) {
  emit("account/create_api_credentials", payload);
}

export { send, listen_create_api_credential };
