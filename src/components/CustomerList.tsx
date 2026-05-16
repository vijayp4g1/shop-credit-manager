"use client";

import Link from "next/link";
import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  balance: number;
}

interface CustomerListProps {
  customers: Customer[];
  totalOutstanding: number;
  totalAdvance: number;
}

export default function CustomerList({ customers, totalOutstanding, totalAdvance }: CustomerListProps) {
  const { searchQuery, filterTab, setSearchQuery, setFilterTab } = useAppStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam === "DUE" || filterParam === "ADVANCE" || filterParam === "SETTLED" || filterParam === "ALL") {
      setFilterTab(filterParam);
    }
  }, [searchParams, setFilterTab]);

  const fuzzyMatch = (str: string, query: string): boolean => {
    if (!query) return true;
    const s = str.toLowerCase();
    const q = query.toLowerCase();
    if (s.includes(q)) return true;

    let qIdx = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === q[qIdx]) {
        qIdx++;
        if (qIdx === q.length) return true;
      }
    }
    return false;
  };

  const filtered = customers.filter((c) => {
    const qStr = searchQuery.trim();
    const cleanQ = qStr.replace(/\D/g, "");
    
    let matchesSearch = true;
    if (qStr) {
      const matchName = fuzzyMatch(c.name, qStr);
      const matchPhone = c.phone ? fuzzyMatch(c.phone, cleanQ || qStr) : false;
      matchesSearch = matchName || matchPhone;
    }
    if (!matchesSearch) return false;

    if (filterTab === "DUE") return c.balance > 0;
    if (filterTab === "ADVANCE") return c.balance < 0;
    if (filterTab === "SETTLED") return c.balance === 0;
    return true;
  });

  return (
    <>
      <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
        <div className="relative group mb-4">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            id="customer-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-5 bg-surface/80 backdrop-blur-md border border-outline-variant/30 rounded-[24px] shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all duration-300 text-sm font-medium placeholder:text-on-surface-variant/50 outline-none"
            placeholder="Search by name or phone number..."
            type="text"
          />
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["ALL", "DUE", "ADVANCE", "SETTLED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 border ${
                filterTab === tab
                  ? tab === "DUE"
                    ? "bg-udhar-destructive text-white border-udhar-destructive shadow-md"
                    : tab === "ADVANCE"
                    ? "bg-jama-success text-white border-jama-success shadow-md"
                    : "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container"
              }`}
            >
              {tab === "ALL" && `All (${customers.length})`}
              {tab === "DUE" && `Due (${customers.filter(c => c.balance > 0).length})`}
              {tab === "ADVANCE" && `Advance (${customers.filter(c => c.balance < 0).length})`}
              {tab === "SETTLED" && `Settled (${customers.filter(c => c.balance === 0).length})`}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
        <button
          onClick={() => setFilterTab(filterTab === "DUE" ? "ALL" : "DUE")}
          className={`group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border p-5 rounded-[28px] shadow-sm flex flex-col justify-between h-32 transition-all duration-300 hover:shadow-md hover:border-udhar-destructive/50 hover:-translate-y-0.5 text-left cursor-pointer w-full ${
            filterTab === "DUE" ? "border-udhar-destructive ring-2 ring-udhar-destructive/20 bg-udhar-destructive/5" : "border-outline-variant/30"
          }`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-udhar-destructive/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
          <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10 w-full justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-udhar-destructive/10 flex items-center justify-center border border-udhar-destructive/20 shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px] text-udhar-destructive">account_balance_wallet</span>
              </div>
              <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-udhar-destructive">Udhar (Due)</span>
            </div>
            {filterTab === "DUE" && <span className="material-symbols-outlined text-udhar-destructive text-[16px]">check_circle</span>}
          </div>
          <div className="font-amount-display text-3xl font-bold text-udhar-destructive tracking-tight relative z-10">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
        </button>

        <button
          onClick={() => setFilterTab(filterTab === "ADVANCE" ? "ALL" : "ADVANCE")}
          className={`group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border p-5 rounded-[28px] shadow-sm flex flex-col justify-between h-32 transition-all duration-300 hover:shadow-md hover:border-jama-success/50 hover:-translate-y-0.5 text-left cursor-pointer w-full ${
            filterTab === "ADVANCE" ? "border-jama-success ring-2 ring-jama-success/20 bg-jama-success/5" : "border-outline-variant/30"
          }`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-jama-success/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
          <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10 w-full justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-jama-success/10 flex items-center justify-center border border-jama-success/20 shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px] text-jama-success">payments</span>
              </div>
              <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-jama-success">Jama (Advance)</span>
            </div>
            {filterTab === "ADVANCE" && <span className="material-symbols-outlined text-jama-success text-[16px]">check_circle</span>}
          </div>
          <div className="font-amount-display text-3xl font-bold text-jama-success tracking-tight relative z-10">
            ₹{totalAdvance.toLocaleString("en-IN")}
          </div>
        </button>
      </section>

      <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-5 px-2">
          <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">group</span>
            {searchQuery || filterTab !== "ALL" ? "Filtered Results" : "Customers"}
            <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full text-[10px] ml-1">
              {filtered.length}
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((c, index) => {
              const balance = Number(c.balance);
              const isDue = balance > 0;
              const isAdvance = balance < 0;
              const isSettled = balance === 0;
              const initials = c.name.substring(0, 2).toUpperCase();

              return (
                <Link
                  href={`/customers/${c.id}`}
                  key={c.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/20 border border-outline-variant/30 hover:border-outline-variant/60 rounded-[24px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer block"
                  style={{ animationDelay: `${200 + (index * 50)}ms` }}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-[3px] transition-transform duration-300 group-hover:scale-110 ${isDue ? 'bg-udhar-destructive/5 text-udhar-destructive border-udhar-destructive/20' : isAdvance ? 'bg-jama-success/5 text-jama-success border-jama-success/20' : 'bg-surface-variant/50 text-on-surface-variant border-outline-variant/30'}`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors">{c.name}</h3>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[14px] text-primary/70">call</span>
                        {c.phone ? c.phone : "No phone number"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end relative z-10">
                    {isDue && (
                      <>
                        <div className="font-amount-display text-[22px] font-bold tracking-tight text-udhar-destructive leading-none mb-1">
                          ₹{Math.abs(balance).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20">
                          Due
                        </div>
                      </>
                    )}
                    {isAdvance && (
                      <>
                        <div className="font-amount-display text-[22px] font-bold tracking-tight text-jama-success leading-none mb-1">
                          ₹{Math.abs(balance).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border bg-jama-success/10 text-jama-success border-jama-success/20">
                          Advance
                        </div>
                      </>
                    )}
                    {isSettled && (
                      <>
                        <div className="font-amount-display text-[22px] font-bold tracking-tight text-on-surface-variant leading-none mb-1">₹0</div>
                        <div className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border bg-surface-variant/50 text-on-surface-variant border-outline-variant/30">
                          Settled
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] border-dashed shadow-sm">
              <div className="w-20 h-20 bg-surface-container/50 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-40">
                  {searchQuery || filterTab !== "ALL" ? "search_off" : "person_off"}
                </span>
              </div>
              <p className="font-semibold text-on-surface text-base mb-1">
                {searchQuery || filterTab !== "ALL" ? "No customers match your filter" : "No customers found"}
              </p>
              <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">
                {searchQuery || filterTab !== "ALL" ? "Try changing your search or filter tab." : "Add your first customer to get started."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
