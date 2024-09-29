use super::model::Group;
use crate::api::model::{RPCResponse, Version};
use app::{
    db::{connect::establish_connection, trendmap::action::get_trendmaps},
    global::APP_HANDLE,
    utils::generate_uid,
};
use diesel::SqliteConnection;
use serde_json::from_str;
use tauri::Manager;

pub fn listen() {
    APP_HANDLE
        .get()
        .unwrap()
        .listen_global("trendmap/get_layout", |_| {
            let mut conn: SqliteConnection = establish_connection();
            if let Some(trendmap) = get_trendmaps(&mut conn, "default").unwrap() {
                let layout: Vec<Group> = from_str(&trendmap.layout).unwrap();
                send(RPCResponse::new(
                    Version::V1,
                    Some(layout),
                    generate_uid(),
                    None,
                ))
            }
        });
}

/// Send a response to `trendmap/get_layout` route
pub fn send(payload: RPCResponse<Vec<Group>>) {
    let _ = APP_HANDLE
        .get()
        .unwrap()
        .emit_all("trendmap/get_layout", payload);
}
