import React from "react";
import { Send, TrendingUp, CheckSquare } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface RemittanceFormProps {
  remitRecipient: string;
  setRemitRecipient: (val: string) => void;
  remitCorridor: "INR" | "EUR" | "PHP";
  setRemitCorridor: (val: "INR" | "EUR" | "PHP") => void;
  remitAmount: string;
  setRemitAmount: (val: string) => void;
  getCorridorExchangeRate: () => number;
  isSponsored: boolean;
  setIsSponsored: (val: boolean) => void;
  remitLoading: boolean;
  remitStatusText: string;
  remitTxHash: string | null;
  kycStatus: string;
  walletAddress: string;
  executeRemittance: (e: React.FormEvent) => void;
}

export default function RemittanceForm({
  remitRecipient,
  setRemitRecipient,
  remitCorridor,
  setRemitCorridor,
  remitAmount,
  setRemitAmount,
  getCorridorExchangeRate,
  isSponsored,
  setIsSponsored,
  remitLoading,
  remitStatusText,
  remitTxHash,
  kycStatus,
  walletAddress,
  executeRemittance,
}: RemittanceFormProps) {
  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
        <Send className="h-5 w-5 text-purple-400" />
        Step 2: Instant Corridor Remittance Payout
      </h3>
      <p className="text-xs text-slate-400 max-w-xl mb-6">
        Send XLM native assets across borders with real-time conversion rates. Smart contracts record audit logs.
      </p>

      <form onSubmit={executeRemittance} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Recipient Public Key Address (G...)</label>
            <Input
              placeholder="e.g. GB2... recipient account on Stellar"
              value={remitRecipient}
              onChange={(e) => setRemitRecipient(e.target.value)}
              className="bg-slate-950/80 border-slate-900 text-xs text-slate-200"
              required
              disabled={remitLoading || kycStatus !== "Verified"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Corridor Payout</label>
            <select
              value={remitCorridor}
              onChange={(e) => setRemitCorridor(e.target.value as any)}
              className="w-full bg-slate-950/80 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={remitLoading || kycStatus !== "Verified"}
            >
              <option value="INR">India Corridor (INR)</option>
              <option value="EUR">Europe Corridor (EUR)</option>
              <option value="PHP">Philippines Corridor (PHP)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Transfer Amount (XLM)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.0"
              value={remitAmount}
              onChange={(e) => setRemitAmount(e.target.value)}
              className="bg-slate-950/80 border-slate-900 text-xs text-slate-200 font-black"
              required
              disabled={remitLoading || kycStatus !== "Verified"}
            />
          </div>

          {/* Calculator preview & cost optimizer */}
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-950 flex flex-col justify-between">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>EXCHANGE RATE</span>
              <span>CONVERTED PAYOUT</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-indigo-400 font-bold">1 XLM = {getCorridorExchangeRate().toFixed(2)} {remitCorridor}</span>
              <span className="text-xl font-black text-white">
                {remitAmount ? (parseFloat(remitAmount) * getCorridorExchangeRate()).toFixed(2) : "0.00"}{" "}
                <span className="text-xs text-slate-400 font-bold">{remitCorridor}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Level 5 Gas Optimizer comparison widget */}
        {remitAmount && (
          <div className="p-3.5 rounded-xl border border-indigo-900/20 bg-indigo-950/5 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              <div>
                <span className="text-slate-300 font-bold block">Paisa Fee Optimizer</span>
                <span className="text-slate-500">Traditional Wire: $15.00 | Soroban: &lt;$0.0001 (0.0001 XLM)</span>
              </div>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/20">
              Saves 99.9%
            </span>
          </div>
        )}

        {/* Level 6 Fee Sponsorship Advanced Feature toggle */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-900 bg-slate-950/60 mt-2">
          <input
            type="checkbox"
            id="fee-sponsor-checkbox"
            checked={isSponsored}
            onChange={(e) => {
              setIsSponsored(e.target.checked);
            }}
            disabled={remitLoading || kycStatus !== "Verified"}
            className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 accent-indigo-600 cursor-pointer"
          />
          <label htmlFor="fee-sponsor-checkbox" className="text-xs text-slate-300 font-bold select-none cursor-pointer flex items-center gap-1">
            🚀 Enable Gasless Transfer (Fee Sponsored by Paisa Admin)
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-slate-900/60 pt-6 mt-4 gap-4">
          <div className="text-[10px] text-slate-500 max-w-md">
            By submitting, the remittance contract will verify your KYC whitelist status, apply conversion rate parameters, transfer XLM, and publish an audit event.
          </div>
          
          <Button
            type="submit"
            variant="glow"
            disabled={remitLoading || kycStatus !== "Verified" || !walletAddress}
            className="px-8"
          >
            {remitLoading ? remitStatusText : "Submit Remittance"}
          </Button>
        </div>
      </form>

      {remitTxHash && (
        <div className="mt-6 p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <CheckSquare className="h-4 w-4" />
            On-Chain Remittance Approved
          </div>
          <code className="text-[9px] text-slate-300 break-all block p-2 bg-slate-950 rounded border border-slate-900 font-mono">
            {remitTxHash}
          </code>
          <div className="flex items-center justify-between pt-1">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${remitTxHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold block"
            >
              View on Stellar Expert explorer ➔
            </a>
            <span className="text-[9px] text-slate-500 font-medium">Audit logs finalized</span>
          </div>
        </div>
      )}
    </div>
  );
}
