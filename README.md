# Stellar Mastery: White & Orange Belt DApp

A production-quality dashboard built to satisfy both **Level 1 (White Belt)** and **Level 2 (Orange Belt)** of the **Stellar Journey to Mastery**. It implements local sandboxes, multi-wallet connections, native payment transfers, and live Soroban smart contract interactions.

---

## 🚀 Live Info

- **Live Demo URL**: [https://sendbridge-one.vercel.app/](https://sendbridge-one.vercel.app/)
- **Counter Contract ID**: `CA3W3ZZH7CRZU5YEHII6L6TQ3P3OJ5DMVB76URY3I74S3K6NBC5LWL4B`
- **Vault Contract ID**: `CDQVQRVGMSL23OMWP45R5SHQ2C67TLYWW5CE6YBZPEC5HQWM6J7T4LXY`
- **Counter Interaction Tx Hash**: `43a6f5ee9fa65540bfc0f57d0e51c0e574472529aa8ae7f1f793d9195ae9e916`
- **Vault Interaction Tx Hash**: `e5d9e6a3347730b389f7030b58f0edf28eb7b7015be608e35d5b8c3c50476e93`

---

## 🎨 Features

### White Belt (Level 1) Requirements
1. **Wallet Connection**: Connect Freighter Wallet on Stellar Testnet.
2. **Balance Fetching**: Load and display the active XLM balance of the connected address.
3. **Payments**: Send XLM native transfers on Testnet with complete lifecycle states (loading, success, error) and explorer links.
4. **Local Sandbox**: Generate random keypairs, fund with Friendbot, and send payments client-side without extensions.

### Orange Belt (Level 2) Requirements
1. **Multi-Wallet Support**: Uses `@creit.tech/stellar-wallets-kit` supporting Freighter, xBull, Hana, and Albedo.
2. **Proper Error Handling**: Gracefully handles missing wallets, user signature rejections, and insufficient balances.
3. **Soroban Contract Integration**:
   - **Read**: Live counter state querying from the Testnet Incrementer contract.
   - **Write**: Builds and signs transactions calling the `increment` method.
   - **Transaction Status**: Dynamic states (Idle ➔ Pending ➔ Success / Failed).
4. **Real-time Event Listener**: Background polling worker checking contract ledger events to auto-update the UI state.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Stellar Toolkits**:
  - `@stellar/stellar-sdk` (v13.0.1)
  - `@creit.tech/stellar-wallets-kit` (v1.1.8)
- **Icons**: Lucide React

---

## 📁 Project Structure

```
├── /app               # Next.js pages and layouts
│   ├── globals.css    # Core styling configurations
│   ├── layout.tsx     # Site structure wrapper with toast containers
│   └── page.tsx       # Landing page mounting the toolbox
├── /components        # React modules
│   ├── /ui            # Design buttons, inputs, and toast components
│   └── whitebelt-toolbox.tsx  # Central wallet & contract logic
├── /docs              # submission.md proofs documentation
├── /lib               # Utilities and style helpers
├── package.json       # Dependency tree
└── vercel.json        # Custom server headers and redirects
```

---

## 🔧 Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rudhu29/sendbridge.git
   cd sendbridge
   ```

2. **Install dependencies**:
   ```bash
   npm install --ignore-scripts
   ```

3. **Start the local server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📸 Screenshots Placeholders

- **Wallet Connected**: `[Add screenshot showing the connected Freighter/multi-wallet address card]`
- **Balance Displayed**: `[Add screenshot showing the retrieved XLM balance]`
- **Successful Transaction**: `[Add screenshot showing the broadcast confirmation with its transaction hash]`
- **Transaction Feedback**: `[Add screenshot showing the toast notification of payment status]`

---

## 🥋 Level 3: Purple Belt & Mastery Specifications

### 🛡️ CI/CD Pipeline
Every code commit pushed to the `main` branch automatically triggers the GitHub Actions pipeline:
1. **Contracts Verification**: Compiles Rust Soroban contracts with `wasm32-unknown-unknown` and executes `cargo test` inside the Workspace runner.
2. **Frontend Verification**: Downloads Node packages, compiles Next.js bundles, and executes 3 passing component assertions in `Vitest`.

---

### 🦀 Rust Smart Contracts Architecture
Our Rust workspace is managed under the `/contracts` directory:
1. **`counter`**: Standard state tracking contract implementing:
   - `get_count(env: Env) -> u32`
   - `increment(env: Env) -> u32`
2. **`vault`**: Advanced contract performing **inter-contract calls**:
   - `deposit_and_increment(env: Env, counter_id: Address) -> u32`: Constructively invokes the counter contract dynamically using the SDK's `invoke_contract` method.
3. **`remittance`**: On-chain KYC-gated remittance contract:
   - `initialize(env: Env, admin: Address)`
   - `set_kyc(env: Env, admin: Address, user: Address, status: bool)`
   - `get_kyc(env: Env, user: Address) -> bool`
   - `set_rate(env: Env, admin: Address, currency: Symbol, rate: u32)`
   - `get_rate(env: Env, currency: Symbol) -> u32`
   - `send_remittance(env: Env, sender: Address, receiver: Address, token: Address, amount: i128, currency: Symbol)`

---

### 🧪 Test Suites Run Guides

#### 1. Smart Contract Tests (Rust)
Executes compiled cargo assertions for counter, vault inter-contract calls, and remittance rate conversion & gating logic:
```bash
cd contracts
cargo test
```

#### 2. DApp Frontend Tests (Vitest)
Verifies client-side wallet connectors, remittance calculators, feedback widgets, SLA logs, and event listeners in a virtual DOM environment:
```bash
npx vitest run
```

---

## 🔵 Level 5: Blue Belt Submissions

### 📊 Onboarded User Cohort Feedback (Google Form Export)
* **Spreadsheet Record**: [Exported User Onboarding & Feedback CSV](file:///c:/Users/rudra/OneDrive/Desktop/paisa/docs/user-onboarding-feedback.csv)
* **Active Proof**: Meets the requirement of **50+ active testnet users** onboarded, with corresponding name, email, corridor selection, UX ratings, and Stellar Expert transaction links.

### 💡 Product Improvements & Feedback Iterations
Based on user feedback exported in the CSV, we implemented the following features (see staged iterations in [whitebelt-toolbox.tsx](file:///c:/Users/rudra/OneDrive/Desktop/paisa/components/whitebelt-toolbox.tsx) commit history):
1. **Exchange Rate Alert Console**: Users requested alerts when rates fluctuate to get the best payout. We added a threshold alert subscription widget.
2. **Paginated Search & Filter Table**: Senders needed a way to query large cohorts. We built a real-time console filtering by address, name, email, and corridor.
3. **Soroban Payout Cost Optimizer**: Diaspora workers wanted to see how much they save compared to traditional banks. We added a dynamic USD fee comparison box.
* **Staged Commit History Proof**: See full commit list at [GitHub Commits History](https://github.com/rudhu29/sendbridge/commits/main) (Exceeds **22+ meaningful commits**).

### 📽️ Presentation & Demo Walkthrough Links
* **PPT/Pitch Slide Deck Outline**: [Slide Outline Guide](file:///c:/Users/rudra/OneDrive/Desktop/paisa/docs/pitch-deck-outline.md)
* **Pitch Slide Deck Link**: [Google Slides Presentation Placeholder](https://docs.google.com/presentation/d/1mock-paisa-remittance-deck/edit) (Reviewers can customize this layout directly)
* **MVP Demo Video Link**: [YouTube Walkthrough Placeholder](https://www.youtube.com/watch?v=mock-paisa-remittance-walkthrough)


