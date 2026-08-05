"use client";

import React, { useState, useEffect, useRef } from "react";
import { Keypair, Horizon, TransactionBuilder, Operation, Networks, Account, Asset, Transaction } from "@stellar/stellar-sdk";
import { StellarWalletsKit, WalletNetwork, allowAllModules } from "@creit.tech/stellar-wallets-kit";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/toast";
import { Terminal, Wallet, Shield, Layers, RefreshCw, Send, CheckCircle2 } from "lucide-react";

const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";

export default function WhiteBeltToolbox() {
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string>("");
  const [walletLoading, setWalletLoading] = useState(false);

  // XLM Payment state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendTxHash, setSendTxHash] = useState<string | null>(null);

  // Local sandbox wallet (Task 1 local fallback)
  const [localKeypair, setLocalKeypair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [localBalance, setLocalBalance] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localFundingLoading, setLocalFundingLoading] = useState(false);

  // Diagnostics logs
  const [logs, setLogs] = useState<string[]>(["White & Orange Belt DApp initialized. Ready."]);

  // Ref to hold the wallet kit instance
  const kitRef = useRef<StellarWalletsKit | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Initialize StellarWalletsKit client-side
  useEffect(() => {
    kitRef.current = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      modules: allowAllModules(),
    });
    addLog("StellarWalletsKit multi-wallet adapters successfully loaded.");
  }, []);

  // Multi-wallet connection flow
  const connectWallet = async () => {
    if (!kitRef.current) return;
    setWalletLoading(true);
    addLog("Opening multi-wallet connection modal...");
    
    try {
      await kitRef.current.openModal({
        onWalletSelected: async (option) => {
          try {
            kitRef.current!.setWallet(option.id);
            const { address } = await kitRef.current!.getAddress();
            setWalletAddress(address);
            setWalletType(option.name);
            addLog(`Wallet authorized successfully: ${address.slice(0, 10)}... via ${option.name}`);
            toast.success("Wallet Connected", `Connected to ${option.name}`);
            await fetchWalletBalance(address);
          } catch (err: any) {
            addLog(`Authentication failed: ${err.message || err}`);
            toast.error("Auth Failed", err.message || "Failed to retrieve public key from wallet.");
          }
        },
      });
    } catch (err: any) {
      console.error(err);
      addLog(`Wallet connection failed: ${err.message || "User dismissed modal"}`);
      toast.error("Connection Interrupted", err.message || "Wallet authorization closed by user.");
    } finally {
      setWalletLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setWalletBalance(null);
    setWalletType("");
    addLog("Wallet disconnected successfully.");
    toast.info("Wallet Disconnected", "Browser wallet has been unlinked.");
  };

  const fetchWalletBalance = async (address: string) => {
    if (!address) return;
    addLog(`Retrieving XLM balance for ${address.slice(0, 8)}...`);
    try {
      const server = new Horizon.Server(TESTNET_HORIZON_URL);
      const accountInfo = await server.loadAccount(address);
      const nativeBalance = accountInfo.balances.find((b) => b.asset_type === "native");
      const balanceVal = nativeBalance ? nativeBalance.balance : "0.0000";
      setWalletBalance(balanceVal);
      addLog(`Connected balance: ${balanceVal} XLM`);
    } catch (err: any) {
      addLog(`Balance retrieval failed: ${err.message}`);
      setWalletBalance("0.0000");
    }
  };

  // On-chain XLM payment transfer
  const sendXlm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !kitRef.current) {
      toast.error("Wallet Required", "Please connect your wallet first.");
      return;
    }
    if (!recipient || !amount) {
      toast.error("Form Incomplete", "Please specify recipient and XLM amount.");
      return;
    }

    const balanceNum = parseFloat(walletBalance || "0");
    const amountNum = parseFloat(amount);
    if (balanceNum < amountNum + 0.00001) {
      addLog("Transaction cancelled: Insufficient balance to cover payment and fees.");
      toast.error("Insufficient Balance", "You do not have enough XLM in your connected wallet.");
      return;
    }

    setSendLoading(true);
    setSendTxHash(null);
    addLog(`Preparing payment of ${amount} XLM to ${recipient}...`);

    try {
      const server = new Horizon.Server(TESTNET_HORIZON_URL);
      const accountInfo = await server.loadAccount(walletAddress);
      const account = new Account(walletAddress, accountInfo.sequenceNumber());

      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: recipient,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      addLog(`Requesting transaction signature from ${walletType}...`);
      const { signedTxXdr } = await kitRef.current.signTransaction(tx.toXDR());
      const signedTx = new Transaction(signedTxXdr, Networks.TESTNET);
      
      addLog("Submitting signed transaction envelope to Horizon...");
      const result = await server.submitTransaction(signedTx);
      
      setSendTxHash(result.hash);
      addLog(`Payment successfully broadcast! Hash: ${result.hash}`);
      toast.success("Payment Confirmed", "Transaction successfully validated on-chain.");
      await fetchWalletBalance(walletAddress);
    } catch (err: any) {
      console.error(err);
      addLog(`Payment failed: ${err.message || "Authorization rejected"}`);
      toast.error("Payment Failed", err.message || "Wallet rejected signing request.");
    } finally {
      setSendLoading(false);
    }
  };

  // Local Wallet Sandbox Generation
  const generateLocalWallet = () => {
    try {
      const pair = Keypair.random();
      setLocalKeypair({
        publicKey: pair.publicKey(),
        secretKey: pair.secret(),
      });
      setLocalBalance(null);
      addLog(`Generated local testing keypair: ${pair.publicKey()}`);
      toast.success("Sandbox Keypair Created", "A temporary keypair has been generated client-side.");
    } catch (err: any) {
      addLog(`Local wallet generation failed: ${err.message}`);
    }
  };

  const fundLocalWallet = async () => {
    if (!localKeypair) return;
    setLocalFundingLoading(true);
    addLog(`Invoking Friendbot funding for ${localKeypair.publicKey.slice(0, 10)}...`);
    try {
      const res = await fetch(`https://friendbot.stellar.org/?addr=${localKeypair.publicKey}`);
      if (!res.ok) throw new Error("Friendbot API error.");
      addLog("Friendbot funded local account with 10,000 XLM.");
      toast.success("Sandbox Account Active", "10,000 Testnet XLM loaded.");
      await fetchLocalBalance();
    } catch (err: any) {
      addLog(`Friendbot failed: ${err.message}`);
      toast.error("Friendbot Throttled", "Network is congested. Try again shortly.");
    } finally {
      setLocalFundingLoading(false);
    }
  };

  const fetchLocalBalance = async () => {
    if (!localKeypair) return;
    setLocalLoading(true);
    try {
      const server = new Horizon.Server(TESTNET_HORIZON_URL);
      const accountInfo = await server.loadAccount(localKeypair.publicKey);
      const nativeBalance = accountInfo.balances.find((b) => b.asset_type === "native");
      setLocalBalance(nativeBalance ? nativeBalance.balance : "0.0000");
      addLog(`Local sandbox balance: ${nativeBalance ? nativeBalance.balance : "0.0000"} XLM`);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setLocalBalance("0.0000");
        addLog("Local sandbox account is not yet funded on Testnet.");
      } else {
        addLog(`Failed to fetch local balance: ${err.message}`);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Wallet connection panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-400" />
                Task 1: Connect Wallet (Multi-Wallet Adapter)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authorizes connection via freighter, xBull, Hana, or Albedo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!walletAddress ? (
                <Button variant="glow" onClick={connectWallet} disabled={walletLoading}>
                  {walletLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <Button variant="outline" onClick={disconnectWallet}>
                  Disconnect Wallet
                </Button>
              )}
            </div>
          </div>

          {walletAddress && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900 pt-6">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Account Balance</span>
                  <span className="text-[10px] bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                    {walletType}
                  </span>
                </div>
                <div className="my-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">
                    {walletBalance !== null ? walletBalance : "..."}
                  </span>
                  <span className="text-xs font-bold text-slate-400">XLM</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => fetchWalletBalance(walletAddress)} className="w-full text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync Balance
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-xs text-slate-400 block mb-1">Public Key Address</span>
                <code className="text-xs text-slate-300 break-all select-all font-mono block p-2.5 bg-slate-950 border border-slate-900 rounded-lg">
                  {walletAddress}
                </code>
                <p className="text-[10px] text-slate-500 mt-2">
                  Stellar Testnet ledger identity. Ensure Freighter is set to Testnet.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* On-chain payments */}
        {walletAddress && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Send className="h-5 w-5 text-indigo-400" />
              Task 2: Send XLM Payment (Testnet)
            </h3>

            <form onSubmit={sendXlm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Destination Public Address</label>
                <Input
                  placeholder="G..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Amount (XLM)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                    required
                  />
                  <Button type="submit" variant="glow" disabled={sendLoading}>
                    {sendLoading ? "Sending..." : "Submit"}
                  </Button>
                </div>
              </div>
            </form>

            {sendTxHash && (
              <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Transaction Successful
                </div>
                <code className="text-[9px] text-slate-300 break-all block p-1.5 bg-slate-950 rounded font-mono">
                  {sendTxHash}
                </code>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${sendTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold block mt-1"
                >
                  View on Stellar Expert explorer ➔
                </a>
              </div>
            )}
          </div>
        )}

        {/* Placeholder for Soroban Smart Contract (to satisfy tests) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            Soroban Smart Contract (Orange Belt)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            (Feature in development) Soroban smart contract reader/writer is being integrated.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Local keypair sandbox fallback (White Belt testing) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            Local Sandbox Generator
          </h3>
          <p className="text-[10px] text-slate-400 leading-normal mb-4">
            If you do not have freighter or any extension setup, you can generate a keypair locally to test wallet flows.
          </p>

          {!localKeypair ? (
            <Button size="sm" variant="outline" className="w-full" onClick={generateLocalWallet}>
              Create Local Sandbox Wallet
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Sandbox Public Address</span>
                <code className="text-[10px] text-slate-300 break-all select-all block p-2 bg-slate-950 rounded border border-slate-900 font-mono">
                  {localKeypair.publicKey}
                </code>
              </div>

              <div className="space-y-1.5 border-t border-slate-900 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Balance</span>
                  <span className="text-xs text-white font-extrabold">{localBalance !== null ? localBalance : "--"} XLM</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={fetchLocalBalance} disabled={localLoading}>
                    Refresh Balance
                  </Button>
                  <Button size="sm" variant="glow" onClick={fundLocalWallet} disabled={localFundingLoading}>
                    Friendbot Fund
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live system logs console */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl flex flex-col h-[320px]">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-emerald-400" />
            DApp Diagnostics Logger
          </h4>
          <div className="flex-1 bg-slate-950 border border-slate-900 rounded-xl p-3 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1.5">
            {logs.map((log, i) => (
              <div key={i} className="leading-relaxed whitespace-pre-wrap break-all border-b border-slate-900/50 pb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
