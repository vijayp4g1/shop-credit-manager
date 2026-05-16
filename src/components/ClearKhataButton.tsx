"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  customerId: string;
  customerName: string;
  transactionCount: number;
}

export default function ClearKhataButton({ customerId, customerName, transactionCount }: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  const executeClear = async () => {
    setIsLoading(true);

    try {
      // 1. Delete all transactions for this customer
      const { error: txError } = await supabase
        .from("transactions")
        .delete()
        .eq("customer_id", customerId);

      if (txError) throw txError;

      // 2. Ensure balance is precisely 0
      const { error: custError } = await supabase
        .from("customers")
        .update({ balance: 0 })
        .eq("id", customerId);

      if (custError) throw custError;

      setShowConfirmModal(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to reset khata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-jama-success/10 via-emerald-500/5 to-primary/10 border border-jama-success/30 rounded-[28px] p-5 shadow-sm flex items-center justify-between gap-4 animate-fade-in mt-2 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-jama-success/20 text-jama-success flex items-center justify-center shrink-0 border border-jama-success/30 shadow-sm font-bold text-xl">
            🎉
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-sm leading-tight">All Dues Cleared! (Khata Settled)</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed max-w-[320px]">
              {customerName} has zero pending balance. You can clear all {transactionCount} past records to start a fresh khata.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoading}
          className="px-4 py-2.5 bg-jama-success hover:bg-green-700 active:scale-95 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">autorenew</span>
          {isLoading ? "Clearing..." : "Start Fresh"}
        </button>
      </div>

      {isPortalMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${showConfirmModal ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 backdrop-blur-sm ${showConfirmModal ? "opacity-100" : "opacity-0"}`}
            onClick={() => setShowConfirmModal(false)}
          />
          <div
            className={`bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[101] transition-all duration-300 transform ${
              showConfirmModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="w-14 h-14 bg-jama-success/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-jama-success/30">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface text-center mb-2">Reset Khata for {customerName}?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
              Are you sure you want to clear all <span className="font-bold text-on-surface">{transactionCount} past records</span>? This will archive previous records and give you a fresh khata page. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl font-bold text-sm border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClear}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-jama-success text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">autorenew</span>
                    Start Fresh
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
