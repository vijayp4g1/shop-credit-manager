"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function EditShopSheet({ 
  shopId, 
  initialName 
}: { 
  shopId: string; 
  initialName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  const handleSave = async () => {
    setErrorMessage("");
    if (!name.trim()) {
      setErrorMessage("Shop name is required");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("shops")
        .update({ name: name.trim() })
        .eq("id", shopId);

      if (error) throw error;

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update shop details: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 bg-surface-container-lowest shadow-sm border border-outline-variant/50 cursor-pointer text-on-surface-variant"
        title="Edit Shop Details"
        aria-label="Edit Shop"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
      </button>

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

            <div className="p-5 pt-2 pb-10 max-w-lg mx-auto w-full overflow-y-auto flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
                <h2 className="font-headline-sm text-xl font-bold text-on-surface">Edit Shop Details</h2>
              </div>

              <div className="space-y-5 mb-8">
                {/* Shop Name */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Shop Name <span className="text-udhar-destructive">*</span></label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-5 flex items-center text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">store</span>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:outline-none focus:border-primary transition-all text-sm font-bold text-on-surface"
                      placeholder="Enter shop name"
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

              {/* Save Action */}
              <button 
                type="button"
                className="w-full py-4 bg-primary text-on-primary rounded-[20px] font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-md mb-8 cursor-pointer"
                disabled={!name.trim() || isLoading}
                onClick={handleSave}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">save</span>
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
