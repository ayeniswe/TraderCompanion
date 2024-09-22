use super::model::Ticker;
use crate::api::model::{RPCRequest, RPCResponse, Version};
use app::{
    analysis::{
        trend::{get_trend, Fractals},
        utils::{lookback, TimeUnit},
    },
    external::api::alpaca::timeframe::TimeFrame,
    global::{ALPACA, APP_HANDLE},
    utils::generate_uid,
};
use polars::frame::DataFrame;
use std::{collections::HashMap, sync::Arc};
use tauri::Manager;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("trendmap/tickers", |event| {
            if let Ok(req) = serde_json::from_str::<RPCRequest<HashMap<String, Ticker>>>(
                event.payload().unwrap(),
            ) {
                tokio::spawn(async move {
                    let ticker_names: Vec<String> = req.payload.keys().cloned().collect();
                    let ticker_name_group: Vec<(String, String)> = req
                        .payload
                        .values()
                        .cloned()
                        .map(|x| (x.name, x.group_id))
                        .collect();
                    let tickers_midterm_data: Arc<HashMap<String, DataFrame>> = Arc::new(
                        ALPACA
                            .get()
                            .unwrap()
                            .get_historical_bars(
                                ticker_names.clone(),
                                TimeFrame::day(),
                                lookback(30i64, TimeUnit::Days(1i64)),
                            )
                            .await
                            .unwrap(),
                    );
                    let tickers_longterm_data: Arc<HashMap<String, DataFrame>> = Arc::new(
                        ALPACA
                            .get()
                            .unwrap()
                            .get_historical_bars(
                                ticker_names.clone(),
                                TimeFrame::week(),
                                lookback(30i64, TimeUnit::Days(5i64)),
                            )
                            .await
                            .unwrap(),
                    );
                    let tickers_shortterm_data: Arc<HashMap<String, DataFrame>> = Arc::new(
                        ALPACA
                            .get()
                            .unwrap()
                            .get_historical_bars(
                                ticker_names.clone(),
                                TimeFrame::hour(4).unwrap(),
                                lookback(30i64, TimeUnit::Hours(4i64)),
                            )
                            .await
                            .unwrap(),
                    );
                    for ticker in ticker_name_group {
                        let (ticker, group) = ticker;
                        let tickers_longterm_data_clone: Arc<HashMap<String, DataFrame>> =
                            tickers_longterm_data.clone();
                        let tickers_midterm_data_clone: Arc<HashMap<String, DataFrame>> =
                            tickers_midterm_data.clone();
                        let tickers_shortterm_data_clone: Arc<HashMap<String, DataFrame>> =
                            tickers_shortterm_data.clone();
                        tokio::spawn(async move {
                            let df_longterm: &DataFrame =
                                tickers_longterm_data_clone.get(&ticker).unwrap();
                            let df_midterm: &DataFrame =
                                tickers_midterm_data_clone.get(&ticker).unwrap();
                            let df_shortterm: &DataFrame =
                                tickers_shortterm_data_clone.get(&ticker).unwrap();
                            send(RPCResponse::new(
                                Version::V1,
                                Some(HashMap::from_iter(vec![(
                                    ticker.clone(),
                                    Ticker::new(
                                        ticker.clone(),
                                        group,
                                        get_trend(df_longterm, Fractals::new(1)),
                                        get_trend(df_midterm, Fractals::new(1)),
                                        get_trend(df_shortterm, Fractals::new(1)),
                                    ),
                                )])),
                                generate_uid(),
                                None,
                            ))
                        });
                    }
                });
            }
        });
}

/// Send a response to trendmap/tickers route
pub fn send(payload: RPCResponse<HashMap<String, Ticker>>) {
    let _ = APP_HANDLE
        .get()
        .unwrap()
        .emit_all("trendmap/tickers", payload);
}
