"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface EditCustomerSheetProps {
  customerId: string;
  initialName: string;
  initialPhone?: string | null;
  initialAddress?: string | null;
}

export default function EditCustomerSheet({
  customerId,
  initialName,
  initialPhone,
  initialAddress,
}: EditCustomerSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone || "");
  const [address, setAddress] = useState(initialAddress || "");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  useEffect(() => {
    setName(initialName);
    setPhone(initialPhone || "");
    setAddress(initialAddress || "");
  }, [initialName, initialPhone, initialAddress, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setErrorMessage("");
    setPhoneError("");
  };

  const handleSave = async () => {
    setErrorMessage("");
    if (!name.trim()) return;

    if (phone.trim()) {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length !== 10 && cleanPhone.length > 0) {
        setPhoneError("Phone number must be exactly 10 digits");
        return;
      }
      setPhoneError("");
    }

    setIsLoading(true);

    try {
      const cleanPhone = phone.trim() ? phone.replace(/\D/g, "") : null;
      const { error } = await supabase
        .from("customers")
        .update({
          name: name.trim(),
          phone: cleanPhone,
          address: address.trim() || null,
        })
        .eq("id", customerId);

      if (error) throw error;

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update customer: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 flex items-center justify-center text-on-surface-variant cursor-pointer border border-outline-variant/30 shadow-2xs"
        aria-label="Edit Customer"
        title="Edit Customer Details"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
      </button>

      {isPortalMounted && typeof document !== "undefined" && createPortal(
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
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                </div>
                <h2 className="font-headline-sm text-xl font-bold text-on-surface">Edit Customer Profile</h2>
              </div>

              <div className="space-y-5 mb-8">
                {/* Customer Name */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                    Full Name <span className="text-udhar-destructive">*</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold outline-none text-on-surface"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                    Phone Number
                  </label>
                  <div className="relative group flex items-center">
                    <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant group-focus-within:text-primary transition-colors z-10">
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </span>
                    <div className="absolute inset-y-0 left-11 flex items-center z-10">
                      <span className="text-sm font-bold text-on-surface border-r border-outline-variant/50 pr-2 py-1">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-[88px] pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold outline-none text-on-surface"
                      placeholder="98765 43210"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-udhar-destructive font-bold mt-1.5 ml-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {phoneError}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                    Address / Notes (Optional)
                  </label>
                  <div className="relative group">
                    <span className="absolute top-3.5 left-4 text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">location_on</span>
                    </span>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold min-h-[100px] outline-none resize-none leading-relaxed text-on-surface"
                      placeholder="Shop location or any identifying note..."
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
                className="w-full py-4 bg-primary rounded-[20px] font-bold text-sm text-on-primary shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-md mb-8 cursor-pointer"
                disabled={!name || isLoading}
                onClick={handleSave}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
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
