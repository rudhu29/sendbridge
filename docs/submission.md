# Stellar Journey to Mastery - Submission Proofs

This document contains verification records and challenge proofs for both the **White Belt (Level 1)** and **Orange Belt (Level 2)** certifications on the Stellar network.

---

## 🥋 Level 1: White Belt Verification

### Task 1: Wallet Creation
- **Mechanism**: The application generates local, cryptographically secure keypairs client-side using `@stellar/stellar-sdk`'s `Keypair.random()`.
- **Public Address**: Displays `G...` public key address with a copy function.
- **Secrets Management**: Displays `S...` secret key securely hidden behind a visibility toggle. Explains public key vs secret key concepts with prominent security warnings.

> [!NOTE]
> **Evaluation Screenshot**: Capture a screenshot of the "Local Sandbox Generator" panel in the DApp, showing your generated sandbox public address.

---

### Task 2: Balance Retrieval
- **Mechanism**: Queries the public Horizon Testnet server (`https://horizon-testnet.stellar.org`) using the Horizon SDK's `loadAccount` method.
- **Friendbot Integration**: Includes a button triggering the Friendbot service to load 10,000 Testnet XLM.

> [!NOTE]
> **Evaluation Screenshot**: Capture a screenshot showing the balance display card reading `10000.0000 XLM` after requesting Friendbot funds.

---

### Task 3: First Transaction
- **Mechanism**: Builds a payment transaction, signs it locally, and broadcasts it to Horizon Testnet, returning the transaction hash.

> [!NOTE]
> **Evaluation Screenshot**: Capture a screenshot of the "Broadcast Successful" panel in the local sandbox showing the transaction hash, and another of the transaction state in the [Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet/).

---

## 🍊 Level 2: Orange Belt Verification

### Task 1: Multi-Wallet Support
- **Mechanism**: Uses `@creit.tech/stellar-wallets-kit` to connect multiple wallets (Freighter, xBull, Hana, Albedo) via a standardized theme-matching selector modal.
- **State Handling**: Handles cases where the user does not have a wallet installed, rejects connection, or lacks sufficient balance for transactions.

> [!NOTE]
> **Evaluation Screenshot**: Click the "Connect Wallet" button on the main dashboard to open the multi-wallet selection modal. Capture a screenshot of the modal showing the available wallet options.

---

### Task 2: Smart Contract Read
- **Mechanism**: Performs simulations against the deployed Testnet Incrementer and Vault contracts:
  - **Counter Contract ID**: `CA3W3ZZH7CRZU5YEHII6L6TQ3P3OJ5DMVB76URY3I74S3K6NBC5LWL4B`
  - **Vault Contract ID**: `CDQVQRVGMSL23OMWP45R5SHQ2C67TLYWW5CE6YBZPEC5HQWM6J7T4LXY`
  - Reads the current counter value using simulated transactions to the Testnet RPC.

> [!NOTE]
> **Evaluation Screenshot**: Capture a screenshot of the "Soroban Smart Contract" panel showing the counter value successfully fetched from the Testnet contract.

---

### Task 3: Smart Contract Write
- **Mechanism**: Builds a transaction calling either the contract `increment` method (direct) or `deposit_and_increment` (cross-contract call via Vault), signs it with the user's selected browser wallet, and submits it. Shows state transitions:
  - `Idle` ➔ `Preparing` ➔ `Awaiting Signature` ➔ `Broadcasting` ➔ `Success` / `Failed`.

> [!NOTE]
> **Evaluation Screenshot**: Capture a screenshot showing the status label in `Success` state along with the transaction hash confirming your contract call.

---

### Task 4: Real-Time Event Listener
- **Mechanism**: When "Start Live Listener" is toggled, a polling interval queries the network for contract events every 5 seconds. If the counter changes on-chain (either through the Counter or Vault contract), the event log updates in real-time, displaying ledger heights.

---

## 🛠️ On-Chain Proofs

- **Counter Deployed Contract ID**: `CA3W3ZZH7CRZU5YEHII6L6TQ3P3OJ5DMVB76URY3I74S3K6NBC5LWL4B`
- **Counter Instantiation Hash**: `85cd00e47e6f79cad58293dd57a1701c0127c363bcaa3b93e6414d26c790ea69`
- **Vault Deployed Contract ID**: `CDQVQRVGMSL23OMWP45R5SHQ2C67TLYWW5CE6YBZPEC5HQWM6J7T4LXY`
- **Vault Instantiation Hash**: `22c3c1149e038941dc7fa5dfffb68ccd22ac8768f3541ff8f409634a86945be7`
- **Horizon Testnet URL**: `https://horizon-testnet.stellar.org`
- **Soroban RPC Testnet URL**: `https://soroban-testnet.stellar.org`
