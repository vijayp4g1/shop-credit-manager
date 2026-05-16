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

const RETAIL_PRESET_TAGS = [
  "Chai & Snacks", 
  "Water Cans", 
  "Packing Covers / Bags", 
  "Saree Falls & Polishing", 
  "Tailor Alteration Wages", 
  "Shop Rent & Maintenance", 
  "Electricity Bill", 
  "Customer Refreshments", 
  "Auto / Transport Fare", 
  "WhatsApp / Insta Ads"
];

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
      setErrorMessage("Failed to record expense: " + (err instanceof Error ? err.message : String(err)));
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
          className="fixed bottom-28 right-6 sm:right-10 px-5 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-full shadow-[0_8px_30px_rgba(245,158,11,0.4)] border border-amber-300/30 flex items-center justify-center gap-2 hover:shadow-[0_12px_40px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 z-40 cursor-pointer group font-sans"
          aria-label="Record Expense"
        >
          <span className="material-symbols-outlined text-[24px] transition-transform duration-300 group-hover:rotate-90">add</span>
          <span className="font-extrabold text-xs uppercase tracking-wider">Record</span>
        </button>
      )}

      {isPortalMounted && isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] font-sans pointer-events-auto animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md animate-fade-in"
            onClick={handleClose}
          />

          {/* Bottom Sheet Modal */}
          <div className="fixed bottom-0 left-0 w-full bg-surface dark:bg-surface-dim rounded-t-[36px] shadow-[0_-10px_50px_rgba(0,0,0,0.3)] z-[101] transition-transform duration-300 ease-out transform max-h-[92dvh] flex flex-col border-t border-outline-variant/30 animate-slide-up">
            <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-14 h-1.5 bg-outline-variant/50 rounded-full" />
            </div>

            <div className="p-6 pt-2 pb-24 max-w-lg mx-auto w-full overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-on-surface tracking-tight">Record Shop Expense</h2>
                    <p className="text-xs text-on-surface-variant font-medium">Log your store outflows instantly</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Amount */}
                <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 p-5 rounded-3xl border border-outline-variant/40 shadow-xs">
                  <label className="block font-label-sm text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">Expense Amount <span className="text-udhar-destructive">*</span></label>
                  <div className="relative group flex items-center">
                    <span className="absolute left-4 font-black text-3xl text-amber-500/60 group-focus-within:text-amber-500 transition-colors">₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-surface/80 rounded-2xl border-2 border-amber-500/20 focus:border-amber-500 focus:bg-surface-container-lowest outline-none transition-all text-right font-amount-display text-[40px] font-black tracking-tighter text-amber-600 dark:text-amber-400 placeholder:text-on-surface-variant/30 shadow-inner"
                      placeholder="0"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1.5 scrollbar-hide">
                    {[50, 100, 200, 500, 1000, 2000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setAmount(prev => String((Number(prev) || 0) + preset))}
                        className="px-3.5 py-2 rounded-full text-xs font-extrabold border transition-all active:scale-95 shrink-0 shadow-2xs cursor-pointer flex items-center gap-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      >
                        <span className="text-[10px] opacity-70">+</span>₹{preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount("")}
                      className="px-3.5 py-2 rounded-full text-xs font-bold border bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant/30 transition-all active:scale-95 shrink-0 cursor-pointer ml-auto"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block font-label-sm text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-2.5 ml-1">Expense Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.name;
                      return (
                        <button
                          type="button"
                          key={cat.name}
                          onClick={() => setCategory(cat.name)}
                          className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm scale-[1.02]"
                              : "bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 font-semibold"
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[20px] shrink-0 ${isSelected ? "text-amber-500" : ""}`}>{cat.icon}</span>
                          <span className="text-xs truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block font-label-sm text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-2.5 ml-1">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PAYMENT_MODES.map((mode) => {
                      const isSelected = paymentMode === mode;
                      const modeColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
                        "CASH": { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500", icon: "payments" },
                        "UPI": { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500", icon: "qr_code_scanner" },
                        "BANK TRANSFER": { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500", icon: "account_balance" },
                      };
                      const curr = modeColors[mode] || { bg: "bg-primary/15", text: "text-primary", border: "border-primary", icon: "wallet" };

                      return (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setPaymentMode(mode)}
                          className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border font-extrabold text-xs tracking-wider transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? `${curr.bg} ${curr.text} ${curr.border} shadow-sm scale-105`
                              : "bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 font-semibold"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{curr.icon}</span>
                          <span>{mode}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time Picker */}
                <div>
                  <label className="block font-label-sm text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-2.5 ml-1">Date & Time</label>
                  <div className="relative">
                    <span className="absolute top-4 left-4 text-on-surface-variant opacity-70 pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    </span>
                    <input
                      type="datetime-local"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-2xl shadow-xs focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-xs font-extrabold text-on-surface outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Notes/Description with Presets */}
                <div>
                  <label className="block font-label-sm text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-2.5 ml-1">Description / Vendor Name (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-2xl shadow-xs focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-xs font-semibold min-h-[80px] outline-none resize-none text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="E.g., Saree box covers delivery, auto fare from station, electricity payment..."
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {RETAIL_PRESET_TAGS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setDescription(prev => prev ? `${prev}, ${tag}` : tag)}
                        className="px-3 py-1.5 bg-surface-container-lowest hover:bg-amber-500/10 text-on-surface-variant hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 rounded-full text-[11px] font-bold border border-outline-variant/40 transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[12px] opacity-70">sell</span>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 bg-error-container/30 border border-error/30 rounded-2xl flex items-center gap-3 text-error animate-shake shadow-xs">
                  <span className="material-symbols-outlined text-[22px] shrink-0">error</span>
                  <span className="text-xs font-bold leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Save Action */}
              <button 
                type="button"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-[0_8px_25px_rgba(245,158,11,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-md cursor-pointer mt-4"
                disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || isLoading}
                onClick={handleSave}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    Save Expense Record
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
