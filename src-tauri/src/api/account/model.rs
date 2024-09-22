use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiCredential {
    pub key: String,
    pub secret: String,
}
