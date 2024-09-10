use chrono::{DateTime, Duration, TimeDelta, Utc};

pub enum TimeUnit {
    Days(i64),
    Hours(i64),
}
/// Count back a number of specfic time units from now
pub fn lookback(units: i64, unit_type: TimeUnit) -> String {
    // Get the current date and time
    let now: DateTime<Utc> = Utc::now();

    // Determine the duration to subtract based on the unit type
    let duration: TimeDelta = match unit_type {
        TimeUnit::Days(mult) => Duration::days(units * mult),
        TimeUnit::Hours(mult) => Duration::hours(units * mult),
    };

    // Calculate the resulting date by subtracting the duration
    let result_date: DateTime<Utc> = now - duration;

    // Return the resulting date
    result_date.format("%Y-%m-%dT%H:%M:%S%:z").to_string()
}
