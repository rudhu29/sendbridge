#![cfg(test)]
use super::VaultContract;
use soroban_sdk::{contract, contractimpl, symbol_short, Env};

// Mock Counter contract for test setup
#[contract]
pub struct MockCounter;

#[contractimpl]
impl MockCounter {
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&symbol_short!("COUNT")).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&symbol_short!("COUNT"), &count);
        count
    }
}

#[test]
fn test_vault_intercontract_call() {
    let env = Env::default();
    let counter_id = env.register_contract(None, MockCounter);
    
    let vault_id = env.register_contract(None, VaultContract);
    
    // We call deposit_and_increment on Vault, which calls MockCounter
    // We expect it to return 1 (mock counter incremented)
    let val: u32 = env.invoke_contract(
        &vault_id,
        &symbol_short!("deposit_and_increment"),
        soroban_sdk::vec![&env, counter_id.into()],
    );

    assert_eq!(val, 1);
}
