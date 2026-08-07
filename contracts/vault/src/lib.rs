#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Val, Vec};

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn deposit_and_increment(env: Env, counter_id: Address) -> u32 {
        let args: Vec<Val> = Vec::new(&env);
        let new_count: u32 = env.invoke_contract(&counter_id, &symbol_short!("increment"), args);
        new_count
    }
}

mod test;
