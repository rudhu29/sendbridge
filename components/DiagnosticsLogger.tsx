import React from "react";
import { Terminal } from "lucide-react";

interface DiagnosticsLoggerProps {
  logs: string[];
}

export default function DiagnosticsLogger({ logs }: DiagnosticsLoggerProps) {
  return (
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
  );
}
