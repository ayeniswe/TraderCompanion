use app::analysis::trend::Trend;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Clone, Deserialize)]
pub struct Group {
    name: String,
    id: u16,
    tickers: Vec<Ticker>,
}

#[derive(Debug, Serialize, Clone, Deserialize)]
pub struct Ticker {
    pub name: String,
    pub group_id: u16,
    long_term: Trend,
    mid_term: Trend,
    short_term: Trend,
}
impl Ticker {
    pub fn new(
        name: String,
        group_id: u16,
        long_term: Trend,
        mid_term: Trend,
        short_term: Trend,
    ) -> Self {
        Self {
            name,
            group_id,
            long_term,
            mid_term,
            short_term,
        }
    }
}
