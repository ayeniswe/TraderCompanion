import { generateUID } from "../../lib";
import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import { send } from "../../api/account/create_api_credentials";
import { Method, RPCRequest, Version } from "../../api/model";
import type { ApiCredential } from "../../api/account/model";
import { Theme } from "./model";

function appStore() {
  const theme: Writable<Theme> = writable(Theme.Light);
  const ready: Writable<boolean> = writable(false);
  const loading: Writable<boolean> = writable(false);
  const setupError: Writable<boolean> = writable(false);
  const setupForm: Writable<HTMLFormElement | null> = writable(null);

  return {
    theme,
    ready,
    loading,
    setupError,
    setupForm,
    async setApiCredential(
      event: Event & { currentTarget: HTMLButtonElement },
    ) {
      event.preventDefault();

      const formData = new FormData(get(setupForm)!);
      const key = formData.get("alpaca-key")?.toString();
      const secret = formData.get("alpaca-secret")?.toString();
      if (key && secret) {
        // Verify api credentials
        loading.set(true);
        await fetch("/alpaca/account", {
          method: "GET",
          headers: {
            "APCA-API-KEY-ID": key,
            "APCA-API-SECRET-KEY": secret,
          },
        }).then((response) => {
          loading.set(false);
          if (response.ok) {
            // Update application database
            send(
              new RPCRequest<ApiCredential>(
                Version.V1,
                {
                  key,
                  secret,
                },
                Number(generateUID()),
                Method.Put,
              ),
            );
            ready.set(true);
            setupError.set(false);
          } else {
            setupError.set(true);
          }
        });
      }
    },
  };
}

export { appStore };
