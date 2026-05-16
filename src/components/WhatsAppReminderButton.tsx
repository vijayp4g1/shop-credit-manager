"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  customerName: string;
  customerPhone?: string | null;
  balance: number;
  shopName: string;
  variant?: "full" | "compact";
}

export default function WhatsAppReminderButton({
  customerName,
  customerPhone,
  balance,
  shopName,
  variant = "full",
}: Props) {
  const [showPhoneErrorModal, setShowPhoneErrorModal] = useState(false);
  const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, "") : "";
  const isValidPhone = cleanPhone.length >= 10;
  const isAdv = balance < 0;
  const absBal = Math.abs(balance);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isValidPhone) {
      setShowPhoneErrorModal(true);
      return;
    }

    const message = isAdv
      ? `Namaskaram ${customerName},\n\nWe have received your advance payment at *${shopName}*. Your current account balance is *₹${absBal.toLocaleString("en-IN")} Advance (Jama)*.\n\nThank you for your business and continued support!`
      : `Namaskaram ${customerName},\n\nYour current outstanding balance at *${shopName}* is *₹${balance.toLocaleString("en-IN")}*.\n\nPlease settle this balance at your earliest convenience. Thank you for your business!`;
    const targetPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const buttonEl = variant === "compact" ? (
    <button
      type="button"
      onClick={handleClick}
      title={isValidPhone ? (isAdv ? `Send Advance receipt to ${customerPhone}` : `Send WhatsApp reminder to ${customerPhone}`) : "No valid phone number"}
      className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border mt-1.5 active:scale-95 transition-all shadow-sm flex items-center gap-1 shrink-0 cursor-pointer ${
        isAdv 
          ? "bg-jama-success/10 text-jama-success border-jama-success/30 hover:bg-jama-success/20" 
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
      }`}
    >
      <span className="material-symbols-outlined text-[13px] font-normal">{isAdv ? "verified" : "forum"}</span>
      {isAdv ? "Adv SMS" : "Remind"}
    </button>
  ) : (
    <button
      type="button"
      onClick={handleClick}
      className={`flex-1 py-3 px-4 active:scale-95 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border cursor-pointer ${
        isAdv 
          ? "bg-jama-success hover:bg-green-700 border-jama-success/30" 
          : "bg-emerald-600 hover:bg-emerald-700 border-emerald-500/20"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{isAdv ? "verified" : "forum"}</span>
      {isAdv ? "WhatsApp Receipt" : "WhatsApp Reminder"}
    </button>
  );

  return (
    <>
      {buttonEl}
      {showPhoneErrorModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 pointer-events-auto">
          <div
            className="fixed inset-0 bg-black/50 z-[120] transition-opacity duration-300 backdrop-blur-sm opacity-100"
            onClick={() => setShowPhoneErrorModal(false)}
          />
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[121] transition-all duration-300 transform scale-100 opacity-100">
            <div className="w-14 h-14 bg-error-container/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-error/30 text-error">
              <span className="material-symbols-outlined text-[32px]">no_sim</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface text-center mb-2">No Phone Number Saved</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
              We couldn&apos;t find a valid 10-digit mobile number for <span className="font-bold text-on-surface">{customerName}</span>. Please edit their customer profile to add a WhatsApp number.
            </p>
            <button
              type="button"
              onClick={() => setShowPhoneErrorModal(false)}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
