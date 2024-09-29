use std::fmt::Display;

#[derive(Default)]
pub enum Feed {
    #[default]
    Iex,
    Sip,
    Otc,
}
impl Display for Feed {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Feed::Iex => "iex",
            Feed::Sip => "sip",
            Feed::Otc => "otc",
        };
        write!(f, "{s}")
    }
}

#[derive(Default)]
pub struct AlpacaConfig {
    pub feed: Feed,
}
#[derive(Default)]
pub struct AlpacaConfigBuilder {
    feed: Feed,
}
impl AlpacaConfigBuilder {
    /// A new configuration for `Alpaca` client
    ///
    /// Defaults:
    ///
    /// `feed` - iex
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
    /// Data source for historical/realtime bars
    pub fn feed(&mut self, feed: Feed) -> &mut Self {
        self.feed = feed;
        self
    }
    /// Create configuration for `Alpaca` client
    pub fn create(self) -> AlpacaConfig {
        AlpacaConfig { feed: self.feed }
    }
}
