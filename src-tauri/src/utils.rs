use rand::{rngs::ThreadRng, thread_rng, Rng as _};

pub type UID = u128;

/// Generate a random 16-digit number as a string
pub fn generate_uid() -> UID {
    let mut rng: ThreadRng = thread_rng();
    rng.gen_range(1_000_000_000_000_000..9_999_999_999_999_999)
}
