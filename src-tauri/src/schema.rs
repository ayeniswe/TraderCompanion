// @generated automatically by Diesel CLI.

diesel::table! {
    keys (id) {
        id -> Integer,
        api_key -> Text,
        api_secret -> Text,
    }
}
