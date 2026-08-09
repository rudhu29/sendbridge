"use client";

import React, { useState, useEffect, useRef } from "react";
import { Keypair, Horizon, TransactionBuilder, Operation, Networks, Account, Asset, Transaction, Contract, Address, xdr } from "@stellar/stellar-sdk";
import { StellarWalletsKit, WalletNetwork, allowAllModules } from "@creit.tech/stellar-wallets-kit";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/toast";
import { 
  Key, Coins, Send, Terminal, CheckCircle2, AlertTriangle, ArrowRight,
  Wallet, Shield, Server, RefreshCw, Layers, Award, Radio, Play
} from "lucide-react";

const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";
const TESTNET_SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
// Deployed Testnet Incrementer and Vault contract IDs for verification
const DEFAULT_COUNTER_ID = "CA3W3ZZH7CRZU5YEHII6L6TQ3P3OJ5DMVB76URY3I74S3K6NBC5LWL4B";
const DEFAULT_VAULT_ID = "CDQVQRVGMSL23OMWP45R5SHQ2C67TLYWW5CE6YBZPEC5HQWM6J7T4LXY";

export default function WhiteBeltToolbox() {
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string>("");
  const [walletLoading, setWalletLoading] = useState(false);

  // XML Payment state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendTxHash, setSendTxHash] = useState<string | null>(null);

  // Local sandbox wallet (Task 1 local fallback)
  const [localKeypair, setLocalKeypair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [localBalance, setLocalBalance] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localFundingLoading, setLocalFundingLoading] = useState(false);

  // Smart Contract state (Task 4)
  const [selectedContract, setSelectedContract] = useState<"counter" | "vault">("counter");
  const [counterContractId, setCounterContractId] = useState(DEFAULT_COUNTER_ID);
  const [vaultContractId, setVaultContractId] = useState(DEFAULT_VAULT_ID);
  const [contractCounter, setContractCounter] = useState<number | null>(null);
  const [contractStatus, setContractStatus] = useState<"Idle" | "Preparing" | "Awaiting Signature" | "Broadcasting" | "Success" | "Failed">("Idle");
  const [contractTxHash, setContractTxHash] = useState<string | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [contractEvents, setContractEvents] = useState<string[]>([]);

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

  // Read Data: Simulate contract call to `get_count`
  const readContractValue = async () => {
    if (!counterContractId) return;
    setContractLoading(true);
    addLog(`Querying state for counter contract: ${counterContractId.slice(0, 10)}...`);
    
    try {
      const dummyAccount = new Account("GBAUMMVLM4OC2WWT4W2SVSXG2Z5JNWZVTKW3O7H2P6H66ZVT3H5W2N66", "0");
      const contractInstance = new Contract(counterContractId);
      const tx = new TransactionBuilder(dummyAccount, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
      .addOperation(contractInstance.call("get_count"))
      .setTimeout(30)
      .build();

      const txXdr = tx.toXDR();
      const res = await fetch(TESTNET_SOROBAN_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "simulateTransaction",
          params: {
            transaction: txXdr
          }
        })
      });

      const data = await res.json();
      if (data.result && data.result.results && data.result.results[0]) {
        const resultXdr = data.result.results[0].xdr;
        const scVal = xdr.ScVal.fromXDR(resultXdr, 'base64');
        const count = scVal.u32();
        setContractCounter(count);
        addLog(`Read Counter Value from Ledger: ${count}`);
      } else {
        throw new Error("No simulation results returned from RPC.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Failed to query contract value: ${err.message || err}`);
    } finally {
      setContractLoading(false);
    }
  };

  // Poll contract events dynamically to show live updates
  const pollContractEvents = async () => {
    if (!counterContractId) return;
    try {
      const ledgerRes = await fetch(TESTNET_SOROBAN_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getLatestLedger"
        })
      });
      const ledgerData = await ledgerRes.json();
      const latestLedger = ledgerData.result?.sequence;
      if (!latestLedger) return;

      const startLedger = Math.max(1, latestLedger - 1000);
      const filterIds = [counterContractId];
      if (vaultContractId) {
        filterIds.push(vaultContractId);
      }

      const res = await fetch(TESTNET_SOROBAN_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getEvents",
          params: {
            startLedger: startLedger,
            filters: [{ type: "contract", contractIds: filterIds }],
            limit: 10
          }
        })
      });

      const data = await res.json();
      const events = data.result?.events || [];
      if (events.length > 0) {
        const formattedEvents = events.map((ev: any) => {
          const ledgerSeq = ev.ledger;
          const contractLabel = ev.contractId === counterContractId ? "Counter" : "Vault";
          
          let parsedVal = "emitted event";
          try {
            if (ev.value && ev.value.xdr) {
              const scVal = xdr.ScVal.fromXDR(ev.value.xdr, 'base64');
              if (scVal.switch().name === 'scvU32') {
                parsedVal = `incremented to ${scVal.u32()}`;
              }
            }
          } catch {}
          
          return `[Ledger ${ledgerSeq}] ${contractLabel} contract ${parsedVal}`;
        });
        setContractEvents(formattedEvents);
      }
    } catch (err: any) {
      console.error("Failed to poll events:", err);
    }
  };

  // Write Data: Invoke `increment` or `deposit_and_increment`
  const incrementContractValue = async () => {
    const currentContractId = selectedContract === "counter" ? counterContractId : vaultContractId;
    if (!currentContractId) {
      toast.error("Address Required", "Please specify the contract address.");
      return;
    }
    
    // Error Type 1: Missing wallet connection
    if (!walletAddress || !kitRef.current) {
      addLog("Contract call failed: Wallet not connected.");
      toast.error("Wallet Required", "Please connect a browser wallet first.");
      return;
    }

    // Error Type 3: Low balance checking before simulation
    const balanceNum = parseFloat(walletBalance || "0");
    if (balanceNum < 2.0) {
      addLog("Simulation aborted: XLM balance is too low (minimum 2.0 XLM recommended for Soroban gas/fees).");
      toast.error("Low Balance", "You need at least 2 XLM to cover Soroban transaction resource fees.");
      setContractStatus("Failed");
      return;
    }
    
    setContractStatus("Preparing");
    setContractTxHash(null);
    addLog(`Building transaction to invoke contract method on: ${currentContractId.slice(0, 10)}...`);

    try {
      const server = new Horizon.Server(TESTNET_HORIZON_URL);
      const accountInfo = await server.loadAccount(walletAddress);
      const account = new Account(walletAddress, accountInfo.sequenceNumber());

      const contractInstance = new Contract(currentContractId);

      // Build transaction invocation operation
      let op;
      if (selectedContract === "counter") {
        op = contractInstance.call("increment");
      } else {
        const counterScVal = new Address(counterContractId).toScVal();
        op = contractInstance.call("deposit_and_increment", counterScVal);
      }

      const tx = new TransactionBuilder(account, {
        fee: "150",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(op)
        .setTimeout(30)
        .build();

      setContractStatus("Awaiting Signature");
      addLog("Requesting transaction signature from browser wallet...");
      
      const { signedTxXdr } = await kitRef.current.signTransaction(tx.toXDR());
      const signedTx = new Transaction(signedTxXdr, Networks.TESTNET);
      
      setContractStatus("Broadcasting");
      addLog("Submitting signed transaction envelope to Soroban network...");
      const result = await server.submitTransaction(signedTx);
      
      setContractTxHash(result.hash);
      setContractStatus("Success");
      addLog(`Soroban call confirmed! Hash: ${result.hash}`);
      toast.success("Contract Updated", "Method successfully executed on-chain!");
      await readContractValue();
      await fetchWalletBalance(walletAddress);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || String(err);
      
      // Error Type 2: User rejected signing
      if (
        errorMsg.toLowerCase().includes("user reject") || 
        errorMsg.toLowerCase().includes("cancel") || 
        errorMsg.toLowerCase().includes("declined") || 
        errorMsg.toLowerCase().includes("dismiss")
      ) {
        addLog("Signature rejected: User declined the signing request in their wallet.");
        toast.error("Signature Declined", "You cancelled the signing request in your wallet.");
        setContractStatus("Failed");
        return;
      }

      // Error Type 3: Simulation or execution failure
      addLog(`Soroban call failed: ${errorMsg}`);
      toast.error("Invocation Failed", `The transaction could not be executed: ${errorMsg.slice(0, 80)}`);
      setContractStatus("Failed");
    }
  };

  // Real-time Event Polling (Listener)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening && counterContractId) {
      addLog("Starting background real-time event listener polling...");
      readContractValue();
      pollContractEvents();
      interval = setInterval(() => {
        readContractValue();
        pollContractEvents();
      }, 5000);
    } else {
      addLog("Event listener paused.");
    }
    return () => clearInterval(interval);
  }, [isListening, counterContractId, vaultContractId, selectedContract]);

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

        {/* Soroban Smart Contract Module */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" />
              Soroban Smart Contract (Orange Belt)
            </h3>
            <span className="flex items-center gap-1.5 text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
              <Radio className={`h-3 w-3 ${isListening ? "text-emerald-500 animate-pulse" : "text-slate-500"}`} />
              Event Listener: {isListening ? "ACTIVE" : "PAUSED"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Toggle selection */}
            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 gap-2">
              <button
                type="button"
                onClick={() => setSelectedContract("counter")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 ${
                  selectedContract === "counter"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Direct Counter Call
              </button>
              <button
                type="button"
                onClick={() => setSelectedContract("vault")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 ${
                  selectedContract === "vault"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Vault Inter-Contract Call
              </button>
            </div>

            {selectedContract === "counter" ? (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Counter Contract ID</label>
                <Input
                  value={counterContractId}
                  onChange={(e) => setCounterContractId(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Vault Contract ID</label>
                  <Input
                    value={vaultContractId}
                    onChange={(e) => setVaultContractId(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Counter Contract ID (Target)</label>
                  <Input
                    value={counterContractId}
                    onChange={(e) => setCounterContractId(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Counter status */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
                <span className="text-xs text-slate-400">Counter Value</span>
                <div className="my-2 flex items-baseline">
                  <span className="text-3xl font-extrabold text-white">
                    {contractLoading ? "..." : contractCounter !== null ? contractCounter : "--"}
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={readContractValue} disabled={contractLoading} className="w-full text-xs">
                  Read Contract State
                </Button>
              </div>

              {/* Call increment */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">State Modifier (Write)</span>
                  <p className="text-[10px] text-slate-500">
                    {selectedContract === "counter" 
                      ? "Invokes the on-chain increment function directly." 
                      : "Invokes deposit_and_increment on Vault, making a cross-contract call to Counter."}
                  </p>
                </div>
                <Button size="sm" variant="glow" onClick={incrementContractValue} disabled={contractStatus !== "Idle" && contractStatus !== "Success" && contractStatus !== "Failed"} className="w-full mt-3">
                  {contractStatus === "Idle" || contractStatus === "Success" || contractStatus === "Failed"
                    ? (selectedContract === "counter" ? "Invoke Increment" : "Invoke Deposit & Inc")
                    : contractStatus}
                </Button>
              </div>

              {/* Status and events */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Invocations Status</span>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${
                    contractStatus === "Success" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" :
                    contractStatus === "Failed" ? "bg-rose-950/40 text-rose-400 border border-rose-900/30" :
                    contractStatus !== "Idle" ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 animate-pulse" :
                    "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}>
                    {contractStatus}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={isListening ? "outline" : "success"}
                  onClick={() => setIsListening(!isListening)}
                  className="w-full mt-3 text-xs"
                >
                  {isListening ? "Stop Listener" : "Start Live Listener"}
                </Button>
              </div>
            </div>

            {/* Event notifications activity feed */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col h-[160px] mt-4">
              <span className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider block">
                On-Chain Event Notifications
              </span>
              <div className="flex-1 bg-slate-950 border border-slate-900 rounded-lg p-2.5 overflow-y-auto font-mono text-[9px] text-indigo-300 space-y-1">
                {contractEvents.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-6">No contract events polled. Try invoking or start listener.</div>
                ) : (
                  contractEvents.map((ev, i) => (
                    <div key={i} className="leading-relaxed border-b border-slate-900/50 pb-1 flex items-center justify-between">
                      <span>{ev}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {contractTxHash && (
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl space-y-1">
                <span className="text-[10px] text-indigo-400 font-semibold block">Invoke Confirmation</span>
                <code className="text-[9px] text-slate-300 break-all block p-1.5 bg-slate-950 rounded font-mono">
                  {contractTxHash}
                </code>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${contractTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold block mt-1"
                >
                  View invoke receipt on explorer ➔
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local keypair sandbox fallback (White Belt testing) */}
      <div className="space-y-6">
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
