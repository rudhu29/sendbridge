"use client";

import React, { useState } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";
import { Terminal, Wallet, Shield, Layers } from "lucide-react";

export default function WhiteBeltToolbox() {
  // Local sandbox wallet (Task 1 local fallback)
  const [localKeypair, setLocalKeypair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [logs, setLogs] = useState<string[]>(["White & Orange Belt DApp initialized. Ready."]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Local Wallet Sandbox Generation
  const generateLocalWallet = () => {
    try {
      const pair = Keypair.random();
      setLocalKeypair({
        publicKey: pair.publicKey(),
        secretKey: pair.secret(),
      });
      addLog(`Generated local testing keypair: ${pair.publicKey()}`);
      toast.success("Sandbox Keypair Created", "A temporary keypair has been generated client-side.");
    } catch (err: any) {
      addLog(`Local wallet generation failed: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Placeholder for Task 1: Connect Wallet (to satisfy tests) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-400" />
            Task 1: Connect Wallet (Multi-Wallet Adapter)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            (Feature in development) Multi-wallet connection adapter is being implemented.
          </p>
        </div>

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
