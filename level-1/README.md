# 🥋 Level 1: White Belt Requirements & Verification

This directory contains the documentation and proof of completion for the **Level 1 (White Belt)** Stellar Journey to Mastery challenge.

---

## 📋 Level 1 Specifications

The Level 1 challenge focuses on establishing basic Stellar blockchain interactions, including wallet handling, balance retrieval, and executing native XLM payments on the Stellar Testnet.

### 1. Local Sandbox Wallet Generator
- **Goal**: Generate random keypairs securely client-side.
- **Implementation**: Uses `@stellar/stellar-sdk`'s `Keypair.random()` function to generate a public/secret keypair.
- **Security**: Features a toggle to show/hide the secret key and displays safety warnings about private keys.

#### 📸 Proof: Sandbox Wallet Generator Panel
![Sandbox Wallet Generator Panel](screenshots/01_sandbox_generator.png)
*(Placeholder: Capture a screenshot of the "Local Sandbox Generator" panel in the DApp showing your generated sandbox public address).*

---

### 2. Balance Retrieval (Friendbot Integration)
- **Goal**: Fund a test address using the Stellar Friendbot and load its balance.
- **Implementation**: 
  - Hits the public Friendbot service (`https://friendbot.stellar.org/?addr={address}`) to fund the sandbox keypair with 10,000 Testnet XLM.
  - Queries the Horizon Testnet server (`https://horizon-testnet.stellar.org`) using `loadAccount()` to verify and retrieve the account balance.

#### 📸 Proof: Funded Balance Display
![Funded Balance Card](screenshots/02_balance_retrieved.png)
*(Placeholder: Capture a screenshot showing the balance display card reading 10000.0000 XLM after requesting Friendbot funds).*

---

### 3. Native Payments Transfer
- **Goal**: Build, sign, and submit a native XLM payment transaction on the Testnet.
- **Implementation**: 
  - Dynamically builds a transaction with the payment operation using `@stellar/stellar-sdk`.
  - Signs the transaction with the local sandbox secret key and submits it to Horizon.
  - Tracks client-side execution states: `Idle` ➔ `Loading` ➔ `Success` or `Error`.

#### 📸 Proof: Successful Transaction Broadcast
![Successful Broadcast](screenshots/03_broadcast_successful.png)
*(Placeholder: Capture a screenshot of the "Broadcast Successful" panel in the local sandbox showing the transaction hash).*

#### 📸 Proof: Stellar Expert Explorer Verification
![Stellar Expert Explorer Proof](screenshots/04_stellar_expert_verification.png)
*(Placeholder: Capture a screenshot of the transaction state verified on the [Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet/)).*
