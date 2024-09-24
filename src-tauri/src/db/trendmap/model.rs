use crate::db::schema::trendmaps;
use diesel::{
    prelude::{Insertable, Queryable},
    Selectable,
};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Insertable, Selectable, Serialize, Deserialize, Debug)]
#[table_name = "trendmaps"]
pub struct Trendmap {
    pub id: i32,
    pub name: String,
    pub layout: String,
}
impl Trendmap {
    pub fn new(id: i32, name: String, layout: String) -> Self {
        Self { id, name, layout }
    }
}
