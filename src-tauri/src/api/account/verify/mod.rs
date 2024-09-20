use super::model::AlpacaCredential;
use crate::api::model::RPCRequest;
use app::global::APP_HANDLE;
use std::env;
use tauri::Manager;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("account/verify", |event| {
            if let Ok(req) =
                serde_json::from_str::<RPCRequest<AlpacaCredential>>(event.payload().unwrap())
            {
                env::set_var("APCA_KEY", req.payload.key);
                env::set_var("APCA_SECRET", req.payload.secret);
            }
        });
}
