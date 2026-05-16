"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AddTransactionSheet({ 
  customerId, 
  shopId, 
  customerName,
  type,
  balance
}: { 
  customerId: string; 
  shopId: string; 
  customerName: string;
  type: "CREDIT" | "PAYMENT" | null;
  balance?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuick, setIsLoadingQuick] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quickErrorMessage, setQuickErrorMessage] = useState("");
  const [showExcessConfirmModal, setShowExcessConfirmModal] = useState(false);
  const [transactionType, setTransactionType] = useState<"CREDIT" | "PAYMENT">(type || "CREDIT");
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  const getLocalISO = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleOpen = (t: "CREDIT" | "PAYMENT") => {
    setErrorMessage("");
    setTransactionType(t);
    setCustomDate(getLocalISO());
    setIsOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage("");
    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      setErrorMessage("Please enter a valid amount greater than ₹0");
      return;
    }

    if (transactionType === "PAYMENT" && balance !== undefined && numAmt > balance) {
      setShowExcessConfirmModal(true);
      return;
    }

    await executeSave();
  };

  const executeSave = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("transactions").insert([
        {
          shop_id: shopId,
          customer_id: customerId,
          amount: Number(amount),
          type: transactionType,
          description: notes.trim() || null,
          created_by: user.id,
          created_at: customDate ? new Date(customDate).toISOString() : new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setIsOpen(false);
      setAmount("");
      setNotes("");
      setCustomDate("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to add transaction: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickUdhar = async (quickAmt: number, quickDesc: string) => {
    setIsLoadingQuick(true);
    setQuickErrorMessage("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("transactions").insert([
        {
          shop_id: shopId,
          customer_id: customerId,
          amount: quickAmt,
          type: "CREDIT",
          description: quickDesc,
          created_by: user.id,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error(err);
      setQuickErrorMessage("Failed to record quick water can: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingQuick(false);
    }
  };

  const isUdhar = transactionType === "CREDIT";

  return (
    <>
      {quickErrorMessage && (
        <div className="mt-4 p-3 bg-error-container/30 border border-error/30 rounded-2xl flex items-center gap-3 text-error animate-shake shadow-sm">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          <span className="text-xs font-bold leading-tight">{quickErrorMessage}</span>
        </div>
      )}

      {/* Quick Item Action Bar */}
      <div className="mt-4 flex items-center justify-between gap-3 bg-gradient-to-r from-surface-container-lowest to-surface-container/50 p-3 rounded-[24px] border border-outline-variant/40 shadow-sm animate-fade-in-up">
        <div className="flex items-center gap-2 pl-1 shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
            <span className="material-symbols-outlined text-[18px]">water_drop</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">Fast Action</div>
            <div className="text-xs font-bold text-on-surface mt-0.5">Regular Items</div>
          </div>
        </div>

        <button
          type="button"
          disabled={isLoadingQuick}
          onClick={() => handleQuickUdhar(20, "Water can")}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500/10 to-blue-500/20 hover:from-blue-500/20 hover:to-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 border border-blue-500/30 transition-all cursor-pointer active:scale-95 shadow-sm disabled:opacity-50"
        >
          {isLoadingQuick ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          ) : (
            <>
              <span className="text-base leading-none">💧</span>
              <span>+₹20 Water Can <span className="text-[10px] uppercase font-extrabold text-blue-600/80 dark:text-blue-400/80">(Udhar)</span></span>
            </>
          )}
        </button>
      </div>

      {/* Main Udhar / Jama Buttons */}
      <div className="flex gap-3 mt-3 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
        <button 
          onClick={() => handleOpen("CREDIT")}
          className="flex-1 py-4 bg-gradient-to-br from-udhar-destructive to-red-600 text-white rounded-[24px] font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          Give Udhar
        </button>
        <button 
          onClick={() => handleOpen("PAYMENT")}
          className="flex-1 py-4 bg-gradient-to-br from-jama-success to-green-600 text-white rounded-[24px] font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
        >
          <span className="material-symbols-outlined text-[20px]">account_balance</span>
          Take Jama
        </button>
      </div>

      {isPortalMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 backdrop-blur-sm ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet */}
          <div
            className={`fixed bottom-0 left-0 w-full bg-surface dark:bg-surface-dim rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[101] transition-transform duration-300 ease-out transform max-h-[90dvh] flex flex-col border-t border-outline-variant/30 ${
              isOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full" />
            </div>

            <div className="p-5 pt-2 pb-24 max-w-lg mx-auto w-full overflow-y-auto flex-1">
              <h2 className={`font-headline-sm text-xl font-bold mb-6 ml-1 flex items-center gap-2 ${isUdhar ? 'text-udhar-destructive' : 'text-jama-success'}`}>
                <span className="material-symbols-outlined">
                  {isUdhar ? 'shopping_bag' : 'account_balance'}
                </span>
                {isUdhar ? 'Give Udhar (Credit)' : 'Take Jama (Payment)'}
              </h2>

              <div className="space-y-5 mb-8">
                <div className="bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] p-4 flex justify-between items-center shadow-sm">
                  <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Customer</span>
                  <span className="font-bold text-on-surface text-sm">{customerName}</span>
                </div>

                {/* Amount */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Amount <span className="text-udhar-destructive">*</span></label>
                  <div className="relative group">
                    <span className={`absolute inset-y-0 left-5 flex items-center font-bold text-2xl ${isUdhar ? 'text-udhar-destructive/50 group-focus-within:text-udhar-destructive' : 'text-jama-success/50 group-focus-within:text-jama-success'}`}>₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-2 rounded-[24px] shadow-sm focus:outline-none transition-all font-amount-display text-[36px] font-bold tracking-tighter text-right ${
                        isUdhar ? "focus:border-udhar-destructive border-udhar-destructive/20 text-udhar-destructive" : "focus:border-jama-success border-jama-success/20 text-jama-success"
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {transactionType === "PAYMENT" && balance !== undefined && Number(amount) > balance && (
                    <p className="text-xs text-amber-500 dark:text-amber-400 font-bold mt-2 ml-1 flex items-center gap-1.5 animate-fade-in-up">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Payment exceeds pending balance (₹{balance}). Excess will be recorded as advance.
                    </p>
                  )}
                </div>

                {/* Custom Date/Time Picker */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Date & Time</label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-4 text-on-surface-variant opacity-70 pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    </span>
                    <input
                      type="datetime-local"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold text-on-surface outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold min-h-[80px] outline-none resize-none text-on-surface"
                    placeholder="What was this for?"
                  />
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-error-container/30 border border-error/30 rounded-2xl flex items-center gap-3 text-error animate-shake shadow-sm">
                  <span className="material-symbols-outlined text-[22px] shrink-0">error</span>
                  <span className="text-xs font-bold leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Save Action */}
              <button 
                type="button"
                className={`w-full py-4 rounded-[20px] font-bold text-sm uppercase tracking-widest text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-md mb-8 cursor-pointer ${isUdhar ? 'bg-gradient-to-r from-udhar-destructive to-red-600 hover:shadow-udhar-destructive/25' : 'bg-gradient-to-r from-jama-success to-green-600 hover:shadow-jama-success/25'}`}
                disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || isLoading}
                onClick={handleSave}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    Confirm {isUdhar ? 'Udhar' : 'Jama'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Excess Payment Confirmation Modal */}
          {showExcessConfirmModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 pointer-events-auto">
              <div
                className="fixed inset-0 bg-black/50 z-[120] transition-opacity duration-300 backdrop-blur-sm opacity-100"
                onClick={() => setShowExcessConfirmModal(false)}
              />
              <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[121] transition-all duration-300 transform scale-100 opacity-100">
                <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-amber-500">
                  <span className="material-symbols-outlined text-[32px]">warning</span>
                </div>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface text-center mb-2">Advance Payment Settle</h3>
                <p className="text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
                  This payment of <span className="font-bold text-jama-success">₹{Number(amount)}</span> exceeds the customer&apos;s pending due of <span className="font-bold text-on-surface">₹{Math.max(0, balance || 0)}</span>. The excess amount will be recorded as <span className="font-bold text-jama-success">Advance (Jama)</span>.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExcessConfirmModal(false)}
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-xl font-bold text-sm border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExcessConfirmModal(false);
                      executeSave();
                    }}
                    disabled={isLoading}
                    className="flex-[1.5] py-3 rounded-xl font-bold text-sm bg-jama-success text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Proceed as Advance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
