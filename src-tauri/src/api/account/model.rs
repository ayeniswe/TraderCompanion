use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct AlpacaCredential {
    pub key: String,
    pub secret: String,
}
