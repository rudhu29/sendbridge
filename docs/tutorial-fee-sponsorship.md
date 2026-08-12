# Soroban Fee Sponsorship: Building Gasless Transactions using Fee Bumps

Stellar provides a built-in mechanism for fee sponsorship called **Fee Bump Transactions** (defined in SEP-0023/CAP-0015). This allows a sponsor account (such as an application backend or admin service) to pay the transaction fees on behalf of an end-user, enabling a **gasless** user experience.

This tutorial walks you through how to construct, sign, and submit a sponsored transaction using the new `@stellar/stellar-sdk`.

---

## 💡 What is a Fee Bump Transaction?

A Fee Bump Transaction is an envelope that wraps an inner transaction. 
1. The **Inner Transaction** is built and signed by the user's account. It contains the actual operations (e.g. sending a remittance, invoking a Soroban contract). It can have a fee set to 0.
2. The **Outer Transaction (Fee Bump)** specifies a `feeSource` account (the sponsor) and the fee that the sponsor is willing to pay. The fee bump is signed by the sponsor.

---

## 🛠️ Step-by-Step Implementation

Here is how you can implement this in Javascript / TypeScript.

### Step 1: Install Dependencies
Ensure you have the latest Stellar SDK installed:
```bash
npm install @stellar/stellar-sdk
```

### Step 2: Build and Sign the Inner Transaction
The user signs the inner transaction containing the contract call.

```javascript
import { 
  Horizon, 
  TransactionBuilder, 
  Account, 
  Networks, 
  Contract, 
  Address 
} from "@stellar/stellar-sdk";

// 1. Load the user's account sequence
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const userAccountInfo = await server.loadAccount(userAddress);
const userAccount = new Account(userAddress, userAccountInfo.sequenceNumber());

// 2. Build the inner transaction calling the remittance contract
const contractInstance = new Contract(CONTRACT_ID);
const innerTx = new TransactionBuilder(userAccount, {
  fee: "0", // Inner fee can be 0 since the fee bump will pay the fee
  networkPassphrase: Networks.TESTNET
})
.addOperation(contractInstance.call(
  "send_remittance",
  new Address(userAddress).toScVal(),
  new Address(recipientAddress).toScVal(),
  new Address(nativeTokenId).toScVal(),
  amountScVal,
  currencySymbolScVal
))
.setTimeout(60)
.build();

// 3. Request user's wallet signature
// In a frontend, you would call freighter or wallets-kit:
const signedInnerTxXdr = await walletsKit.signTransaction(innerTx.toXDR());
```

### Step 3: Wrap and Sign with Fee Bump (Sponsor)
Now, wrap the user-signed transaction into a Fee Bump transaction and sign it using the sponsor's credentials.

```javascript
import { Keypair } from "@stellar/stellar-sdk";

// 1. Re-construct the signed inner transaction from XDR
const userSignedTx = new Transaction(signedInnerTxXdr, Networks.TESTNET);

// 2. Build the fee bump transaction
const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
  sponsorAddress,            // Fee source (sponsor account)
  "500",                     // Fee bid for the bump
  userSignedTx,              // Inner transaction
  Networks.TESTNET           // Network passphrase
);

// 3. Sign the fee bump with the sponsor's keypair
const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET_KEY);
feeBumpTx.sign(sponsorKeypair);
```

### Step 4: Submit to the Horizon Node
Submit the outer transaction to the network.

```javascript
try {
  const result = await server.submitTransaction(feeBumpTx);
  console.log(`Transaction successful! Hash: ${result.hash}`);
} catch (error) {
  console.error("Submission failed:", error);
}
```

---

## 🌟 Benefits of Fee Bump Sponsorship
1. **Gasless UX**: Users don't need to hold XLM to interact with your Soroban dApp.
2. **Onboarding Conversion**: Dramatically lowers the barrier to entry for diaspora and non-crypto users.
3. **Compliant Control**: Sponsors can limit sponsorship to registered KYC-verified users.
