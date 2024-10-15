use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Clone, Deserialize)]
pub struct Ticker {
    pub name: String,
    pub price: f64,
}
impl Ticker {
    pub fn new(name: String, price: f64) -> Self {
        Self { name, price }
    }
}
