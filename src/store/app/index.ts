import { generateUID } from "../../lib";
import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import { send } from "../../api/account/create_api_credentials";
import { RPCRequest, Version } from "../../api/model";
import type { ApiCredential } from "../../api/account/model";
import { Theme } from "./model";

function appStore() {
  const theme: Writable<Theme> = writable(Theme.Light);
  const ready: Writable<boolean> = writable(false);
  const loading: Writable<boolean> = writable(false);
  const errorMessage: Writable<string> = writable("");
  const setupForm: Writable<HTMLFormElement | null> = writable(null);

  return {
    theme,
    ready,
    loading,
    errorMessage,
    setupForm,
    changeTheme() {
      if (get(theme) === Theme.Dark) {
        theme.set(Theme.Light);
      } else {
        theme.set(Theme.Dark);
      }
    },
    async setApiCredential(
      event: Event & { currentTarget: HTMLButtonElement },
    ) {
      event.preventDefault();

      const formData = new FormData(get(setupForm)!);
      const key = formData.get("alpaca-key")?.toString();
      const secret = formData.get("alpaca-secret")?.toString();
      if (key && secret) {
        loading.set(true);
        send(
          new RPCRequest<ApiCredential>(
            Version.V1,
            {
              key,
              secret,
            },
            Number(generateUID()),
          ),
        );
      }
    },
  };
}

export { appStore };
