use super::model::ApiCredential;
use crate::api::model::{RPCError, RPCRequest, RPCResponse, Version};
use app::{
    db::{account::action::upsert_api_credentials, connect::establish_connection},
    external::api::{alpaca::client::Alpaca, client::Authenticate},
    global::{ALPACA, APP_HANDLE},
    utils::generate_uid,
};
use diesel::SqliteConnection;
use reqwest::{Client, Error, Response};
use tauri::Manager;
use thiserror::Error;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("account/create_api_credentials", |event| {
            if let Ok(req) =
                serde_json::from_str::<RPCRequest<ApiCredential>>(event.payload().unwrap())
            {
                tokio::spawn(async {
                    // Verify api credentials actually exist
                    let client: Client = Client::new();
                    let response: Result<Response, Error> = client
                        .get("https://paper-api.alpaca.markets/v2/account")
                        .header("APCA-API-KEY-ID", &req.payload.key)
                        .header("APCA-API-SECRET-KEY", &req.payload.secret)
                        .send()
                        .await;

                    if let Ok(response) = response {
                        if response.status().is_success() {
                            let mut conn: SqliteConnection = establish_connection();
                            let _ = upsert_api_credentials(
                                &mut conn,
                                &req.payload.key,
                                &req.payload.secret,
                            );

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
                            send(RPCResponse::new(
                                Version::V1,
                                Some("api credentials are valid"),
                                generate_uid(),
                                None,
                            ));
                        } else {
                            send(RPCResponse::new(
                                Version::V1,
                                None,
                                generate_uid(),
                                Some(RPCError::new(
                                    ApiCredentialError::CredentialIncorrect.to_string(),
                                    -32001,
                                )),
                            ));
                        }
                    } else {
                        send(RPCResponse::new(
                            Version::V1,
                            None,
                            generate_uid(),
                            Some(RPCError::new(
                                ApiCredentialError::InternalServerError.to_string(),
                                -32000,
                            )),
                        ));
                    }
                });
            }
        });
}
#[derive(Error, Debug, Clone)]
pub enum ApiCredentialError {
    #[error("server can not be reached....Try again later")]
    InternalServerError,
    #[error("api credentials are incorrect")]
    CredentialIncorrect,
}

/// Send a response to `account/create_api_credentials` route
pub fn send(payload: RPCResponse<&str>) {
    let _ = APP_HANDLE
        .get()
        .unwrap()
        .emit_all("account/create_api_credentials", payload);
}
