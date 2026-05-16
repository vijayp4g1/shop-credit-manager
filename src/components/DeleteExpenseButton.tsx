"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  expenseId: string;
}

export default function DeleteExpenseButton({ expenseId }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
      if (error) throw error;
      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsPortalMounted(true);
          setShowConfirm(true);
        }}
        className="w-8 h-8 rounded-full bg-surface-container hover:bg-error-container/30 flex items-center justify-center transition-all duration-200 shrink-0 border border-outline-variant/30 shadow-sm cursor-pointer"
        title="Delete expense"
      >
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-error">delete</span>
      </button>

      {isPortalMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${showConfirm ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 backdrop-blur-sm ${showConfirm ? "opacity-100" : "opacity-0"}`}
            onClick={() => setShowConfirm(false)}
          />

          <div
            className={`bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[101] transition-all duration-300 transform ${
              showConfirm ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="w-14 h-14 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-on-error-container">delete</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface text-center mb-2">Delete Expense?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6">
              This will permanently remove this expense record from your shop analytics.
            </p>
            <div className="flex gap-3">
               <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-label-lg text-label-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-label-lg text-label-lg bg-error text-on-error shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  "Delete"
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
