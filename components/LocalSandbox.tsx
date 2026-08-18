import React from "react";
import { 
  Wallet, RefreshCw, Send, CheckCircle2, Layers, Radio, Shield 
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LocalSandboxProps {
  walletAddress: string;
  walletBalance: string | null;
  walletType: string;
  walletLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  fetchWalletBalance: (addr: string) => void;
  sendXlm: (e: React.FormEvent) => void;
  recipient: string;
  setRecipient: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  sendLoading: boolean;
  sendTxHash: string | null;
  selectedContract: "counter" | "vault";
  setSelectedContract: (val: "counter" | "vault") => void;
  counterContractId: string;
  setCounterContractId: (val: string) => void;
  vaultContractId: string;
  setVaultContractId: (val: string) => void;
  contractCounter: number | null;
  contractStatus: string;
  contractLoading: boolean;
  contractTxHash: string | null;
  readContractValue: () => void;
  incrementContractValue: () => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  contractEvents: string[];
  localKeypair: { publicKey: string; secretKey: string } | null;
  localBalance: string | null;
  localLoading: boolean;
  localFundingLoading: boolean;
  generateLocalWallet: () => void;
  fetchLocalBalance: () => void;
  fundLocalWallet: () => void;
}

export default function LocalSandbox({
  walletAddress,
  walletBalance,
  walletType,
  walletLoading,
  connectWallet,
  disconnectWallet,
  fetchWalletBalance,
  sendXlm,
  recipient,
  setRecipient,
  amount,
  setAmount,
  sendLoading,
  sendTxHash,
  selectedContract,
  setSelectedContract,
  counterContractId,
  setCounterContractId,
  vaultContractId,
  setVaultContractId,
  contractCounter,
  contractStatus,
  contractLoading,
  contractTxHash,
  readContractValue,
  incrementContractValue,
  isListening,
  setIsListening,
  contractEvents,
  localKeypair,
  localBalance,
  localLoading,
  localFundingLoading,
  generateLocalWallet,
  fetchLocalBalance,
  fundLocalWallet,
}: LocalSandboxProps) {
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
                <Button variant="glow" onClick={connectWallet} disabled={walletLoading} className="text-xs">
                  {walletLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <Button variant="outline" onClick={disconnectWallet} className="text-xs">
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
                  Stellar Testnet ledger identity. Ensure connected wallet is set to Testnet.
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
              Soroban Smart Contract (Orange/Yellow Belt)
            </h3>
            <span className="flex items-center gap-1.5 text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
              <Radio className={`h-3 w-3 ${isListening ? "text-emerald-500 animate-pulse" : "text-slate-500"}`} />
              Event Listener: {isListening ? "ACTIVE" : "PAUSED"}
            </span>
          </div>

          <div className="space-y-4">
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
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={generateLocalWallet}>
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
                  <Button size="sm" variant="outline" onClick={fetchLocalBalance} disabled={localLoading} className="text-xs">
                    Refresh
                  </Button>
                  <Button size="sm" variant="glow" onClick={fundLocalWallet} disabled={localFundingLoading} className="text-xs">
                    Friendbot
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
