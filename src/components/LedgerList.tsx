"use client";

import { useState, useMemo } from "react";
import DeleteTransactionButton from "./DeleteTransactionButton";
import EditTransactionSheet from "./EditTransactionSheet";

type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  type: "CREDIT" | "PAYMENT";
  payment_mode: string;
  description: string;
  customers: { name: string; deleted_at: string | null } | { name: string; deleted_at: string | null }[] | null;
};

// Helper to extract name from either scalar or array join
function getCustomerName(customers: Transaction["customers"]): string {
  if (!customers) return "Unknown Customer";
  if (Array.isArray(customers)) return customers[0]?.name || "Unknown Customer";
  return customers.name || "Unknown Customer";
}

export default function LedgerList({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [filterType, setFilterType] = useState<"ALL" | "UDHAR" | "JAMA">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper for formatting dates and times
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = isToday ? 'Today' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return { dateString, timeString };
  };

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((tx) => {
      // Type Filter
      if (filterType === "UDHAR" && tx.type !== "CREDIT") return false;
      if (filterType === "JAMA" && tx.type !== "PAYMENT") return false;

      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const custName = getCustomerName(tx.customers).toLowerCase();
        const desc = tx.description?.toLowerCase() || "";
        if (!custName.includes(query) && !desc.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [initialTransactions, filterType, searchQuery]);

  return (
    <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
      
      {/* Filters & Search */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer or notes..."
            className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-2xl shadow-sm focus:outline-none focus:border-primary transition-all text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/50"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 px-1">
          <button
            onClick={() => setFilterType("ALL")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer shadow-sm ${
              filterType === "ALL" 
                ? "bg-primary text-on-primary" 
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("UDHAR")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer shadow-sm flex justify-center items-center gap-1 ${
              filterType === "UDHAR" 
                ? "bg-udhar-destructive text-white border-transparent" 
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
             Udhar
          </button>
          <button
            onClick={() => setFilterType("JAMA")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer shadow-sm flex justify-center items-center gap-1 ${
              filterType === "JAMA" 
                ? "bg-jama-success text-white border-transparent" 
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
             Jama
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 px-2">
        <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          {filterType === "ALL" ? "All Transactions" : filterType === "UDHAR" ? "Udhar Given" : "Jama Received"}
          <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full text-[10px] ml-1">
            {filteredTransactions.length}
          </span>
        </h2>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-outline-variant/30 before:via-outline-variant/20 before:to-transparent">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx, index) => {
            const isJama = tx.type === 'PAYMENT';
            const customerName = getCustomerName(tx.customers);
            const { dateString, timeString } = formatDateTime(tx.created_at);

            return (
              <div 
                key={tx.id} 
                className="relative flex items-start gap-4 group"
                style={{ animationDelay: `${200 + (index * 50)}ms` }}
              >
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 mt-2 rounded-full border-[3px] border-surface bg-surface-container-lowest shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${isJama ? 'text-jama-success border-jama-success/20' : 'text-udhar-destructive border-udhar-destructive/20'}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {isJama ? "south_west" : "north_east"}
                    </span>
                </div>

                <div className="flex-1 min-w-0 bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[24px] p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-outline-variant/50 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                        <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-0.5">{customerName}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {dateString} • {timeString}
                        </div>
                        {tx.description ? (
                          <div className="text-sm font-medium text-on-surface line-clamp-2 mt-1">
                            {tx.description}
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-on-surface mt-1 italic opacity-50">
                            No description
                          </div>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-bold text-lg tracking-tight ${isJama ? 'text-jama-success' : 'text-udhar-destructive'}`}>
                        {isJama ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border mt-1.5 inline-block ${isJama ? 'bg-jama-success/10 text-jama-success border-jama-success/20' : 'bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20'}`}>
                        {isJama ? 'Jama' : 'Udhar'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/10">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                      <span className="material-symbols-outlined text-[14px]">
                        {tx.payment_mode === "UPI" ? "qr_code_scanner" : tx.payment_mode === "CASH" ? "payments" : "credit_card"}
                      </span>
                      {tx.payment_mode || "CASH"}
                    </div>
                    <div className="flex items-center gap-1 opacity-100 transition-opacity">
                      <EditTransactionSheet
                        transactionId={tx.id}
                        customerName={customerName}
                        type={tx.type}
                        amount={Number(tx.amount)}
                        paymentMode={tx.payment_mode}
                        description={tx.description}
                      />
                      <DeleteTransactionButton
                        transactionId={tx.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] border-dashed shadow-sm ml-6">
            <div className="w-20 h-20 bg-surface-container/50 mx-auto rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-40">search_off</span>
            </div>
            <p className="font-semibold text-on-surface text-base mb-1">No matches found</p>
            <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </section>
  );
}
