use crate::db::schema::api_credentials;
use diesel::{
    prelude::{Insertable, Queryable},
    Selectable,
};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Insertable, Selectable, Serialize, Deserialize, Debug)]
#[table_name = "api_credentials"]
pub struct ApiCredential {
    pub id: i32,
    pub api_key: String,
    pub api_secret: String,
}
impl ApiCredential {
    pub fn new(id: i32, api_key: String, api_secret: String) -> Self {
        Self {
            id,
            api_key,
            api_secret,
        }
    }
}
