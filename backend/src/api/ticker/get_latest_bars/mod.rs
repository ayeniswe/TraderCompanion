use super::model::Ticker;
use crate::api::model::{RPCError, RPCRequest, RPCResponse, Version};
use app::{
    global::{ALPACA, APP_HANDLE},
    utils::generate_uid,
};
use polars::frame::DataFrame;
use std::collections::HashMap;
use tauri::Manager;
use thiserror::Error;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("ticker/get_latest_bars", |event| {
            if let Ok(req) =
                serde_json::from_str::<RPCRequest<Vec<Ticker>>>(event.payload().unwrap())
            {
                let symbols: Vec<String> = req
                    .payload
                    .iter()
                    .map(|ticker| ticker.name.clone())
                    .collect();
                tokio::spawn(async move {
                    let latest_prices: HashMap<String, DataFrame> = ALPACA
                        .get()
                        .unwrap()
                        .get_latest_bars(symbols)
                        .await
                        .unwrap();

                    let mut tickers: Vec<Ticker> = Vec::default();
                    for ticker in latest_prices {
                        if let Ok(column) = ticker.1.column("close") {
                            tickers.push(Ticker::new(
                                ticker.0.to_string(),
                                column.f64().unwrap().get(0).unwrap(),
                            ));
                        } else {
                            send(RPCResponse::new(
                                Version::V1,
                                None,
                                generate_uid(),
                                Some(RPCError::new(TickerError::NoData.to_string(), -32002)),
                            ));
                            return;
                        }
                    }
                    send(RPCResponse::new(
                        Version::V1,
                        Some(tickers),
                        generate_uid(),
                        None,
                    ))
                });
            }
        });
}

#[derive(Error, Debug, Clone)]
pub enum TickerError {
    #[error("ticker has not data")]
    NoData,
}

/// Send a response to `ticker/get_latest` route
pub fn send(payload: RPCResponse<Vec<Ticker>>) {
    let _ = APP_HANDLE
        .get()
        .unwrap()
        .emit_all("ticker/get_latest_bars", payload);
}
