// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;

use app::global::APP_HANDLE;
use tauri::Manager;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize once global constants
            let _ = APP_HANDLE.set(app.app_handle());

            // Start internal api routes
            api::account::create_api_credentials::listen();
            api::account::verify::listen();

            api::ticker::get_latest_bars::listen();

            api::trendmap::generate_layout::listen();
            api::trendmap::save_layout::listen();
            api::trendmap::get_layout::listen();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
