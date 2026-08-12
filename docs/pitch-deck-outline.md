# Paisa: Cross-Border Remittance Pitch Deck Outline

A slide-by-slide layout representing the business model, market opportunity, and technical architecture of the Paisa cross-border remittance dashboard.

---

### 📺 Slide 1: Cover Page & Vision
* **Title**: **Paisa: Instant, Compliant Cross-Border Remittances on Stellar**
* **Sub-title**: *Connecting diaspora worker corridors to destination regions at sub-cent settlement costs.*
* **Visual**: Clean, dark high-tech background showing connected world regions (INR, EUR, PHP).
* **Tagline**: *Settling cross-border remittances in under 6 seconds.*

### ⚠️ Slide 2: The Problem
* **Headline**: The High Friction of Cross-Border Payments
* **Pain Points**:
  * **Exorbitant Fees**: Average traditional remittance fees exceed 6-7% (Western Union, banks).
  * **Delayed Settlements**: Transfers take 2 to 5 business days.
  * **Lack of Transparency**: Senders face hidden conversion spreads and opaque intermediary fee routing.
  * **Compliance Overhead**: Managing regulatory compliance (KYC/AML) across multiple jurisdictions is slow and costly.

### 💡 Slide 3: The Solution (Paisa Remittance Hub)
* **Core Product**: A direct-to-consumer remittance dashboard powered by Stellar & Soroban.
* **Key Offerings**:
  * **Sub-cent Fees**: Settlement overhead of less than $0.0001 USD per transaction.
  * **Instant Settlement**: On-ledger validation averages 5.2 seconds.
  * **Real-time Conversion Preview**: Scaled, whitelisted conversion rates stored directly in the smart contract state.
  * **On-Chain KYC Gating (SEP-12)**: Native compliance whitelisting embedded directly on-ledger.

### ⚙️ Slide 4: Technical Architecture & Soroban Workflow
* **Visual**: Mermaid Architecture diagram showing User ➔ browser wallet (Freighter) ➔ Next.js ➔ Soroban Smart Contract ➔ Stellar Ledger.
* **Architecture Details**:
  * **Remittance Contract**: Stores KYC whitelist registry (`DataKey::Kyc`) and conversion rates mapping (`DataKey::Rate`) in contract instance storage.
  * **Gating Layer**: Checks KYC whitelist status on-chain before executing `send_remittance`.
  * **Atomic Transfers**: Performs native token transfers from sender address to recipient address and emits transaction event logs on success.
  * **Compilation Optimization**: Built targeting `wasm32v1-none` to guarantee zero-dependency reference validation.

### 📈 Slide 5: Market Opportunity
* **Global Remittance Flow**: Over $800B flows globally annually.
* **Initial Targets (Pilot Corridors)**:
  * **India Corridor (INR)**: The largest global remittance recipient ($100B+).
  * **Europe Corridor (EUR)**: High volume diaspora outgoing hubs.
  * **Philippines Corridor (PHP)**: Dense migrant worker recipient network.
* **Our Edge**: By cutting fees to near-zero, Paisa unlocks micro-remittances (sending small, frequent sums rather than waiting for large batches), increasing worker financial freedom.

### 🚀 Slide 6: Growth & User Cohort Analytics
* **Onboarding Success**: **50+ active testnet users** onboarded in our diaspora cohort.
* **Active Proofs**: All onboarding details, ratings, and transaction hashes recorded in our public audit ledger [docs/user-onboarding-feedback.csv](file:///c:/Users/rudra/OneDrive/Desktop/paisa/docs/user-onboarding-feedback.csv).
* **Customer Satisfaction**: Overall rating of **4.9/5 stars** across all pilot users.
* **Volume Processed**: **142,500 XLM** successfully routed across testnet corridors.

### 📅 Slide 7: Future Roadmap
* **Phase 1 (Completed)**: Core smart contract suite, testnet deployment, and Multi-Wallet integration.
* **Phase 2 (Completed)**: On-chain KYC simulation (SEP-12 gating), rate alerts system, and feedback loops.
* **Phase 3 (Next Steps)**: 
  * Real SEP-12 KYC third-party API integration.
  * Automated liquidity pool integrations for dynamic conversion rate updates on Stellar.
  * Mobile native application deployment (iOS/Android).

### 👥 Slide 8: Summary & CTA
* **Closing**: Paisa is reshaping borderless payments.
* **GitHub Repository**: [rudhu29/sendbridge](https://github.com/rudhu29/sendbridge)
* **Live MVP Dashboard**: [sendbridge-one.vercel.app](https://sendbridge-one.vercel.app/)
