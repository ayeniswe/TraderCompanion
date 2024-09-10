use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum Method {
    Get,
    Post,
    Put,
    Delete,
}

impl std::fmt::Display for Method {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Method::Get => "GET",
            Method::Post => "POST",
            Method::Put => "PUT",
            Method::Delete => "DELETE",
        };
        write!(f, "{}", s)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RPCError {
    pub code: u32,
    pub message: String,
}

impl RPCError {
    pub fn new(message: String, code: u32) -> Self {
        RPCError { code, message }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RPCRequest<T> {
    pub version: String,
    pub method: Method,
    pub payload: T,
    pub id: String,
}

impl<T> RPCRequest<T> {
    pub fn new(version: String, payload: T, id: String, method: Method) -> Self {
        RPCRequest {
            version,
            method,
            payload,
            id,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RPCResponse<T> {
    pub version: String,
    pub response: T,
    pub error: Option<RPCError>,
    pub id: String,
}

impl<T> RPCResponse<T> {
    pub fn new(version: String, response: T, id: String, error: Option<RPCError>) -> Self {
        RPCResponse {
            version,
            response,
            error,
            id,
        }
    }
}
