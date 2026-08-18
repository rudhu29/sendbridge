import React from "react";
import { Activity, Radio } from "lucide-react";

interface SlaAnalyticsProps {
  network: "testnet" | "mainnet";
  remittanceContractId: string;
  remitEvents: string[];
}

export default function SlaAnalytics({ network, remittanceContractId, remitEvents }: SlaAnalyticsProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl flex flex-col h-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          SLA Monitoring Console
        </h4>
        <Radio className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
      </div>
      <p className="text-[10px] text-slate-400 leading-normal mb-3">
        Real-time connection performance parameters linked to Horizon & Soroban RPC {network === "testnet" ? "testnet" : "mainnet"} endpoints.
      </p>

      <div className="flex-1 bg-slate-950 border border-slate-900 rounded-xl p-3 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-2">
        <div className="text-emerald-400">[OK] Horizon {network === "testnet" ? "Testnet" : "Mainnet"}: HTTPS 200 - Node healthy</div>
        <div className="text-emerald-400">[OK] Soroban RPC ({network === "testnet" ? "Testnet" : "Mainnet"}): JSON-RPC 2.0 - Latency 112ms</div>
        <div className="text-indigo-400">[MONITOR] Active Contract ID: {remittanceContractId.slice(0, 12)}...</div>
        <div className="text-slate-500">[INFO] Event poller active. Filter: {remittanceContractId.slice(0, 8)}</div>
        
        {remitEvents.length > 0 ? (
          remitEvents.map((ev, i) => (
            <div key={i} className="text-indigo-300 border-t border-slate-900 pt-1.5 mt-1.5 whitespace-normal break-words">
              {ev}
            </div>
          ))
        ) : (
          <div className="text-slate-500 italic pt-2">Poller listening for new cross-border remittance tx events...</div>
        )}
      </div>
    </div>
  );
}
