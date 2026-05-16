"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  balance?: number;
}

interface TransactionFabProps {
  shopId?: string;
  customers?: Customer[];
  preselectedCustomerId?: string;
}

export default function TransactionFab({ shopId, customers = [], preselectedCustomerId }: TransactionFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [transactionType, setTransactionType] = useState<"UDHAR" | "JAMA">("UDHAR");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState<string>(preselectedCustomerId || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showExcessConfirmModal, setShowExcessConfirmModal] = useState(false);

  const { isTransactionModalOpen, initialTransactionType, closeTransactionModal } = useAppStore();
  const customerDropdownRef = useRef<HTMLDivElement>(null);
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
    if (isTransactionModalOpen) {
      setCustomDate(getLocalISO());
      setIsOpen(true);
      setTransactionType(initialTransactionType);
    }
  }, [isTransactionModalOpen, initialTransactionType]);

  const handleClose = () => {
    setIsOpen(false);
    setErrorMessage("");
    closeTransactionModal();
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch))
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const quickAmounts = [100, 500, 1000, 5000];

  const handleSave = async () => {
    setErrorMessage("");
    const numAmount = Number(amount);
    if (!shopId || !customerId || !amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than ₹0");
      return;
    }

    if (transactionType === "JAMA" && selectedCustomer && selectedCustomer.balance !== undefined) {
      if (numAmount > selectedCustomer.balance) {
        setShowExcessConfirmModal(true);
        return;
      }
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
          type: transactionType === "UDHAR" ? "CREDIT" : "PAYMENT",
          amount: Number(amount),
          payment_mode: transactionType === "JAMA" ? paymentMode : null,
          description: description.trim() || null,
          created_by: user.id,
          created_at: customDate ? new Date(customDate).toISOString() : new Date().toISOString()
        }
      ]);

      if (error) throw error;

      handleClose();
      setAmount("");
      setCustomerId(preselectedCustomerId || "");
      setCustomerSearch("");
      setShowCustomerDropdown(false);
      setDescription("");
      setCustomDate("");
      setPaymentMode("CASH");
      setTransactionType("UDHAR");
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to add transaction: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  if (!shopId) return null;

  return (
    <>
      <button
        onClick={() => {
          setCustomDate(getLocalISO());
          setIsOpen(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-xl shadow-lg flex items-center justify-center hover:bg-primary-dark active:scale-90 transition-all duration-200 z-40 cursor-pointer"
        aria-label="Add Transaction"
      >
        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>

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
            className={`fixed bottom-0 left-0 w-full bg-gradient-to-b from-surface-container-lowest to-surface rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-outline-variant/30 z-[101] transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] max-h-[90dvh] flex flex-col ${
              isOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="p-5 max-w-lg mx-auto w-full overflow-y-auto flex-1 pb-12">
              {/* Handle bar for bottom sheet */}
              <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-6" />

              <h2 className="font-headline-sm text-xl font-bold text-on-surface mb-6 ml-1">New Transaction</h2>

              {/* Type Selector */}
              <div className="flex bg-surface-container/50 rounded-[20px] p-1.5 mb-6 border border-outline-variant/20 shadow-inner">
                <button
                  type="button"
                  onClick={() => setTransactionType("UDHAR")}
                  className={`flex-1 py-3 font-label-lg text-sm font-bold uppercase tracking-widest rounded-[16px] transition-all duration-300 ${
                    transactionType === "UDHAR" 
                      ? "bg-gradient-to-br from-udhar-destructive to-red-600 text-white shadow-md scale-[1.02]" 
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  Given (Udhar)
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType("JAMA")}
                  className={`flex-1 py-3 font-label-lg text-sm font-bold uppercase tracking-widest rounded-[16px] transition-all duration-300 ${
                    transactionType === "JAMA" 
                      ? "bg-gradient-to-br from-jama-success to-green-600 text-white shadow-md scale-[1.02]" 
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  Received (Jama)
                </button>
              </div>

              {/* Payment Mode Selector (only for Jama) */}
              {transactionType === "JAMA" && (
                <div className="mb-5 animate-fade-in-up">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Payment Mode</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("CASH")}
                      className={`flex-1 py-3 rounded-[16px] font-bold text-sm tracking-wide transition-all duration-200 border-2 ${
                        paymentMode === "CASH"
                          ? "bg-jama-success/10 text-jama-success border-jama-success/30 shadow-sm"
                          : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] align-middle mr-1.5 font-normal">payments</span>
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("UPI")}
                      className={`flex-1 py-3 rounded-[16px] font-bold text-sm tracking-wide transition-all duration-200 border-2 ${
                        paymentMode === "UPI"
                          ? "bg-jama-success/10 text-jama-success border-jama-success/30 shadow-sm"
                          : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] align-middle mr-1.5 font-normal">qr_code_scanner</span>
                      UPI
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Date/Time Picker */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Date & Time</label>
                <div className="relative">
                  <span className="absolute top-3.5 left-4 text-on-surface-variant opacity-70 pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  </span>
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold text-on-surface shadow-sm outline-none"
                  />
                </div>
              </div>

              {/* Description / Notes */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Description (Optional)</label>
                <div className="relative">
                  <span className="absolute top-3.5 left-4 text-on-surface-variant opacity-70 pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </span>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold text-on-surface shadow-sm"
                    placeholder="Add a note..."
                  />
                </div>
              </div>

              {/* Customer Searchable Picker */}
              <div className="mb-5 relative" ref={customerDropdownRef}>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Customer</label>
                <div className="absolute top-[34px] left-4 text-on-surface-variant opacity-70 pointer-events-none" style={{ zIndex: 1 }}>
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input
                  value={customerId ? (selectedCustomer?.name || "") : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCustomerId("");
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold text-on-surface shadow-sm"
                  placeholder="Search or select a customer..."
                />
                {showCustomerDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-surface-container-lowest border border-outline-variant/40 rounded-[20px] shadow-xl max-h-56 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      <div className="p-1">
                        {filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCustomerId(c.id);
                              setCustomerSearch("");
                              setShowCustomerDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container rounded-[16px] transition-colors ${
                              c.id === customerId ? "bg-primary/5 border border-primary/20" : ""
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${c.id === customerId ? "bg-primary text-on-primary shadow-md" : "bg-surface-variant text-on-surface-variant"}`}>
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className={`text-sm ${c.id === customerId ? "font-bold text-primary" : "font-semibold text-on-surface"}`}>{c.name}</div>
                              {c.phone && <div className="text-[11px] font-medium text-on-surface-variant mt-0.5">{c.phone}</div>}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-5 text-sm font-medium text-on-surface-variant text-center">No customers found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Amount (₹)</label>
                <div className="relative group">
                  <div className={`absolute inset-0 rounded-[24px] blur-md transition-opacity duration-300 opacity-0 group-focus-within:opacity-100 ${
                      transactionType === "UDHAR" ? "bg-udhar-destructive/20" : "bg-jama-success/20"
                  }`}></div>
                  <span className={`absolute inset-y-0 left-5 flex items-center text-2xl font-bold transition-colors ${
                      transactionType === "UDHAR" ? "text-udhar-destructive/50 group-focus-within:text-udhar-destructive" : "text-jama-success/50 group-focus-within:text-jama-success"
                  }`}>₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`relative w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-2 rounded-[24px] focus:outline-none transition-all font-amount-display text-[40px] font-bold tracking-tighter text-right shadow-sm ${
                      transactionType === "UDHAR" ? "focus:border-udhar-destructive border-udhar-destructive/20 text-udhar-destructive" : "focus:border-jama-success border-jama-success/20 text-jama-success"
                    }`}
                    placeholder="0"
                  />
                </div>
                {transactionType === "JAMA" && selectedCustomer && selectedCustomer.balance !== undefined && Number(amount) > selectedCustomer.balance && (
                  <p className="text-xs text-amber-500 dark:text-amber-400 font-bold mt-2 ml-1 flex items-center gap-1.5 animate-fade-in-up">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Payment exceeds pending balance (₹{selectedCustomer.balance}). Excess will be recorded as advance.
                  </p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 scrollbar-hide px-1">
                {selectedCustomer && selectedCustomer.balance !== undefined && Number(selectedCustomer.balance) > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(Math.abs(Number(selectedCustomer.balance))))}
                    className="flex-shrink-0 px-4 py-2 border-2 rounded-xl font-bold text-sm tracking-wide active:scale-95 transition-all shadow-sm bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Collect full pending due"
                  >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    Full Due (₹{Math.abs(Number(selectedCustomer.balance)).toLocaleString("en-IN")})
                  </button>
                )}
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

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-error-container/30 border border-error/30 rounded-2xl flex items-center gap-3 text-error animate-shake shadow-sm">
                  <span className="material-symbols-outlined text-[22px] shrink-0">error</span>
                  <span className="text-xs font-bold leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Save Action */}
              <button 
                disabled={isLoading || !customerId || !amount}
                className={`w-full py-4 rounded-[20px] font-bold text-[15px] uppercase tracking-widest text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100 ${
                  transactionType === "UDHAR" 
                    ? "bg-gradient-to-r from-udhar-destructive to-red-600 hover:shadow-udhar-destructive/25" 
                    : "bg-gradient-to-r from-jama-success to-green-600 hover:shadow-jama-success/25"
                }`}
                onClick={handleSave}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    Save {transactionType === "UDHAR" ? "Udhar" : "Jama"}
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
                  This payment of <span className="font-bold text-jama-success">₹{Number(amount)}</span> exceeds the customer&apos;s pending due of <span className="font-bold text-on-surface">₹{Math.max(0, selectedCustomer?.balance || 0)}</span>. The excess amount will be recorded as <span className="font-bold text-jama-success">Advance (Jama)</span>.
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
