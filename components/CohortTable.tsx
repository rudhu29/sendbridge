import React from "react";
import { Users, Download, Search, Filter, ArrowUpRight, CalendarDays, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { OnboardedUser } from "./types";

interface CohortTableProps {
  downloadCohortCsv: () => void;
  cohortSearch: string;
  setCohortSearch: (val: string) => void;
  cohortFilter: string;
  setCohortFilter: (val: string) => void;
  cohortMonthFilter: string;
  setCohortMonthFilter: (val: string) => void;
  cohortPage: number;
  setCohortPage: React.Dispatch<React.SetStateAction<number>>;
  filteredCohort: OnboardedUser[];
  displayedCohort: OnboardedUser[];
  totalCohortPages: number;
  network: "testnet" | "mainnet";
  unfilteredCohort: OnboardedUser[];
}

export default function CohortTable({
  downloadCohortCsv,
  cohortSearch,
  setCohortSearch,
  cohortFilter,
  setCohortFilter,
  cohortMonthFilter,
  setCohortMonthFilter,
  cohortPage,
  setCohortPage,
  filteredCohort,
  displayedCohort,
  totalCohortPages,
  network,
  unfilteredCohort,
}: CohortTableProps) {
  
  // Calculate signup metrics by month dynamically from the active cohort
  const monthlyStats = React.useMemo(() => {
    const monthsList = [
      { key: "01", name: "Jan" },
      { key: "02", name: "Feb" },
      { key: "03", name: "Mar" },
      { key: "04", name: "Apr" },
      { key: "05", name: "May" },
      { key: "06", name: "Jun" },
      { key: "07", name: "Jul" },
      { key: "08", name: "Aug" }
    ];
    
    return monthsList.map(m => {
      const count = unfilteredCohort.filter(u => u.dateOnboarded.includes(`-${m.key}-`)).length;
      return { ...m, count };
    });
  }, [unfilteredCohort]);

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

      {/* Premium Onboarding Trends stats bar */}
      <div className="p-3 bg-slate-950/60 border border-slate-900/60 rounded-xl">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
          Monthly Cohort Signup Registration Trends (2026)
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {monthlyStats.map(m => (
            <div key={m.key} className="bg-slate-950 border border-slate-900/80 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-500 font-medium block">{m.name}</span>
              <span className="text-xs font-bold text-indigo-400 mt-0.5 block">{m.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-slate-900/60 pt-4">
        <div className="relative col-span-1 sm:col-span-2">
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
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
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

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500 shrink-0" />
          <select
            value={cohortMonthFilter}
            onChange={(e) => {
              setCohortMonthFilter(e.target.value);
              setCohortPage(0);
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-9"
          >
            <option value="All">All Months</option>
            <option value="01">January (Jan 2026)</option>
            <option value="02">February (Feb 2026)</option>
            <option value="03">March (Mar 2026)</option>
            <option value="04">April (Apr 2026)</option>
            <option value="05">May (May 2026)</option>
            <option value="06">June (Jun 2026)</option>
            <option value="07">July (Jul 2026)</option>
            <option value="08">August (Aug 2026)</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase px-1">
        <span>Active Filters: {cohortFilter === "All" ? "All Corridors" : cohortFilter} | {cohortMonthFilter === "All" ? "All Months" : `Month ${cohortMonthFilter}`}</span>
        <span>Found: {filteredCohort.length} Users</span>
      </div>

      <div className="overflow-x-auto border border-slate-900 rounded-xl">
        <table className="min-w-full divide-y divide-slate-900 text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-4 py-3">User Details</th>
              <th className="px-4 py-3">Corridor</th>
              <th className="px-4 py-3">Stellar Address</th>
              <th className="px-4 py-3">Date Onboarded</th>
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
                  <td className="px-4 py-3 text-[10px] text-slate-400">
                    {user.dateOnboarded}
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
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500 italic">
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
