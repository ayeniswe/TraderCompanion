use polars::prelude::*;
use serde::{Deserialize, Serialize};
use std::fmt::Display;

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

/// Different variation of determining trend direction in markets
pub trait TrendStrategy {
    fn get_trend(&self, data: &DataFrame) -> Trend;
}

/// Track trend change using willaims fractals.
/// Fractals show the key pivot areas for swing highs and
/// lows.
pub struct Fractals {
    nth: usize,
}
impl Fractals {
    /// `nth` - The amount of preceding/following bars to review
    pub fn new(nth: usize) -> Self {
        Self { nth }
    }
}
impl TrendStrategy for Fractals {
    fn get_trend(&self, data: &DataFrame) -> Trend {
        if data.height() == 0 {
            return Trend::Unk;
        }

        let highs: &ChunkedArray<Float64Type> = data.column("high").unwrap().f64().unwrap();
        let lows: &ChunkedArray<Float64Type> = data.column("low").unwrap().f64().unwrap();

        let mut up: Vec<Option<f64>> = Vec::with_capacity(data.height());
        let mut down: Vec<Option<f64>> = Vec::with_capacity(data.height());
        let mut current_trend: Trend = Trend::Unk;

        for mid in 0..data.height() {
            let is_up_valid: bool = mid >= self.nth && mid + self.nth < data.height();
            let up_value: Option<f64> = if is_up_valid
                && (0..=self.nth)
                    .all(|n: usize| highs.get(mid).unwrap() >= highs.get(mid - n).unwrap())
                && (0..=self.nth)
                    .all(|n: usize| highs.get(mid).unwrap() >= highs.get(mid + n).unwrap())
            {
                Some(highs.get(mid).unwrap())
            } else {
                None
            };
            up.push(up_value);

            let is_down_valid: bool = mid >= self.nth && mid + self.nth < data.height();
            let down_value: Option<f64> = if is_down_valid
                && (0..=self.nth)
                    .all(|n: usize| lows.get(mid).unwrap() <= lows.get(mid - n).unwrap())
                && (0..=self.nth)
                    .all(|n: usize| lows.get(mid).unwrap() <= lows.get(mid + n).unwrap())
            {
                Some(lows.get(mid).unwrap())
            } else {
                None
            };
            down.push(down_value);
        }

        let mut trend: Vec<f64> = Vec::new();
        for i in 0..data.height() {
            if trend.len() == 4 {
                let (p1, p2, p3, p4) = (trend[0], trend[1], trend[2], trend[3]);
                if ((p2 < p3) || (p1 < p2)) && (p4 < p2) && (p1 > p3) {
                    current_trend = Trend::Down;
                } else if ((p2 > p3) || (p1 > p2)) && (p4 > p2) && (p1 < p3) {
                    current_trend = Trend::Up;
                } else {
                    current_trend = Trend::Range;
                }
                trend.remove(0); // Remove the oldest element
            }
            if let Some(up_val) = up[i] {
                trend.push(up_val);
            }
            if let Some(down_val) = down[i] {
                trend.push(down_val);
            }
        }

        current_trend
    }
}

/// Determine current market direction rather `Up`, `Down`, or `Range`
pub fn get_trend<T: TrendStrategy>(df: &DataFrame, strategy: T) -> Trend {
    strategy.get_trend(df)
}

#[cfg(test)]
mod trend_tests {
    use polars::df;

    #[test]
    fn test_trend_range() {
        let df = df![
            "symbol" => vec!["BTC/USD"; 14],
            "high" => vec![
              259.439, 265.61, 267.59, 271.0, 251.84,
              265.6, 258.62, 258.47, 257.14, 257.44,
              258.21, 225.99, 226.0, 226.0
            ],
            "low" => vec![
              244.57, 250.3, 257.86, 239.65, 233.0912,
              280.73, 245.8001, 246.182, 245.0, 236.83,
              243.75, 300.63, 214.71, 216.231
            ],
        ]
        .unwrap();

        let trend: Trend = Fractals::new(1).get_trend(&df);

        assert_eq!(trend, Trend::Range);
    }

    use crate::analysis::trend::{Fractals, Trend, TrendStrategy};

    #[test]
    fn test_trend_down() {
        let df = df![
            "symbol" => vec!["BTC/USD"; 14],
            "high" => vec![
                244.57, 250.3, 257.86, 239.65, 233.0912,
                280.73, 245.8001, 246.182, 245.0, 236.83,
                243.75, 300.63, 214.71, 216.231
            ],
            "low" => vec![
                259.439, 265.61, 267.59, 271.0, 251.84,
                265.6, 258.62, 258.47, 257.14, 257.44,
                258.21, 225.99, 226.0, 226.0
            ],
        ]
        .unwrap();

        let trend: Trend = Fractals::new(1).get_trend(&df);

        assert_eq!(trend, Trend::Down);
    }
    #[test]
    fn test_trend_up() {
        let df = df![
          "symbol" => vec!["BTC/USD"; 13],
          "high" => vec![
              244.57, 250.3, 257.86, 239.65, 233.0912,
              251.73, 245.8001, 246.182, 255.2, 236.83,
              243.75, 258.63, 214.71,
          ],
          "low" => vec![
              259.439, 265.61, 267.59, 271.0, 251.84,
              265.6, 258.62, 258.47, 257.14, 252.44,
              253.21, 255.7594, 225.99,
          ],
        ]
        .unwrap();

        let trend: Trend = Fractals::new(1).get_trend(&df);

        assert_eq!(trend, Trend::Up);
    }
    #[test]
    fn test_trend_unk() {
        let df = df![
          "symbol" => vec!["BTC/USD"; 1],
          "high" => vec![
            12
          ],
          "low" => vec![
            12
          ],
        ]
        .unwrap();

        let trend: Trend = Fractals::new(1).get_trend(&df);

        assert_eq!(trend, Trend::Unk);
    }
}
