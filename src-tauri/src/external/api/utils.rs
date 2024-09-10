use chrono::{DateTime, NaiveDate};

pub fn is_valid_date_format(date_str: &str) -> bool {
    ["%Y-%m-%dT%H:%M:%S%:z", "%Y-%m-%d"].iter().any(|&format| {
        DateTime::parse_from_str(date_str, format).is_ok()
            || NaiveDate::parse_from_str(date_str, format).is_ok()
    })
}
