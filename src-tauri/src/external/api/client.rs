use reqwest::{Client, RequestBuilder};
use std::collections::HashMap;
use tauri::Url;

pub enum Authenticate {
    Oauth(String),
    Token {
        header_secret: String,
        header_key: String,
        key: String,
        secret: String,
    },
}

pub struct APIClient<'a> {
    base_url: &'a str,
    version: &'a str,
    auth: Authenticate,
    client: Client,
}
impl<'a> APIClient<'a> {
    pub fn new(base_url: &'a str, version: &'a str, auth: Authenticate) -> Self {
        Self {
            base_url,
            version,
            auth,
            client: Client::new(),
        }
    }

    fn build_url(&self, endpoint: &str) -> String {
        Url::parse(&format!("{}/{}/{}", self.base_url, self.version, endpoint))
            .expect("Invalid base URL")
            .to_string()
    }

    fn build_auth(&self, request: RequestBuilder) -> RequestBuilder {
        match &self.auth {
            Authenticate::Oauth(oauth) => request.bearer_auth(oauth),
            Authenticate::Token {
                header_key,
                header_secret,
                key,
                secret,
            } => request
                .header(header_key, key)
                .header(header_secret, secret),
        }
    }

    pub fn get(&self, endpoint: &str, params: Option<&HashMap<&str, String>>) -> RequestBuilder {
        let mut request: RequestBuilder = self.client.get(self.build_url(endpoint));
        let default: HashMap<&str, String> = HashMap::default();
        request = request.query(&params.unwrap_or(&default));
        self.build_auth(request)
    }

    pub fn post(&self, endpoint: &str, params: Option<&HashMap<&str, String>>) -> RequestBuilder {
        let mut request: RequestBuilder = self.client.get(self.build_url(endpoint));
        let default: HashMap<&str, String> = HashMap::default();
        request = request.form(&params.unwrap_or(&default));
        self.build_auth(request)
    }

    pub fn put(&self, endpoint: &str, params: Option<&HashMap<&str, String>>) -> RequestBuilder {
        let mut request: RequestBuilder = self.client.get(self.build_url(endpoint));
        let default: HashMap<&str, String> = HashMap::default();
        request = request.form(&params.unwrap_or(&default));
        self.build_auth(request)
    }

    pub fn delete(&self, endpoint: &str, params: Option<&HashMap<&str, String>>) -> RequestBuilder {
        let mut request: RequestBuilder = self.client.get(self.build_url(endpoint));
        let default: HashMap<&str, String> = HashMap::default();
        request = request.query(&params.unwrap_or(&default));
        self.build_auth(request)
    }
}
