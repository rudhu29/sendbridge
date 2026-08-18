import React from "react";
import { Bell, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface RateAlertProps {
  alertCorridor: "INR" | "EUR" | "PHP";
  setAlertCorridor: (val: "INR" | "EUR" | "PHP") => void;
  alertThreshold: string;
  setAlertThreshold: (val: string) => void;
  handleAlertSubscribe: (e: React.FormEvent) => void;
  simulateMarketFluctuation: () => void;
  isAlertActive: boolean;
  alertLogs: string[];
}

export default function RateAlert({
  alertCorridor,
  setAlertCorridor,
  alertThreshold,
  setAlertThreshold,
  handleAlertSubscribe,
  simulateMarketFluctuation,
  isAlertActive,
  alertLogs,
}: RateAlertProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
        <Bell className="h-4.5 w-4.5 text-indigo-400 animate-bounce" />
        Remittance Rate Subscription
      </h4>
      <p className="text-[10px] text-slate-400 leading-normal mb-3">
        Configure rate alert thresholds. We simulate currency market checks client-side.
      </p>

      <form onSubmit={handleAlertSubscribe} className="space-y-2">
        <div className="flex gap-2">
          <select
            value={alertCorridor}
            onChange={(e) => setAlertCorridor(e.target.value as any)}
            className="bg-slate-950 border border-slate-900 rounded-xl px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
          >
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="PHP">PHP (₱)</option>
          </select>
          <Input 
            type="number" step="0.001"
            placeholder="Rate e.g. 8.55"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            className="bg-slate-950 border-slate-900 text-xs text-slate-200 h-8"
          />
          <Button type="submit" size="sm" variant="glow" className="h-8 text-xs">
            Alert Me
          </Button>
        </div>
      </form>

      {/* Fluctuate buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={simulateMarketFluctuation} className="text-[9px] py-1">
          <Sparkles className="h-3 w-3 mr-1" />
          Simulate Market
        </Button>
        <div className="text-[8px] text-slate-500 flex items-center justify-end font-mono">
          {isAlertActive ? "🔔 Active" : "🔕 Inactive"}
        </div>
      </div>

      {/* Alert Logs */}
      {alertLogs.length > 0 && (
        <div className="mt-3 p-2 bg-indigo-950/20 border border-indigo-900/30 rounded-lg max-h-[100px] overflow-y-auto font-mono text-[9px] text-indigo-300 space-y-1">
          {alertLogs.map((log, i) => (
            <div key={i} className="border-b border-indigo-900/10 pb-1">{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
