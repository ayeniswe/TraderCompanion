use std::fmt::Display;
use thiserror::Error;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum TimeFrameUnit {
    Minute(usize),
    Hour(usize),
    Day,
    Week,
    Month(usize),
}
impl Display for TimeFrameUnit {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TimeFrameUnit::Minute(val) => write!(f, "{val}Min"),
            TimeFrameUnit::Hour(val) => write!(f, "{val}Hour"),
            TimeFrameUnit::Day => write!(f, "1Day"),
            TimeFrameUnit::Week => write!(f, "1Week"),
            TimeFrameUnit::Month(val) => write!(f, "{val}Month"),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct TimeFrame {
    pub inner: TimeFrameUnit,
}
impl TimeFrame {
    pub fn min(val: usize) -> Result<TimeFrame, Error> {
        if (1usize..=59usize).contains(&val) {
            Ok(TimeFrame {
                inner: TimeFrameUnit::Minute(val),
            })
        } else {
            Err(Error::Minute)
        }
    }
    pub fn hour(val: usize) -> Result<TimeFrame, Error> {
        if (1usize..=23usize).contains(&val) {
            Ok(TimeFrame {
                inner: TimeFrameUnit::Hour(val),
            })
        } else {
            Err(Error::Hour)
        }
    }
    pub fn day() -> TimeFrame {
        TimeFrame {
            inner: TimeFrameUnit::Day,
        }
    }
    pub fn week() -> TimeFrame {
        TimeFrame {
            inner: TimeFrameUnit::Week,
        }
    }
    pub fn month(val: usize) -> Result<TimeFrame, Error> {
        if (1usize..=4usize).contains(&val) || 6usize == val || 12usize == val {
            Ok(TimeFrame {
                inner: TimeFrameUnit::Month(val),
            })
        } else {
            Err(Error::Month)
        }
    }
}

#[derive(Error, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Error {
    #[error("minute is invalid..valid values are 1-59")]
    Minute,
    #[error("hour is invalid..valid values are 1-23")]
    Hour,
    #[error("month is invalid..valid values are 1-4, 6, or 12")]
    Month,
}

#[cfg(test)]
mod timeframeunit_tests {
    use crate::external::api::alpaca::timeframe::TimeFrameUnit;

    #[test]
    fn test_min_to_string() {
        assert_eq!(TimeFrameUnit::Minute(1).to_string(), "1Min")
    }
    #[test]
    fn test_hour_to_string() {
        assert_eq!(TimeFrameUnit::Hour(1).to_string(), "1Hour")
    }
    #[test]
    fn test_daily_to_string() {
        assert_eq!(TimeFrameUnit::Day.to_string(), "1Day")
    }
    #[test]
    fn test_week_to_string() {
        assert_eq!(TimeFrameUnit::Week.to_string(), "1Week")
    }
    #[test]
    fn test_month_to_string() {
        assert_eq!(TimeFrameUnit::Month(1).to_string(), "1Month")
    }
}

#[cfg(test)]
mod timeframe_tests {
    use crate::external::api::alpaca::timeframe::{Error, TimeFrame, TimeFrameUnit};

    #[test]
    fn test_min_1() {
        assert_eq!(TimeFrame::min(1).unwrap().inner, TimeFrameUnit::Minute(1))
    }

    #[test]
    fn test_min_59() {
        assert_eq!(TimeFrame::min(59).unwrap().inner, TimeFrameUnit::Minute(59))
    }

    #[test]
    fn test_min_invalid() {
        assert_eq!(TimeFrame::min(62), Err(Error::Minute))
    }

    #[test]
    fn test_hour_1() {
        assert_eq!(TimeFrame::hour(1).unwrap().inner, TimeFrameUnit::Hour(1))
    }

    #[test]
    fn test_hour_23() {
        assert_eq!(TimeFrame::hour(23).unwrap().inner, TimeFrameUnit::Hour(23))
    }

    #[test]
    fn test_hour_invalid() {
        assert_eq!(TimeFrame::hour(24), Err(Error::Hour))
    }

    #[test]
    fn test_month_1() {
        assert_eq!(TimeFrame::month(1).unwrap().inner, TimeFrameUnit::Month(1))
    }

    #[test]
    fn test_month_4() {
        assert_eq!(TimeFrame::month(4).unwrap().inner, TimeFrameUnit::Month(4))
    }

    #[test]
    fn test_month_6() {
        assert_eq!(TimeFrame::month(6).unwrap().inner, TimeFrameUnit::Month(6))
    }

    #[test]
    fn test_month_12() {
        assert_eq!(
            TimeFrame::month(12).unwrap().inner,
            TimeFrameUnit::Month(12)
        )
    }

    #[test]
    fn test_month_invalid() {
        assert_eq!(TimeFrame::month(5), Err(Error::Month))
    }
}
