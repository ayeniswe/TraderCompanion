use super::model::Ticker;
use crate::{
    analysis::{
        trend::{get_trend, Fractals},
        utils::{lookback, TimeUnit},
    },
    api::model::{Method, RPCRequest},
};
use app::{
    external::api::alpaca::timeframe::{TimeFrame, TimeFrameUnit},
    global::{ALPACA, APP_HANDLE},
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
                match req.method {
                    Method::Get => {
                        tokio::spawn(async move {
                            let ticker_names: Vec<String> = req.payload.keys().cloned().collect();
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
                            for ticker in ticker_names {
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
                                    send(RPCRequest::new(
                                        "v1".to_string(),
                                        HashMap::from_iter(vec![(
                                            ticker.clone(),
                                            Ticker::new(
                                                ticker.clone(),
                                                get_trend(df_longterm, Fractals::new(1)),
                                                get_trend(df_midterm, Fractals::new(1)),
                                                get_trend(df_shortterm, Fractals::new(1)),
                                            ),
                                        )]),
                                        ticker,
                                        Method::Put,
                                    ))
                                });
                            }
                        });
                    }
                    Method::Post => todo!(),
                    Method::Put => todo!(),
                    Method::Delete => todo!(),
                }
            }
        });
}

/// Send a request to trendmap/tickers route
pub fn send(payload: RPCRequest<HashMap<String, Ticker>>) {
    let _ = APP_HANDLE
        .get()
        .unwrap()
        .emit_all("trendmap/tickers", payload);
}
