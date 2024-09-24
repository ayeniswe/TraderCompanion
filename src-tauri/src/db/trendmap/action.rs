use super::model::Trendmap;
use crate::db::schema::trendmaps;
use diesel::prelude::*;

pub fn upsert_trendmaps(conn: &mut SqliteConnection, layout: &str) -> QueryResult<usize> {
    let existing_credential = trendmaps::table
        .filter(trendmaps::name.eq("default"))
        .first::<Trendmap>(conn)
        .optional()?;

    match existing_credential {
        Some(_) => diesel::update(trendmaps::table.filter(trendmaps::name.eq("default")))
            .set(trendmaps::layout.eq(layout))
            .execute(conn),
        None => diesel::insert_into(trendmaps::table)
            .values((trendmaps::name.eq("default"), trendmaps::layout.eq(layout)))
            .execute(conn),
    }
}

pub fn insert_trendmaps(
    conn: &mut SqliteConnection,
    name: &str,
    layout: &str,
) -> QueryResult<usize> {
    diesel::insert_into(trendmaps::table)
        .values((trendmaps::name.eq(name), trendmaps::layout.eq(layout)))
        .execute(conn)
}

pub fn get_trendmaps(conn: &mut SqliteConnection, name: &str) -> QueryResult<Option<Trendmap>> {
    trendmaps::table
        .filter(trendmaps::name.eq(name))
        .first::<Trendmap>(conn)
        .optional()
}

pub fn get_all_trendmaps(conn: &mut SqliteConnection) -> QueryResult<Vec<Trendmap>> {
    trendmaps::table.load::<Trendmap>(conn)
}
