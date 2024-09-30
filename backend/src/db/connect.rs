use diesel::prelude::*;
use std::env;

pub fn establish_connection() -> SqliteConnection {
    let database_url = if env::consts::OS == "linux" {
        "/usr/lib/trader-companion/app.db"
    } else {
        "app.db"
    };
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}
