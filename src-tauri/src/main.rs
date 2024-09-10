// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod analysis;
mod api;

use app::{
    external::api::alpaca::client::Alpaca,
    global::{ALPACA, APP_HANDLE},
};
use tauri::Manager;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize once global constants
            let _ = APP_HANDLE.set(app.app_handle());
            let _ = ALPACA.set(Alpaca::new(None));

            // Start internal api routes
            api::trendmap::tickers::listen();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
