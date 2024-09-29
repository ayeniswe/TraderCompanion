use crate::api::model::{RPCError, RPCResponse, Version};
use app::{
    db::{account::action::get_api_credentials, connect::establish_connection},
    external::api::{alpaca::client::Alpaca, client::Authenticate},
    global::{ALPACA, APP_HANDLE},
    utils::generate_uid,
};
use diesel::SqliteConnection;
use tauri::Manager;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("account/verify", |_| {
            let mut conn: SqliteConnection = establish_connection();
            let response: RPCResponse<&str> = match get_api_credentials(&mut conn).unwrap() {
                Some(cred) => {
                    // Set global alpaca api for all api usage call outs
                    let _ = ALPACA.set(Alpaca::new(
                        None,
                        Authenticate::Token {
                            header_key: "APCA-API-KEY-ID".to_string(),
                            header_secret: "APCA-API-SECRET-KEY".to_string(),
                            key: cred.api_key,
                            secret: cred.api_secret,
                        },
                    ));
                    RPCResponse::new(
                        Version::V1,
                        Some("api credentials found"),
                        generate_uid(),
                        None,
                    )
                }
                None => RPCResponse::new(
                    Version::V1,
                    None,
                    generate_uid(),
                    Some(RPCError::new("No api credentials found".to_string(), 1)),
                ),
            };
            send(response);
        });
}

/// Send a response to `account/verify` route
pub fn send(payload: RPCResponse<&str>) {
    let _ = APP_HANDLE
        .get()
        .unwrap()
        .emit_all("account/verify", payload);
}
