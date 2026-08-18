import React from "react";
import { Shield, UserCheck, CheckCircle2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface KycVerificationProps {
  kycStatus: "Unverified" | "Checking" | "Pending" | "Verified";
  kycForm: { fullName: string; email: string; country: string; idNumber: string };
  setKycForm: (form: any) => void;
  kycLoading: boolean;
  walletAddress: string;
  submitSimulatedKyc: (e: React.FormEvent) => void;
}

export default function KycVerification({
  kycStatus,
  kycForm,
  setKycForm,
  kycLoading,
  walletAddress,
  submitSimulatedKyc,
}: KycVerificationProps) {
  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          kycStatus === "Verified" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" :
          kycStatus === "Checking" ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 animate-pulse" :
          "bg-rose-950/40 text-rose-400 border border-rose-900/30"
        }`}>
          <Shield className="h-3 w-3" />
          KYC Gating: {kycStatus.toUpperCase()}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-indigo-400" />
        Step 1: Compliance Onboarding (SEP-12)
      </h3>
      <p className="text-xs text-slate-400 mt-1 max-w-xl">
        On-chain compliance gating requires remittance senders to be whitelisted on-ledger before executing funds routing.
      </p>

      {kycStatus !== "Verified" ? (
        <form onSubmit={submitSimulatedKyc} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900/60 pt-6">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Sender Full Name</label>
            <Input
              placeholder="e.g. Rudra Sharma"
              value={kycForm.fullName}
              onChange={(e) => setKycForm({...kycForm, fullName: e.target.value})}
              className="bg-slate-950/80 border-slate-900 text-xs text-slate-200"
              required
              disabled={kycLoading || !walletAddress}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Corridor/Country</label>
            <select
              value={kycForm.country}
              onChange={(e) => setKycForm({...kycForm, country: e.target.value})}
              className="w-full bg-slate-950/80 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={kycLoading || !walletAddress}
            >
              <option value="India">India Corridor</option>
              <option value="Europe">Europe Corridor</option>
              <option value="Philippines">Philippines Corridor</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">National ID Number</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. ID-49382-X"
                value={kycForm.idNumber}
                onChange={(e) => setKycForm({...kycForm, idNumber: e.target.value})}
                className="bg-slate-950/80 border-slate-900 text-xs text-slate-200"
                required
                disabled={kycLoading || !walletAddress}
              />
              <Button type="submit" variant="glow" size="sm" disabled={kycLoading || !walletAddress}>
                {kycLoading ? "Whitelisting..." : "Submit KYC"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 p-4 rounded-xl border border-emerald-900/20 bg-emerald-950/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950/30 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Identity Verification Complete</span>
              <span className="text-[10px] text-slate-400">Wallet address whitelisted on-chain. Gated transfers unlocked.</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/30 px-2.5 py-1 rounded-lg">
            Soroban OK
          </span>
        </div>
      )}
    </div>
  );
}
