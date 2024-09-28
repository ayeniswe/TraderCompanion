use super::model::Ticker;
use crate::api::model::{RPCError, RPCRequest, RPCResponse, Version};
use app::{
    analysis::{
        trend::{get_trend, Fractals},
        utils::{lookback, TimeUnit},
    },
    external::api::alpaca::timeframe::TimeFrame,
    global::{ALPACA, APP_HANDLE},
    utils::generate_uid,
};
use polars::export::rayon::iter::IntoParallelRefIterator;
use polars::export::rayon::iter::ParallelIterator;
use polars::frame::DataFrame;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tauri::Manager;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("trendmap/tickers", |event| {
            if let Ok(req) =
                serde_json::from_str::<RPCRequest<Vec<Ticker>>>(event.payload().unwrap())
            {
                tokio::spawn(async move {
                    let ticker_names: Vec<String> = req
                        .payload
                        .iter()
                        .cloned()
                        .map(|ticker| ticker.name)
                        .collect();
                    let ticker_name_group: Vec<(String, u16)> = req
                        .payload
                        .iter()
                        .cloned()
                        .map(|ticker| (ticker.name, ticker.group_id))
                        .collect();

                    // Need to check if any timeframe dataframe is valid to verify ticker exist
                    let midterm_data: HashMap<String, DataFrame> = ALPACA
                        .get()
                        .unwrap()
                        .get_historical_bars(
                            ticker_names.clone(),
                            TimeFrame::day(),
                            lookback(30i64, TimeUnit::Days(1i64)),
                        )
                        .await
                        .unwrap();

                    if !midterm_data.is_empty() {
                        let tickers_midterm_data: Arc<HashMap<String, DataFrame>> =
                            Arc::new(midterm_data);
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

                        let tickers: Vec<Ticker> = ticker_name_group
                            .par_iter()
                            .map(|ticker| {
                                let (ticker, group) = ticker;

                                let df_longterm: &DataFrame =
                                    tickers_longterm_data.get(ticker).unwrap();
                                let df_midterm: &DataFrame =
                                    tickers_midterm_data.get(ticker).unwrap();
                                let df_shortterm: &DataFrame =
                                    tickers_shortterm_data.get(ticker).unwrap();
                                Ticker::new(
                                    ticker.clone(),
                                    *group,
                                    get_trend(df_longterm, Fractals::new(1)),
                                    get_trend(df_midterm, Fractals::new(1)),
                                    get_trend(df_shortterm, Fractals::new(1)),
                                )
                            })
                            .collect();

                        send(RPCResponse::new(
                            Version::V1,
                            Some(tickers),
                            generate_uid(),
                            None,
                        ))
                    } else {
                        send(RPCResponse::new(
                            Version::V1,
                            None,
                            generate_uid(),
                            Some(RPCError::new("ticker not found".to_string(), 1)),
                        ))
                    }
                });
            }
        });
}

/// Send a response to trendmap/tickers route
pub fn send(payload: RPCResponse<Vec<Ticker>>) {
    let _ = APP_HANDLE
        .get()
        .unwrap()
        .emit_all("trendmap/tickers", payload);
}
