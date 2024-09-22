// @generated automatically by Diesel CLI.

diesel::table! {
    api_credentials (id) {
        id -> Integer,
        api_key -> Text,
        api_secret -> Text,
    }
}
