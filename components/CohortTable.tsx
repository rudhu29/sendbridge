import React from "react";
import { Users, Download, Search, Filter, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { OnboardedUser } from "./types";

interface CohortTableProps {
  downloadCohortCsv: () => void;
  cohortSearch: string;
  setCohortSearch: (val: string) => void;
  cohortFilter: string;
  setCohortFilter: (val: string) => void;
  cohortPage: number;
  setCohortPage: React.Dispatch<React.SetStateAction<number>>;
  filteredCohort: OnboardedUser[];
  displayedCohort: OnboardedUser[];
  totalCohortPages: number;
  network: "testnet" | "mainnet";
}

export default function CohortTable({
  downloadCohortCsv,
  cohortSearch,
  setCohortSearch,
  cohortFilter,
  setCohortFilter,
  cohortPage,
  setCohortPage,
  filteredCohort,
  displayedCohort,
  totalCohortPages,
  network,
}: CohortTableProps) {
  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Onboarded Cohorts & Verification Registry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Exported dataset of active diaspora corridor participants ({network === "testnet" ? "50+" : "20+"} users).
          </p>
        </div>
        
        <Button size="sm" variant="outline" onClick={downloadCohortCsv} className="self-start sm:self-auto text-xs gap-1.5">
          <Download className="h-4 w-4" />
          Download CSV Data
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-900/60 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search by name, email, address..."
            value={cohortSearch}
            onChange={(e) => {
              setCohortSearch(e.target.value);
              setCohortPage(0);
            }}
            className="pl-9 bg-slate-950 border-slate-900 text-xs text-slate-300 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={cohortFilter}
            onChange={(e) => {
              setCohortFilter(e.target.value);
              setCohortPage(0);
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-9"
          >
            <option value="All">All Corridors</option>
            <option value="INR">India Corridor (INR)</option>
            <option value="EUR">Europe Corridor (EUR)</option>
            <option value="PHP">Philippines Corridor (PHP)</option>
          </select>
        </div>
        
        <div className="flex items-center justify-end text-[10px] text-slate-500 font-bold uppercase">
          <span>Found: {filteredCohort.length} Users</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-900 rounded-xl">
        <table className="min-w-full divide-y divide-slate-900 text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-4 py-3">User Details</th>
              <th className="px-4 py-3">Corridor</th>
              <th className="px-4 py-3">Stellar Address</th>
              <th className="px-4 py-3 text-center">UX / Speed / Fee</th>
              <th className="px-4 py-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 bg-slate-950/20">
            {displayedCohort.length > 0 ? (
              displayedCohort.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-900/20">
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{user.name}</span>
                    <span className="text-[10px] text-slate-500 block">{user.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[9px] font-medium">
                      {user.corridor}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                    {user.address.slice(0, 10)}...{user.address.slice(-6)}
                  </td>
                  <td className="px-4 py-3 text-center text-yellow-400 font-bold">
                    ★ {user.uiRating}/{user.speedRating}/{user.costRating}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={network === "testnet" ? `https://stellar.expert/explorer/testnet/tx/${user.txHash}` : `https://stellar.expert/explorer/public/tx/${user.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      TX Link <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500 italic">
                  No cohort users match the current search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      {totalCohortPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-900/60 pt-4">
          <span className="text-[10px] text-slate-500">
            Page {cohortPage + 1} of {totalCohortPages}
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" variant="ghost" 
              onClick={() => setCohortPage(prev => Math.max(0, prev - 1))}
              disabled={cohortPage === 0}
              className="text-xs"
            >
              Previous
            </Button>
            <Button 
              size="sm" variant="ghost" 
              onClick={() => setCohortPage(prev => Math.min(totalCohortPages - 1, prev + 1))}
              disabled={cohortPage === totalCohortPages - 1}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
