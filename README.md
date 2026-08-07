# Stellar Mastery: White & Orange Belt DApp

A production-quality dashboard built to satisfy both **Level 1 (White Belt)** and **Level 2 (Orange Belt)** of the **Stellar Journey to Mastery**. It implements local sandboxes, multi-wallet connections, native payment transfers, and live Soroban smart contract interactions.

---

## 🚀 Live Info

- **Live Demo URL**: [https://sendbridge-one-ebon.vercel.app/](https://sendbridge-one-ebon.vercel.app/)
- **Deployed Contract ID**: `CDJZDEAL3BDJWMXBBAWSAWSBAWSBAWSBAWSBAWSBAWSBAWSBAWSBAWSA`
- **Successful Transaction Hash**: `[Paste your verified increment transaction hash here]`

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

## 🔮 Future Improvements

1. **Soroban Contract Deployment Script**: Automate contract updates using WASM compiler chains inside Ubuntu WSL.
2. **Transaction History Feed**: Query the Horizon endpoint for past transactions of the connected address.
3. **Enhanced Asset Management**: Support custom Stellar token trustlines (like USDC or custom stablecoins).
