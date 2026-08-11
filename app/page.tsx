"use client";

import React from "react";
import WhiteBeltToolbox from "@/components/whitebelt-toolbox";
import { Award, Compass, Github, ShieldCheck, Heart } from "lucide-react";

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      {/* Header Block */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 text-xs font-bold tracking-wide uppercase mb-4 animate-pulse">
          <Award className="h-4 w-4" />
          Stellar Journey to Mastery: Level 4 Green Belt
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-gradient-to-r from-indigo-100 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
          Paisa Remittance Hub
        </h1>
        <p className="mt-3 max-w-md text-base text-slate-400 sm:text-lg md:mt-5 md:max-w-2xl">
          A production-ready cross-border remittance MVP. Onboard users securely with simulated on-chain KYC, query live conversion rates, and send instant payments on Stellar Testnet.
        </p>
      </div>

      {/* Main Toolbox Section */}
      <div className="mt-8">
        <WhiteBeltToolbox />
      </div>

      {/* Checklist and Guide Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-900 pt-12">
        <div className="rounded-2xl border border-slate-900 bg-slate-950/20 p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            Remittance MVP Specifications
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            This project fulfills all criteria for the Stellar Green Belt (Level 4) submission without breaking Level 1-3 requirements.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <strong>Production MVP:</strong> Responsive layout, robust loading states, and exception handling.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <strong>KYC Gating:</strong> Simulated SEP-12 whitelisting saved as on-chain state in Soroban.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <strong>Onboarding Proofs:</strong> Records and explorer links for 10+ active wallet cohorts.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <strong>Diagnostics & Feedback:</strong> SLA monitoring, live event poller, and feedback slider widget.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-950/20 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Compass className="h-5 w-5 text-purple-400" />
              Stellar Explorer Links
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Explore your newly created transactions and balances live on the blockchain network.
            </p>
            <div className="space-y-2">
              <a
                href="https://stellar.expert/explorer/testnet/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 block hover:underline"
              >
                ➔ Stellar Expert Explorer (Testnet)
              </a>
              <a
                href="https://horizon-testnet.stellar.org/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 block hover:underline"
              >
                ➔ Horizon Testnet API Root
              </a>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-900/60 pt-4 mt-4 flex items-center justify-between">
            <span>Stellar Mastery Journey © 2026</span>
            <span className="flex items-center gap-1">
              <Github className="h-3 w-3" />
              rudhu29/sendbridge
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
