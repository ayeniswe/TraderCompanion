use crate::schema::keys;
use diesel::{
    prelude::{Insertable, Queryable},
    Selectable,
};

#[derive(Queryable, Selectable)]
#[diesel(table_name = keys)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Key {
    pub id: i32,
    pub api_key: String,
    pub api_secret: String,
}

#[derive(Insertable)]
#[diesel(table_name = keys)]
pub struct NewKey<'a> {
    pub api_key: &'a str,
    pub api_secret: &'a str,
}
impl<'a> NewKey<'a> {
    pub fn new(api_key: &'a str, api_secret: &'a str) -> Self {
        Self {
            api_key,
            api_secret,
        }
    }
}
