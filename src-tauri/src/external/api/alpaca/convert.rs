use polars::prelude::*;
use serde::Deserialize;
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct Record {
    c: f64,
    h: f64,
    l: f64,
    n: u64,
    o: f64,
    t: String,
    v: u64,
    vw: f64,
}

pub fn to_dataframe(json: &str) -> HashMap<String, DataFrame> {
    let mut dataframes: HashMap<String, DataFrame> = HashMap::new();

    // Parse JSON and ignore the 'bars' key
    let bar_data: Value = serde_json::from_str(json).unwrap();
    let tickers_data = bar_data["bars"]
        .as_object()
        .expect("The alpaca api should have 'bars' in its (historical stock bars) json response");

    for (ticker, bars) in tickers_data {
        let bars: Vec<Record> = serde_json::from_value(bars.clone())
            .expect("The alpaca api should have 'bar' data in the same format as 'Record'");

        // Create Series for each column
        let dates: Vec<&str> = bars.iter().map(|b| b.t.as_str()).collect();
        let open_prices: Vec<f64> = bars.iter().map(|b| b.o).collect();
        let close_prices: Vec<f64> = bars.iter().map(|b| b.c).collect();
        let high_prices: Vec<f64> = bars.iter().map(|b| b.h).collect();
        let low_prices: Vec<f64> = bars.iter().map(|b| b.l).collect();
        let volumes: Vec<u64> = bars.iter().map(|b| b.v).collect();
        let vwaps: Vec<f64> = bars.iter().map(|b| b.vw).collect();

        // Create a DataFrame
        let df = DataFrame::new(vec![
            Series::new("date", dates),
            Series::new("open", open_prices),
            Series::new("close", close_prices),
            Series::new("high", high_prices),
            Series::new("low", low_prices),
            Series::new("volume", volumes),
            Series::new("vwap", vwaps),
        ])
        .unwrap();

        dataframes.insert(ticker.clone(), df);
    }

    dataframes
}

#[test]
fn to_dataframe_test() {
    let json_data = r#"{
    "bars": {
        "AAPL": [
        {
            "c": 222.77,
            "h": 229,
            "l": 221.17,
            "n": 813604,
            "o": 228.55,
            "t": "2024-09-03T04:00:00Z",
            "v": 50190574,
            "vw": 223.796891
        },
        {
            "c": 220.85,
            "h": 221.78,
            "l": 217.48,
            "n": 679980,
            "o": 221.66,
            "t": "2024-09-04T04:00:00Z",
            "v": 43840196,
            "vw": 219.966189
        },
        {
            "c": 222.38,
            "h": 225.48,
            "l": 221.52,
            "n": 588073,
            "o": 221.625,
            "t": "2024-09-05T04:00:00Z",
            "v": 36615398,
            "vw": 223.095137
        }
        ]
    },
    "next_page_token": null
    }"#;

    let expected_df = DataFrame::new(vec![
        Series::new(
            "date",
            vec![
                "2024-09-03T04:00:00Z",
                "2024-09-04T04:00:00Z",
                "2024-09-05T04:00:00Z",
            ],
        ),
        Series::new("open", vec![228.55, 221.66, 221.625]),
        Series::new("close", vec![222.77, 220.85, 222.38]),
        Series::new("high", vec![229.0, 221.78, 225.48]),
        Series::new("low", vec![221.17, 217.48, 221.52]),
        Series::new("volume", vec![50190574, 43840196, 36615398]),
        Series::new("vwap", vec![223.796891, 219.966189, 223.095137]),
    ])
    .unwrap();

    let actual_df: HashMap<String, DataFrame> = to_dataframe(json_data);

    // Assert that the DataFrames are equal
    assert!(actual_df["AAPL"].equals(&expected_df));
}
