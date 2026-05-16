"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", customerId);

      if (error) throw error;
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
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container/30 transition-all active:scale-90 duration-200"
        title="Delete customer"
      >
        <span className="material-symbols-outlined text-on-surface-variant hover:text-error">delete</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30">
            <div className="w-14 h-14 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-on-error-container">warning</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface text-center mb-2">Delete Customer?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6">
              This will hide the customer and their ledger from your view. Their transaction history is preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-label-lg text-label-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-label-lg text-label-lg bg-error text-on-error shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
