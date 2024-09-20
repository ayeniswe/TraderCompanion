use crate::db::model::{Key, NewKey};
use diesel::{associations::HasTable, dsl::insert_into, prelude::*};

pub fn establish_connection() -> SqliteConnection {
    let database_url = "../app.db";
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}
