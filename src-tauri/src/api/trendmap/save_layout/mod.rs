use super::model::Group;
use crate::api::model::RPCRequest;
use app::{
    db::{connect::establish_connection, trendmap::action::upsert_trendmaps},
    global::APP_HANDLE,
};
use diesel::SqliteConnection;
use tauri::Manager;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("trendmap/save_layout", |event| {
            if let Ok(req) =
                serde_json::from_str::<RPCRequest<Vec<Group>>>(event.payload().unwrap())
            {
                let mut conn: SqliteConnection = establish_connection();
                let layout: String = serde_json::to_string(&req.payload).unwrap();
                let _ = upsert_trendmaps(&mut conn, &layout);
            }
        });
}
