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
use std::collections::HashMap;
use thiserror::Error;

pub struct Alpaca<'a> {
    data_client: APIClient<'a>,
    config: AlpacaConfig,
}
impl<'a> Alpaca<'a> {
    /// A new configuration builder for the `Alpaca` client.
    ///
    /// This function initializes a configuration builder that allows users
    /// to set custom parameters for the Alpaca client.
    ///
    /// # Defaults
    ///
    /// The builder starts with the following default settings:
    /// - `feed`: Defaults to "iex".
    pub fn config() -> AlpacaConfigBuilder {
        AlpacaConfigBuilder::new()
    }

    /// A new `Alpaca` client
    ///
    /// This client supports multiple endpoints for different data points,
    /// such as streaming data, historical data, and base API usage.
    ///
    /// # Arguments
    ///
    /// * `config`: An optional `AlpacaConfig` object to customize the client settings.
    /// If no config is supplied, default settings will be used:
    /// * `auth`: An `Authenticate` object containing authentication information.
    pub fn new(config: Option<AlpacaConfig>, auth: Authenticate) -> Self {
        Self {
            config: config.unwrap_or_default(),
            data_client: APIClient::new("https://data.alpaca.markets", "v2", auth),
        }
    }

    /// Fetches historical stock bars for the given symbols and timeframe starting from the specified date.
    ///
    /// # Arguments
    ///
    /// * `symbols`: A vector of stock symbols to fetch data for.
    /// * `timeframe`: The timeframe for the historical bars (e.g., daily, hourly).
    /// * `start`: A string representing the start date in a valid format.
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

    /// Fetches the latest stock bars for the specified symbols.
    ///
    /// # Arguments
    ///
    /// * `symbols`: A vector of stock symbols to fetch the latest bars for.
    pub async fn get_latest_bars(
        &self,
        symbols: Vec<String>,
    ) -> Result<HashMap<String, DataFrame>, Error> {
        let mut params = HashMap::new();
        params.insert("symbols", symbols.join(","));
        params.insert("feed", self.config.feed.to_string());
        match self
            .data_client
            .get("stocks/bars/latest", Some(&params))
            .send()
            .await
        {
            Ok(response) => match response.text().await {
                Ok(text) => Ok(to_dataframe(&text)),
                Err(e) => Err(Error::HTTPError(e.to_string())),
            },
            Err(e) => Err(Error::HTTPError(e.to_string())),
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
