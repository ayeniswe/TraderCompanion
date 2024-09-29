use super::model::ApiCredential;
use crate::db::schema::api_credentials;
use diesel::prelude::*;

pub fn upsert_api_credentials(
    conn: &mut SqliteConnection,
    api_key: &str,
    api_secret: &str,
) -> QueryResult<usize> {
    let existing_credential = api_credentials::table
        .filter(api_credentials::id.eq(0))
        .first::<ApiCredential>(conn)
        .optional()?;

    match existing_credential {
        Some(_) => diesel::update(api_credentials::table.filter(api_credentials::id.eq(0)))
            .set((
                api_credentials::api_key.eq(api_key),
                api_credentials::api_secret.eq(api_secret),
            ))
            .execute(conn),
        None => {
            let new_credential: ApiCredential = ApiCredential {
                id: 0, // Fixed ID to denote only one record
                api_key: api_key.to_string(),
                api_secret: api_secret.to_string(),
            };
            diesel::insert_into(api_credentials::table)
                .values(&new_credential)
                .execute(conn)
        }
    }
}

pub fn get_api_credentials(conn: &mut SqliteConnection) -> QueryResult<Option<ApiCredential>> {
    api_credentials::table
        .filter(api_credentials::id.eq(0))
        .first::<ApiCredential>(conn)
        .optional()
}
