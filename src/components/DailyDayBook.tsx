"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import EditTransactionSheet from "./EditTransactionSheet";
import DeleteTransactionButton from "./DeleteTransactionButton";
import { formatDateIST, formatTimeIST, isTodayIST } from "@/lib";

// Define a unified ledger item type
type LedgerItem = {
  id: string;
  created_at: string;
  amount: number;
  payment_mode: string;
  description: string;
  
  // Transaction specific
  type?: "CREDIT" | "PAYMENT";
  customers?: { name: string; deleted_at: string | null } | null;
  
  // Expense specific
  category?: string;
  expense_date?: string;
  
  // Internal flag to differentiate
  isExpense: boolean;
};

export default function DailyDayBook({ shopId }: { shopId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Stable supabase client – created once per component mount
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchDailyData(selectedDate);
  }, [selectedDate, shopId]);

  const fetchDailyData = async (date: Date) => {
    setIsLoading(true);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [txResponse, exResponse] = await Promise.all([
      supabase
        .from("transactions")
        .select("*, customers!inner(name, deleted_at)")
        .eq("shop_id", shopId)
        .is("customers.deleted_at", null)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString()),
        
      supabase
        .from("expenses")
        .select("*")
        .eq("shop_id", shopId)
        .gte("expense_date", startOfDay.toISOString())
        .lte("expense_date", endOfDay.toISOString())
    ]);

    const txData = (txResponse.data || []).map(tx => ({ ...tx, isExpense: false } as LedgerItem));
    
    // For expenses, we sort by expense_date visually but we will unify the timestamp
    const exData = (exResponse.data || []).map(ex => ({ 
      ...ex, 
      isExpense: true,
      created_at: ex.expense_date // Use expense_date for unified sorting
    } as LedgerItem));

    const combined = [...txData, ...exData].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setItems(combined);
    setIsLoading(false);
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const isToday = isTodayIST(selectedDate);

  let totalJama = 0;
  let totalUdhar = 0;
  let totalExpense = 0;

  items.forEach(item => {
    if (item.isExpense) {
      totalExpense += Number(item.amount);
    } else {
      if (item.type === 'PAYMENT') totalJama += Number(item.amount);
      if (item.type === 'CREDIT') totalUdhar += Number(item.amount);
    }
  });

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      {/* Date Navigator */}
      <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-full p-2 shadow-sm">
        <button 
          onClick={handlePrevDay}
          className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="font-bold text-sm text-on-surface">
            {isToday ? "Today" : formatDateIST(selectedDate)}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            Day Book
          </span>
        </div>

        <button 
          onClick={handleNextDay}
          disabled={isToday}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isToday ? 'opacity-30 cursor-not-allowed text-on-surface-variant' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant cursor-pointer active:scale-95'}`}
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Daily Summary Cards */}
      <section className="grid grid-cols-3 gap-3">
        <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-4 rounded-[24px] shadow-sm flex flex-col justify-between h-[110px]">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-jama-success/10 rounded-full blur-[20px]"></div>
          <div className="flex items-center gap-2 text-on-surface-variant relative z-10">
            <div className="w-6 h-6 rounded-full bg-jama-success/10 flex items-center justify-center border border-jama-success/20">
              <span className="material-symbols-outlined text-[12px] text-jama-success">south_west</span>
            </div>
            <span className="font-label-lg text-[9px] font-bold uppercase tracking-widest text-jama-success leading-tight">Jama<br/>In</span>
          </div>
          <div className="font-amount-display text-xl font-bold text-jama-success tracking-tight relative z-10 truncate">
            {isLoading ? "..." : `₹${totalJama.toLocaleString('en-IN')}`}
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-4 rounded-[24px] shadow-sm flex flex-col justify-between h-[110px]">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-udhar-destructive/10 rounded-full blur-[20px]"></div>
          <div className="flex items-center gap-2 text-on-surface-variant relative z-10">
            <div className="w-6 h-6 rounded-full bg-udhar-destructive/10 flex items-center justify-center border border-udhar-destructive/20">
              <span className="material-symbols-outlined text-[12px] text-udhar-destructive">north_east</span>
            </div>
            <span className="font-label-lg text-[9px] font-bold uppercase tracking-widest text-udhar-destructive leading-tight">Udhar<br/>Out</span>
          </div>
          <div className="font-amount-display text-xl font-bold text-udhar-destructive tracking-tight relative z-10 truncate">
            {isLoading ? "..." : `₹${totalUdhar.toLocaleString('en-IN')}`}
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-4 rounded-[24px] shadow-sm flex flex-col justify-between h-[110px]">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-[20px]"></div>
          <div className="flex items-center gap-2 text-on-surface-variant relative z-10">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <span className="material-symbols-outlined text-[12px] text-amber-500">receipt_long</span>
            </div>
            <span className="font-label-lg text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 leading-tight">Shop<br/>Expense</span>
          </div>
          <div className="font-amount-display text-xl font-bold text-amber-600 dark:text-amber-400 tracking-tight relative z-10 truncate">
            {isLoading ? "..." : `₹${totalExpense.toLocaleString('en-IN')}`}
          </div>
        </div>
      </section>

      {/* Net Cash FLow */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Net Cash In Hand Today:</span>
        <span className={`font-amount-display text-lg font-bold tracking-tight ${totalJama - totalExpense >= 0 ? 'text-jama-success' : 'text-udhar-destructive'}`}>
          {totalJama - totalExpense >= 0 ? '+' : ''}₹{(totalJama - totalExpense).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Transactions List */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-outline-variant/30 before:via-outline-variant/20 before:to-transparent">
        {isLoading ? (
          <div className="text-center py-10 opacity-50 flex flex-col items-center">
            <span className="material-symbols-outlined animate-spin text-[32px] mb-2">progress_activity</span>
            <span className="text-sm font-bold uppercase tracking-widest">Loading Day Book...</span>
          </div>
        ) : items.length > 0 ? (
          items.map((item, index) => {
            const timeString = formatTimeIST(item.created_at, { hour: '2-digit', minute: '2-digit' });

            if (item.isExpense) {
              // Render Expense
              return (
                <div key={`exp_${item.id}`} className="relative flex items-start gap-4 group animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}>
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 mt-2 rounded-full border-[3px] border-surface bg-surface-container-lowest shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 text-amber-500 border-amber-500/20">
                      <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  </div>
                  <div className="flex-1 min-w-0 bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[24px] p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-outline-variant/50 hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                          <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-amber-500 transition-colors mb-0.5">{item.category || "General Expense"}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {timeString}
                          </div>
                          {item.description ? (
                            <div className="text-sm font-medium text-on-surface mt-1">{item.description}</div>
                          ) : (
                            <div className="text-sm font-medium text-on-surface mt-1 italic opacity-50">No notes</div>
                          )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-lg tracking-tight text-amber-600 dark:text-amber-400">
                          -₹{Number(item.amount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border mt-1.5 inline-block bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          Expense
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Render Transaction
            const isJama = item.type === 'PAYMENT';
            const custArr = Array.isArray(item.customers) ? item.customers : [item.customers];
            const customerName = custArr[0]?.name || 'Unknown Customer';

            return (
              <div key={`tx_${item.id}`} className="relative flex items-start gap-4 group animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}>
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
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {timeString}
                        </div>
                        {item.description ? (
                          <div className="text-sm font-medium text-on-surface line-clamp-2 mt-1">
                            {item.description}
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-on-surface mt-1 italic opacity-50">
                            No description
                          </div>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-bold text-lg tracking-tight ${isJama ? 'text-jama-success' : 'text-udhar-destructive'}`}>
                        {isJama ? '+' : '-'}₹{Number(item.amount).toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border mt-1.5 inline-block ${isJama ? 'bg-jama-success/10 text-jama-success border-jama-success/20' : 'bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20'}`}>
                        {isJama ? 'Jama' : 'Udhar'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/10">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                      <span className="material-symbols-outlined text-[14px]">
                        {item.payment_mode === "UPI" ? "qr_code_scanner" : item.payment_mode === "CASH" ? "payments" : "credit_card"}
                      </span>
                      {item.payment_mode || "CASH"}
                    </div>
                    <div className="flex items-center gap-1 opacity-100 transition-opacity">
                      <EditTransactionSheet
                        transactionId={item.id}
                        customerName={customerName}
                        type={item.type!}
                        amount={Number(item.amount)}
                        paymentMode={item.payment_mode}
                        description={item.description}
                      />
                      <DeleteTransactionButton transactionId={item.id} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] border-dashed shadow-sm ml-6">
            <div className="w-20 h-20 bg-surface-container/50 mx-auto rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-40">today</span>
            </div>
            <p className="font-semibold text-on-surface text-base mb-1">No activity</p>
            <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">No transactions or expenses recorded on this date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
