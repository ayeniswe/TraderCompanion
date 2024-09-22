use super::model::ApiCredential;
use crate::api::model::RPCRequest;
use app::{
    db::{account::action::upsert_api_credentials, connect::establish_connection},
    external::api::{alpaca::client::Alpaca, client::Authenticate},
    global::{ALPACA, APP_HANDLE},
};
use diesel::SqliteConnection;
use tauri::Manager;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("account/create_api_credentials", |event| {
            if let Ok(req) =
                serde_json::from_str::<RPCRequest<ApiCredential>>(event.payload().unwrap())
            {
                let mut conn: SqliteConnection = establish_connection();
                upsert_api_credentials(&mut conn, &req.payload.key, &req.payload.secret).unwrap();

                // Set global alpaca api for all api usage call outs
                let _ = ALPACA.set(Alpaca::new(
                    None,
                    Authenticate::Token {
                        header_key: "APCA-API-KEY-ID".to_string(),
                        header_secret: "APCA-API-SECRET-KEY".to_string(),
                        key: req.payload.key,
                        secret: req.payload.secret,
                    },
                ));
            }
        });
}
