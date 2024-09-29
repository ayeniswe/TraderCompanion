use crate::external::api::alpaca::client::Alpaca;
use std::sync::OnceLock;
use tauri::{AppHandle, Wry};

pub static ALPACA: OnceLock<Alpaca> = OnceLock::new();
pub static APP_HANDLE: OnceLock<AppHandle<Wry>> = OnceLock::new();
