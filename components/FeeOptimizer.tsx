import React from "react";
import { TrendingUp } from "lucide-react";

interface FeeOptimizerProps {
  remitAmount: string;
  isSponsored?: boolean;
}

export default function FeeOptimizer({ remitAmount, isSponsored = false }: FeeOptimizerProps) {
  if (!remitAmount) return null;

  return (
    <div className="p-3.5 rounded-xl border border-indigo-900/20 bg-indigo-950/5 flex items-center justify-between text-[10px]">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
        <div>
          <span className="text-slate-300 font-bold block">Paisa Fee Optimizer</span>
          <span className="text-slate-500">
            Traditional Wire: $15.00 | Soroban: {isSponsored ? "FREE (Sponsored)" : "<$0.0001 (0.0001 XLM)"}
          </span>
        </div>
      </div>
      <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/20">
        {isSponsored ? "Saves 100%" : "Saves 99.9%"}
      </span>
    </div>
  );
}
