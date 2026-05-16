"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  transactionId: string;
  customerName: string;
  type: "CREDIT" | "PAYMENT";
  amount: number;
  paymentMode: string | null;
  description: string | null;
}

export default function EditTransactionSheet({
  transactionId,
  customerName,
  type: initialType,
  amount: initialAmount,
  paymentMode: initialPaymentMode,
  description: initialDescription,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [transactionType, setTransactionType] = useState<"CREDIT" | "PAYMENT">(initialType);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">(
    initialPaymentMode === "UPI" ? "UPI" : "CASH"
  );
  const [description, setDescription] = useState(initialDescription || "");
  const [amount, setAmount] = useState(String(initialAmount));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const quickAmounts = [100, 500, 1000, 5000];

  const handleSave = async () => {
    setErrorMessage("");
    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Please enter a valid amount greater than ₹0");
      return;
    }
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .update({
          type: transactionType,
          amount: Number(amount),
          payment_mode: transactionType === "PAYMENT" ? paymentMode : null,
          description: description.trim() || null,
        })
        .eq("id", transactionId);

      if (error) throw error;
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to edit transaction: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsPortalMounted(true);
          setIsOpen(true);
        }}
        className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary/10 flex items-center justify-center transition-all duration-200 shrink-0 border border-outline-variant/30 shadow-sm cursor-pointer"
        title="Edit transaction"
      >
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-primary">edit</span>
      </button>

      {isPortalMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed bottom-0 left-0 w-full bg-surface dark:bg-surface-dim rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[101] transition-transform duration-300 ease-out transform max-h-[90dvh] flex flex-col border-t border-outline-variant/30 ${
              isOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="p-5 pt-2 max-w-lg mx-auto w-full overflow-y-auto flex-1 pb-24">
              <div className="w-full flex justify-center pb-6 shrink-0">
                <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full" />
              </div>

              <h2 className="font-headline-sm text-xl font-bold mb-6 ml-1 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">edit</span>
                Edit Transaction
              </h2>

              <div className="space-y-5 mb-8">
                <div className="bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] p-4 flex justify-between items-center shadow-sm">
                  <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Customer</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-xs font-bold text-on-surface-variant shadow-inner">
                      {customerName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-on-surface text-sm">{customerName}</span>
                  </div>
                </div>

                {/* Type Toggle */}
                <div className="flex bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] p-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setTransactionType("CREDIT")}
                    className={`flex-1 py-3 rounded-[16px] text-sm font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      transactionType === "CREDIT"
                        ? "bg-gradient-to-br from-udhar-destructive to-red-600 text-white shadow-md scale-[1.02]"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    Given (Udhar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType("PAYMENT")}
                    className={`flex-1 py-3 rounded-[16px] text-sm font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      transactionType === "PAYMENT"
                        ? "bg-gradient-to-br from-jama-success to-green-600 text-white shadow-md scale-[1.02]"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    Received (Jama)
                  </button>
                </div>

                {/* Payment Mode */}
                {transactionType === "PAYMENT" && (
                  <div className="animate-fade-in-up">
                    <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Payment Mode</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("CASH")}
                        className={`flex-1 py-3 rounded-[16px] text-sm font-bold tracking-wide transition-all duration-200 border-2 flex items-center justify-center gap-2 cursor-pointer ${
                          paymentMode === "CASH"
                            ? "bg-jama-success/10 text-jama-success border-jama-success/30 shadow-sm"
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] font-normal">payments</span>
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("UPI")}
                        className={`flex-1 py-3 rounded-[16px] text-sm font-bold tracking-wide transition-all duration-200 border-2 flex items-center justify-center gap-2 cursor-pointer ${
                          paymentMode === "UPI"
                            ? "bg-jama-success/10 text-jama-success border-jama-success/30 shadow-sm"
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] font-normal">qr_code_scanner</span>
                        UPI
                      </button>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Amount <span className="text-udhar-destructive">*</span></label>
                  <div className="relative group">
                    <span className={`absolute inset-y-0 left-5 flex items-center font-bold text-2xl ${transactionType === "CREDIT" ? "text-udhar-destructive/50 group-focus-within:text-udhar-destructive" : "text-jama-success/50 group-focus-within:text-jama-success"}`}>₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-2 rounded-[24px] shadow-sm focus:outline-none transition-all font-amount-display text-[36px] font-bold tracking-tighter text-right ${
                        transactionType === "CREDIT" ? "focus:border-udhar-destructive border-udhar-destructive/20 text-udhar-destructive" : "focus:border-jama-success border-jama-success/20 text-jama-success"
                      }`}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide px-1">
                  {quickAmounts.map((qAmt) => (
                    <button
                      key={qAmt}
                      type="button"
                      onClick={() => setAmount((prev) => (Number(prev || 0) + qAmt).toString())}
                      className="flex-shrink-0 px-4 py-2 border-2 border-outline-variant/30 rounded-xl font-bold text-sm tracking-wide text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline-variant/60 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      +₹{qAmt}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Notes (Optional)</label>
                  <div className="relative group">
                    <span className="absolute top-3.5 left-4 text-on-surface-variant opacity-70 pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">edit_note</span>
                    </span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold min-h-[80px] outline-none resize-none text-on-surface"
                      placeholder="What was this for?"
                    />
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

              <button
                type="button"
                disabled={isLoading || !amount || Number(amount) <= 0}
                className={`w-full py-4 rounded-[20px] font-bold text-sm uppercase tracking-widest text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-md mb-8 cursor-pointer ${transactionType === "CREDIT" ? "bg-gradient-to-r from-udhar-destructive to-red-600 hover:shadow-udhar-destructive/25" : "bg-gradient-to-r from-jama-success to-green-600 hover:shadow-jama-success/25"}`}
                onClick={handleSave}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    Save Changes
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
