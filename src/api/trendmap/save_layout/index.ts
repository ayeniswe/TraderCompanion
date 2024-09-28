import { emit } from "@tauri-apps/api/event";
import { RPCRequest } from "../../model";
import { type Group } from "../model";
/**
 * Send request to `trendmap/save_layout` route
 */
function save_layout(payload: RPCRequest<Group[]>) {
  emit("trendmap/save_layout", payload);
}

export { save_layout };
