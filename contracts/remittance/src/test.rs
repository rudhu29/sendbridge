#![cfg(test)]
use super::{RemittanceContract, RemittanceContractClient, RemittanceError};
use soroban_sdk::{Symbol, Address, Env};
use soroban_sdk::testutils::Address as _;

#[test]
fn test_remittance_workflow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);

    client.initialize(&admin);

    assert_eq!(client.get_admin(), admin);

    // KYC should be false initially
    assert_eq!(client.get_kyc(&sender), false);

    // Approve sender KYC
    client.set_kyc(&admin, &sender, &true);
    assert_eq!(client.get_kyc(&sender), true);

    // Register rate for INR (e.g. 1 XLM = 82.50 INR, rate = 8250, scaled by 100)
    let inr = Symbol::new(&env, "INR");
    client.set_rate(&admin, &inr, &8250);
    assert_eq!(client.get_rate(&inr), 8250);

    // Register a mock token/asset (like native XLM)
    let token_admin = Address::generate(&env);
    let token_contract_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract_id);
    let token_token_client = soroban_sdk::token::Client::new(&env, &token_contract_id);

    // Mint some tokens to sender
    token_client.mint(&sender, &1000);
    assert_eq!(token_token_client.balance(&sender), 1000);

    // Send remittance: sender sends 500 stroops of XLM
    let payout = client.send_remittance(&sender, &receiver, &token_contract_id, &500, &inr);

    // Math: (500 * 8250) / 100 = 41250
    assert_eq!(payout, 41250);

    // Check balances
    assert_eq!(token_token_client.balance(&sender), 500);
    assert_eq!(token_token_client.balance(&receiver), 500);
}

#[test]
fn test_remittance_fails_un_kyc() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    let contract_id = env.register_contract(None, RemittanceContract);
    let client = RemittanceContractClient::new(&env, &contract_id);

    client.initialize(&admin);

    let inr = Symbol::new(&env, "INR");
    client.set_rate(&admin, &inr, &8250);

    let token_admin = Address::generate(&env);
    let token_contract_id = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract_id);
    token_client.mint(&sender, &1000);

    // KYC is not set for sender, so this should return RemittanceError::NotKycVerified
    let res = client.try_send_remittance(&sender, &receiver, &token_contract_id, &500, &inr);
    
    // In Soroban testing, contract-defined errors are returned as Err(Ok(ContractError))
    assert_eq!(res, Err(Ok(RemittanceError::NotKycVerified)));
}
