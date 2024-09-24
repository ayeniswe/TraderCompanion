// @generated automatically by Diesel CLI.

diesel::table! {
    api_credentials (id) {
        id -> Integer,
        api_key -> Text,
        api_secret -> Text,
    }
}

diesel::table! {
    trendmaps (id) {
        id -> Integer,
        name -> Text,
        layout -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    api_credentials,
    trendmaps,
);
