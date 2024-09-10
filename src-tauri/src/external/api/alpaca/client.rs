use super::{
    config::{AlpacaConfig, AlpacaConfigBuilder},
    convert::to_dataframe,
    timeframe::TimeFrame,
};
use crate::external::api::{
    client::{APIClient, Authenticate},
    utils::is_valid_date_format,
};
use polars::frame::DataFrame;
use std::{collections::HashMap, env};
use thiserror::Error;

pub struct Alpaca<'a> {
    data_client: APIClient<'a>,
    config: AlpacaConfig,
}
impl<'a> Alpaca<'a> {
    /// A new configuration builder for `Alpaca` client
    ///
    /// Defaults:
    ///
    /// `feed` - iex
    pub fn config() -> AlpacaConfigBuilder {
        AlpacaConfigBuilder::new()
    }

    /// A new `Alpaca` client
    ///
    /// Supports multiple client for different data points
    /// such as streaming, data, and base api usage
    ///
    /// If no config is supplied then will use defaults:
    ///
    /// `feed` - iex
    pub fn new(config: Option<AlpacaConfig>) -> Self {
        Self {
            config: config.unwrap_or_default(),
            data_client: APIClient::new(
                "https://data.alpaca.markets",
                "v2",
                Authenticate::Token {
                    header_key: "APCA-API-KEY-ID".to_string(),
                    header_secret: "APCA-API-SECRET-KEY".to_string(),
                    key: env::var("APCA_KEY").expect("'APCA_KEY' can not be found. Please set the enviroment variable 'APCA_KEY'"),
                    secret: env::var("APCA_SECRET").expect("'APCA_SECRET' can not be found. Please set the enviroment variable 'APCA_SECRET'"),
                },
            ),
        }
    }

    /// Retrieve history for all symbols
    ///
    /// `start` refers to the time to start retrieving data from up
    /// to the current date
    pub async fn get_historical_bars(
        &self,
        symbols: Vec<String>,
        timeframe: TimeFrame,
        start: String,
    ) -> Result<HashMap<String, DataFrame>, Error> {
        if is_valid_date_format(&start) {
            let mut params = HashMap::new();
            params.insert("symbols", symbols.join(","));
            params.insert("timeframe", timeframe.inner.to_string());
            params.insert("feed", self.config.feed.to_string());
            params.insert("start", start);
            match self
                .data_client
                .get("stocks/bars", Some(&params))
                .send()
                .await
            {
                Ok(response) => match response.text().await {
                    Ok(text) => Ok(to_dataframe(&text)),
                    Err(e) => Err(Error::HTTPError(e.to_string())),
                },
                Err(e) => Err(Error::HTTPError(e.to_string())),
            }
        } else {
            return Err(Error::DateInvalid);
        }
    }
}

#[derive(Error, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Error {
    #[error("http request error: {0}")]
    HTTPError(String),
    #[error(
        "start/end date format is invalid...should be the following:\n'%Y-%m-%dT%H:%M:%S%.f%:z'\n'%Y-%m-%d'"
    )]
    DateInvalid,
}
