use serde::{Deserialize, Serialize};
use std::fmt::Display;

#[derive(Debug, Serialize, Clone, Deserialize)]
pub struct Ticker {
    pub name: String,
    long_term: Trend,
    mid_term: Trend,
    short_term: Trend,
}
impl Ticker {
    pub fn new(name: String, long_term: Trend, mid_term: Trend, short_term: Trend) -> Self {
        Self {
            name,
            long_term,
            mid_term,
            short_term,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Trend {
    Up,
    Down,
    Range,
    Unk,
}

impl Display for Trend {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Trend::Up => "UP",
            Trend::Range => "RANGE",
            Trend::Down => "DOWN",
            Trend::Unk => "UNKNOWN",
        };
        write!(f, "{}", s)
    }
}
