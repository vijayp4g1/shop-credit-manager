"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";

const CATEGORIES = [
  { name: "Supplies & Packaging", icon: "inventory_2" },
  { name: "Tea & Refreshments", icon: "coffee" },
  { name: "Staff Salary", icon: "work" },
  { name: "Electricity & Utilities", icon: "electric_bolt" },
  { name: "Rent", icon: "real_estate_agent" },
  { name: "Maintenance", icon: "build" },
  { name: "Transportation & Freight", icon: "local_shipping" },
  { name: "Marketing", icon: "campaign" },
  { name: "Other", icon: "receipt" },
];

const PAYMENT_MODES = ["CASH", "UPI", "BANK TRANSFER"];

export default function AddExpenseSheet({ shopId, hideFab }: { shopId: string; hideFab?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Supplies & Packaging");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [customDate, setCustomDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { isAddExpenseModalOpen, initialExpenseCategory, closeAddExpenseModal } = useAppStore();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  const getLocalISO = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (isAddExpenseModalOpen) {
      setIsOpen(true);
      setCustomDate(getLocalISO());
      if (initialExpenseCategory) {
        setCategory(initialExpenseCategory);
      }
    }
  }, [isAddExpenseModalOpen, initialExpenseCategory]);

  const handleClose = () => {
    setIsOpen(false);
    setErrorMessage("");
    closeAddExpenseModal();
  };

  const handleSave = async () => {
    setErrorMessage("");
    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      setErrorMessage("Please enter a valid amount greater than ₹0");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("expenses").insert([
        {
          shop_id: shopId,
          category,
          amount: numAmt,
          description: description.trim() || null,
          payment_mode: paymentMode,
          created_by: user.id,
          expense_date: customDate ? new Date(customDate).toISOString() : new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setIsOpen(false);
      setAmount("");
      setDescription("");
      closeAddExpenseModal();
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to add expense: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!hideFab && (
        <button
          type="button"
          onClick={() => {
            setCustomDate(getLocalISO());
            setIsOpen(true);
          }}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-90 transition-all duration-200 z-40 cursor-pointer"
          aria-label="Add Expense"
        >
          <span className="material-symbols-outlined text-[32px]">receipt_long</span>
        </button>
      )}

      {isPortalMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 backdrop-blur-sm ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </div>
                <h2 className="font-headline-sm text-xl font-bold text-on-surface">Record Shop Expense</h2>
              </div>

              <div className="space-y-5 mb-8">
                {/* Amount */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Expense Amount <span className="text-udhar-destructive">*</span></label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-5 flex items-center font-bold text-2xl text-amber-500/50 group-focus-within:text-amber-500">₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-2 rounded-[24px] shadow-sm focus:outline-none transition-all font-amount-display text-[36px] font-bold tracking-tighter text-right focus:border-amber-500 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      placeholder="0"
                    />
                  </div>

                  {/* Quick Amount Increment Chips */}
                  <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-hide">
                    {[50, 100, 200, 500, 1000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setAmount(prev => String((Number(prev) || 0) + preset))}
                        className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 shrink-0 shadow-2xs cursor-pointer flex items-center gap-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      >
                        <span className="text-[10px] opacity-70">+</span>₹{preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount("")}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant/30 transition-all active:scale-95 shrink-0 cursor-pointer ml-auto"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.name;
                      return (
                        <button
                          type="button"
                          key={cat.name}
                          onClick={() => setCategory(cat.name)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                              : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container/50 font-medium"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] shrink-0">{cat.icon}</span>
                          <span className="text-xs truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Payment Mode</label>
                  <div className="flex gap-2">
                    {PAYMENT_MODES.map((mode) => {
                      const isSelected = paymentMode === mode;
                      return (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setPaymentMode(mode)}
                          className={`flex-1 py-2.5 px-3 rounded-xl border text-center font-bold text-xs tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-on-primary border-primary shadow-sm"
                              : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container/50"
                          }`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time Picker */}
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
                      className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-semibold text-on-surface outline-none"
                    />
                  </div>
                </div>

                {/* Notes/Description */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-semibold min-h-[80px] outline-none resize-none text-on-surface"
                    placeholder="Specific item, vendor name, or invoice info..."
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {["Tea / Coffee", "Water Can", "Cleaning Items", "Parcel / Courier", "Shop Maintenance"].map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setDescription(prev => prev ? `${prev}, ${tag}` : tag)}
                        className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-full text-xs font-semibold border border-outline-variant/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[12px] opacity-70">label</span>
                        {tag}
                      </button>
                    ))}
                  </div>
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
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-[20px] font-bold text-sm uppercase tracking-widest text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-md mb-8 cursor-pointer"
                disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || isLoading}
                onClick={handleSave}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    Save Expense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
