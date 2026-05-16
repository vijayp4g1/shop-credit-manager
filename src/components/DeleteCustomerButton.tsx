"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();

      // 1. Delete all transactions for this customer
      const { error: txError } = await supabase
        .from("transactions")
        .delete()
        .eq("customer_id", customerId);
      if (txError) throw txError;

      // 2. Soft delete customer and reset balance
      const { error: custError } = await supabase
        .from("customers")
        .update({ deleted_at: new Date().toISOString(), balance: 0 })
        .eq("id", customerId);
      if (custError) throw custError;

      router.push("/customers");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container/30 transition-all active:scale-90 duration-200 cursor-pointer border border-outline-variant/30 shadow-2xs"
        title="Delete customer"
        aria-label="Delete Customer"
      >
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant hover:text-error">delete</span>
      </button>

      {isPortalMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-6 ${showConfirm ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`fixed inset-0 bg-black/50 z-[120] transition-opacity duration-300 backdrop-blur-sm ${showConfirm ? "opacity-100" : "opacity-0"}`}
            onClick={() => setShowConfirm(false)}
          />

          <div
            className={`bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[121] transition-all duration-300 transform ${
              showConfirm ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="w-14 h-14 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4 border border-error/20 shadow-inner">
              <span className="material-symbols-outlined text-[32px] text-error">person_remove</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface text-center mb-2">Delete Customer?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
              This will permanently remove the customer profile, clear their account balance, and archive all associated transaction history from your active ledger.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-error text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete Account
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
