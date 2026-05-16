"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { createPortal } from "react-dom";

type CustomerResult = {
  id: string;
  name: string;
  phone: string | null;
  balance: number;
};

type TransactionResult = {
  id: string;
  amount: number;
  type: "CREDIT" | "PAYMENT";
  description: string;
  created_at: string;
  customer_name: string;
  customer_id: string;
};

type ExpenseResult = {
  id: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
};

type SearchResults = {
  customers: CustomerResult[];
  transactions: TransactionResult[];
  expenses: ExpenseResult[];
};

interface GlobalSearchOverlayProps {
  shopId: string;
  isOpen: boolean;
  onClose: () => void;
}

function GlobalSearchOverlay({ shopId, isOpen, onClose }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ customers: [], transactions: [], expenses: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults({ customers: [], transactions: [], expenses: [] });
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults({ customers: [], transactions: [], expenses: [] });
      return;
    }
    setIsLoading(true);

    const searchTerm = q.trim().toLowerCase();

    const [custRes, txRes, exRes] = await Promise.all([
      // Search customers by name or phone
      supabase
        .from("customers")
        .select("id, name, phone, balance")
        .eq("shop_id", shopId)
        .is("deleted_at", null)
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(5),

      // Search transactions by description or customer name
      supabase
        .from("transactions")
        .select("id, amount, type, description, created_at, customers!inner(id, name, deleted_at)")
        .eq("shop_id", shopId)
        .is("customers.deleted_at", null)
        .ilike("description", `%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(5),

      // Search expenses by category or description
      supabase
        .from("expenses")
        .select("id, amount, category, description, expense_date")
        .eq("shop_id", shopId)
        .or(`category.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("expense_date", { ascending: false })
        .limit(5),
    ]);

    const customers: CustomerResult[] = (custRes.data || []) as CustomerResult[];
    
    const transactions: TransactionResult[] = (txRes.data || []).map((tx: any) => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      created_at: tx.created_at,
      customer_name: tx.customers?.name || "Unknown",
      customer_id: tx.customers?.id || "",
    }));

    const expenses: ExpenseResult[] = (exRes.data || []) as ExpenseResult[];

    setResults({ customers, transactions, expenses });
    setIsLoading(false);
  }, [shopId]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const totalResults = results.customers.length + results.transactions.length + results.expenses.length;
  const hasQuery = query.trim().length >= 2;

  const formatDate = (str: string) => {
    const d = new Date(str);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q || !text) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.substring(0, idx)}
        <mark className="bg-primary/20 text-primary rounded px-0.5 not-italic font-bold">{text.substring(idx, idx + q.length)}</mark>
        {text.substring(idx + q.length)}
      </>
    );
  };

  if (!mounted) return null;

  const overlay = (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className={`absolute top-0 left-0 right-0 bg-surface rounded-b-[32px] shadow-2xl transition-all duration-300 ${isOpen ? "translate-y-0" : "-translate-y-full"}`}>
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-outline-variant/20">
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-on-surface-variant shrink-0 cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">{isLoading ? "progress_activity" : "search"}</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search customers, notes, expenses..."
              className="w-full pl-11 pr-10 py-3 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto px-4 py-4 space-y-5">
          
          {/* Initial hint */}
          {!hasQuery && (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-30 block mb-3">travel_explore</span>
              <p className="text-sm font-bold opacity-60">Search across everything</p>
              <p className="text-xs opacity-40 mt-1">customers · transactions · expenses</p>
            </div>
          )}

          {/* No results */}
          {hasQuery && !isLoading && totalResults === 0 && (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-30 block mb-3">search_off</span>
              <p className="text-sm font-bold opacity-60">No results for &quot;{query}&quot;</p>
              <p className="text-xs opacity-40 mt-1">Try a different search term.</p>
            </div>
          )}

          {/* Customer Results */}
          {results.customers.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 flex items-center gap-1.5 px-1">
                <span className="material-symbols-outlined text-[14px]">group</span>
                Customers
                <span className="bg-surface-container text-on-surface px-2 py-0.5 rounded-full text-[9px] ml-1">{results.customers.length}</span>
              </p>
              <div className="space-y-2">
                {results.customers.map(c => {
                  const balance = Number(c.balance);
                  const isDue = balance > 0;
                  const isAdvance = balance < 0;
                  return (
                    <Link
                      key={c.id}
                      href={`/customers/${c.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isDue ? "bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20" : isAdvance ? "bg-jama-success/10 text-jama-success border-jama-success/20" : "bg-surface-variant text-on-surface-variant border-outline-variant/30"}`}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{highlightMatch(c.name, query)}</p>
                          {c.phone && <p className="text-[11px] text-on-surface-variant">{c.phone}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-base ${isDue ? "text-udhar-destructive" : isAdvance ? "text-jama-success" : "text-on-surface-variant"}`}>
                          ₹{Math.abs(balance).toLocaleString("en-IN")}
                        </p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isDue ? "text-udhar-destructive" : isAdvance ? "text-jama-success" : "text-on-surface-variant"}`}>
                          {isDue ? "Due" : isAdvance ? "Advance" : "Settled"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transaction Results */}
          {results.transactions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 flex items-center gap-1.5 px-1">
                <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                Transactions
                <span className="bg-surface-container text-on-surface px-2 py-0.5 rounded-full text-[9px] ml-1">{results.transactions.length}</span>
              </p>
              <div className="space-y-2">
                {results.transactions.map(tx => {
                  const isJama = tx.type === "PAYMENT";
                  return (
                    <Link
                      key={tx.id}
                      href={`/customers/${tx.customer_id}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${isJama ? "bg-jama-success/10 text-jama-success border-jama-success/20" : "bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20"}`}>
                          <span className="material-symbols-outlined text-[16px]">{isJama ? "south_west" : "north_east"}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-on-surface">{tx.customer_name}</p>
                          {tx.description && (
                            <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">{highlightMatch(tx.description, query)}</p>
                          )}
                          <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{formatDate(tx.created_at)}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-base shrink-0 ${isJama ? "text-jama-success" : "text-udhar-destructive"}`}>
                        {isJama ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expense Results */}
          {results.expenses.length > 0 && (
            <div className="pb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 flex items-center gap-1.5 px-1">
                <span className="material-symbols-outlined text-[14px]">receipt</span>
                Expenses
                <span className="bg-surface-container text-on-surface px-2 py-0.5 rounded-full text-[9px] ml-1">{results.expenses.length}</span>
              </p>
              <div className="space-y-2">
                {results.expenses.map(ex => (
                  <Link
                    key={ex.id}
                    href="/expenses"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{highlightMatch(ex.category || "Expense", query)}</p>
                        {ex.description && (
                          <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">{highlightMatch(ex.description, query)}</p>
                        )}
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{formatDate(ex.expense_date)}</p>
                      </div>
                    </div>
                    <div className="font-bold text-base text-amber-600 shrink-0">
                      -₹{Number(ex.amount).toLocaleString("en-IN")}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

// ─── Public wrapper component used by the header ───────────────────────────
export default function GlobalSearch({ shopId }: { shopId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 bg-surface-container-lowest shadow-sm border border-outline-variant/50 cursor-pointer text-on-surface-variant"
        title="Search"
        aria-label="Search"
      >
        <span className="material-symbols-outlined text-[20px]">search</span>
      </button>

      <GlobalSearchOverlay
        shopId={shopId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
