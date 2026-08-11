#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Kyc(Address),
    Rate(Symbol),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RemittanceError {
    NotKycVerified = 1,
    InvalidRate = 2,
}

#[contract]
pub struct RemittanceContract;

#[contractimpl]
impl RemittanceContract {
    pub fn initialize(env: Env, admin: Address) {
        let admin_key = symbol_short!("ADMIN");
        if env.storage().instance().has(&admin_key) {
            panic!("already initialized");
        }
        env.storage().instance().set(&admin_key, &admin);
    }

    pub fn get_admin(env: Env) -> Address {
        let admin_key = symbol_short!("ADMIN");
        env.storage().instance().get(&admin_key).expect("not initialized")
    }

    pub fn set_kyc(env: Env, admin: Address, user: Address, status: bool) {
        let stored_admin = Self::get_admin(env.clone());
        if admin != stored_admin {
            panic!("not authorized admin");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Kyc(user.clone()), &status);
        env.events().publish(
            (symbol_short!("remit"), symbol_short!("kyc_set")),
            (user, status),
        );
    }

    pub fn get_kyc(env: Env, user: Address) -> bool {
        env.storage().instance().get(&DataKey::Kyc(user)).unwrap_or(false)
    }

    pub fn set_rate(env: Env, admin: Address, currency: Symbol, rate: u32) {
        let stored_admin = Self::get_admin(env.clone());
        if admin != stored_admin {
            panic!("not authorized admin");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Rate(currency.clone()), &rate);
        env.events().publish(
            (symbol_short!("remit"), symbol_short!("rate_set")),
            (currency, rate),
        );
    }

    pub fn get_rate(env: Env, currency: Symbol) -> u32 {
        env.storage().instance().get(&DataKey::Rate(currency)).unwrap_or(0)
    }

    pub fn send_remittance(
        env: Env,
        sender: Address,
        receiver: Address,
        token: Address,
        amount: i128,
        currency: Symbol,
    ) -> Result<i128, RemittanceError> {
        sender.require_auth();

        // 1. Gated: Verify that the sender is KYC whitelisted
        let is_verified = Self::get_kyc(env.clone(), sender.clone());
        if !is_verified {
            return Err(RemittanceError::NotKycVerified);
        }

        // 2. Fetch rate for currency
        let rate = Self::get_rate(env.clone(), currency.clone());
        if rate == 0 {
            return Err(RemittanceError::InvalidRate);
        }

        // 3. Compute converted amount (scaled rate by 100, e.g. rate of 8250 means 82.50 INR/XLM)
        let converted_amount = (amount * rate as i128) / 100;

        // 4. Perform actual transfer of native token / XLM asset from sender to receiver
        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&sender, &receiver, &amount);

        // 5. Emit event
        env.events().publish(
            (symbol_short!("remit"), symbol_short!("transfer")),
            (sender, receiver, amount, converted_amount, currency),
        );

        Ok(converted_amount)
    }
}

mod test;
