"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  customerName: string;
  customerPhone?: string | null;
  balance: number;
  shopName: string;
  totalCredit?: number;
  totalPayment?: number;
}

export default function WhatsAppReminderSheet({
  customerName,
  customerPhone,
  balance,
  shopName,
  totalCredit = 0,
  totalPayment = 0,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  const [showPhoneErrorModal, setShowPhoneErrorModal] = useState(false);
  const [language, setLanguage] = useState<"EN" | "TE">("EN");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, "") : "";
  const isValidPhone = cleanPhone.length >= 10;
  const isAdv = balance < 0;
  const absBal = Math.abs(balance);

  // Templates
  const templates = isAdv
    ? [
        {
          id: "friendly_adv",
          icon: "verified",
          title: language === "EN" ? "Advance Payment Receipt" : "అడ్వాన్స్ చెల్లింపు రసీదు",
          badge: "Confirmation",
          badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          content:
            language === "EN"
              ? `Namaskaram ${customerName},\n\nWe have received your advance payment at *${shopName}*. Your current khata balance is *₹${absBal.toLocaleString("en-IN")} Advance (Jama)*.\n\nThank you for your trust and continued support!`
              : `నమస్కారం ${customerName} గారు,\n\n*${shopName}* వద్ద మీ అడ్వాన్స్ జమ *₹${absBal.toLocaleString("en-IN")}* మాకు అందింది. మీ ప్రస్తుత ఖాతా నిల్వ ₹${absBal.toLocaleString("en-IN")} (జమ).\n\nమీ నమ్మకానికి మరియు సహకారానికి ధన్యవాదాలు!`,
        },
        {
          id: "update_adv",
          icon: "account_balance",
          title: language === "EN" ? "Credit Balance Update" : "క్రెడిట్ బ్యాలెన్స్ అప్‌డేట్",
          badge: "Account Update",
          badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          content:
            language === "EN"
              ? `🎉 *ACCOUNT CREDIT UPDATE*\n\nNamaskaram ${customerName},\n\nYour account at *${shopName}* currently has an advance credit balance of *₹${absBal.toLocaleString("en-IN")}*.\n\nYou can utilize this balance on your next visit or purchase.`
              : `🎉 *ఖాతా జమ వివరాలు*\n\nనమస్కారం ${customerName} గారు,\n\n*${shopName}* లో మీ ఖాతాలో *₹${absBal.toLocaleString("en-IN")}* అడ్వాన్స్ (జమ) ఉంది. ఈ మొత్తాన్ని మీ తదుపరి కొనుగోలుకు ఉపయోగించుకోవచ్చు.`,
        },
        {
          id: "summary_adv",
          icon: "receipt_long",
          title: language === "EN" ? "Ledger Summary (Advance)" : "ఖాతా సారాంశం (అడ్వాన్స్)",
          badge: "Detailed",
          badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          content:
            language === "EN"
              ? `📊 *LEDGER SUMMARY: ${shopName}*\n\nCustomer: *${customerName}*\nTotal Credit (Udhar): ₹${totalCredit.toLocaleString("en-IN")}\nTotal Paid (Jama): ₹${totalPayment.toLocaleString("en-IN")}\n-------------------------------\n*Net Balance: ₹${absBal.toLocaleString("en-IN")} Advance (Cr)*\n-------------------------------\n\nThank you for maintaining a positive account balance with us!`
              : `📊 *ఖాతా వివరాలు: ${shopName}*\n\nకస్టమర్: *${customerName}*\nమొత్తం అప్పు (ఉధార్): ₹${totalCredit.toLocaleString("en-IN")}\nమొత్తం జమ: ₹${totalPayment.toLocaleString("en-IN")}\n-------------------------------\n*ప్రస్తుత నిల్వ: ₹${absBal.toLocaleString("en-IN")} (జమ)*\n-------------------------------\n\nధన్యవాదాలు!`,
        },
      ]
    : [
        {
          id: "friendly",
          icon: "waving_hand",
          title: language === "EN" ? "Friendly Reminder" : "స్నేహపూర్వక రిమైండర్",
          badge: "Polite",
          badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          content:
            language === "EN"
              ? `Namaskaram ${customerName},\n\nJust a gentle reminder regarding your outstanding khata balance of *₹${balance.toLocaleString("en-IN")}* at *${shopName}*.\n\nPlease make the payment at your earliest convenience. Thank you for your continued trust and support!`
              : `నమస్కారం ${customerName} గారు,\n\n*${shopName}* వద్ద మీ ఖాతా బకాయి *₹${balance.toLocaleString("en-IN")}* చెల్లించవలసి ఉంది.\n\nదయచేసి వీలైనంత త్వరగా చెల్లింపు చేయగలరు. మీ సహకారానికి ధన్యవాదాలు!`,
        },
        {
          id: "urgent",
          icon: "error",
          title: language === "EN" ? "Urgent Overdue Alert" : "అత్యవసర రిమైండర్",
          badge: "High Priority",
          badgeColor: "bg-red-500/10 text-red-600 border-red-500/20",
          content:
            language === "EN"
              ? `⚠️ *URGENT REMINDER*\n\nNamaskaram ${customerName},\n\nYour account balance of *₹${balance.toLocaleString("en-IN")}* at *${shopName}* is overdue. We request you to clear the dues immediately to maintain your credit standing.\n\nPlease confirm once the payment is done.`
              : `⚠️ *అత్యవసర గమనిక*\n\nనమస్కారం ${customerName} గారు,\n\n*${shopName}* లో మీ బకాయి *₹${balance.toLocaleString("en-IN")}* చాలా రోజుల నుండి పెండింగ్‌లో ఉంది. దయచేసి వెంటనే బకాయి మొత్తం చెల్లించవలసిందిగా కోరుతున్నాము.`,
        },
        {
          id: "summary",
          icon: "receipt_long",
          title: language === "EN" ? "Account Summary Breakdown" : "ఖాతా సారాంశం",
          badge: "Detailed",
          badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          content:
            language === "EN"
              ? `📊 *LEDGER SUMMARY: ${shopName}*\n\nCustomer: *${customerName}*\nTotal Credit (Udhar): ₹${totalCredit.toLocaleString("en-IN")}\nTotal Paid (Jama): ₹${totalPayment.toLocaleString("en-IN")}\n-------------------------------\n*Net Due: ₹${balance.toLocaleString("en-IN")}*\n-------------------------------\n\nPlease settle your closing balance. Thank you!`
              : `📊 *ఖాతా వివరాలు: ${shopName}*\n\nకస్టమర్: *${customerName}*\nమొత్తం అప్పు (ఉధార్): ₹${totalCredit.toLocaleString("en-IN")}\nమొత్తం జమ: ₹${totalPayment.toLocaleString("en-IN")}\n-------------------------------\n*ప్రస్తుత బకాయి: ₹${balance.toLocaleString("en-IN")}*\n-------------------------------\n\nదయచేసి బకాయి చెల్లించగలరు. ధన్యవాదాలు!`,
        },
      ];

  const handleOpen = () => {
    if (!isValidPhone) {
      setShowPhoneErrorModal(true);
      return;
    }
    setIsPortalMounted(true);
    setIsOpen(true);
  };

  const handleSendWhatsApp = (content: string) => {
    const targetPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(content)}`;
    window.open(url, "_blank");
    setIsOpen(false);
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex-1 py-3 px-4 active:scale-95 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border cursor-pointer ${
          isAdv 
            ? "bg-gradient-to-r from-jama-success to-green-600 border-jama-success/30" 
            : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 border-emerald-400/30"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">{isAdv ? "verified" : "forum"}</span>
        {isAdv ? "WhatsApp Receipt" : "WhatsApp Reminder"}
      </button>

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

      {isPortalMounted && typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div
            className={`fixed bottom-0 left-0 w-full bg-surface dark:bg-surface-dim rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[101] transition-transform duration-300 ease-out transform max-h-[90dvh] flex flex-col border-t border-outline-variant/30 ${
              isOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Notch */}
            <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full" />
            </div>

            <div className="p-5 pt-2 pb-24 max-w-lg mx-auto w-full overflow-y-auto flex-1">
              {/* Header & Language Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[20px]">mark_chat_unread</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-lg font-bold text-on-surface leading-tight">Select Template</h2>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">Recipient: +91 {customerPhone}</p>
                  </div>
                </div>

                {/* Pill Toggle for English / Telugu */}
                <div className="flex bg-surface-container-high p-1 rounded-xl border border-outline-variant/30 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setLanguage("EN")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === "EN"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("TE")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === "TE"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    తెలుగు
                  </button>
                </div>
              </div>

              {/* Template Cards */}
              <div className="space-y-4">
                {templates.map((tpl, idx) => (
                  <div
                    key={tpl.id}
                    className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/40 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">
                          {tpl.icon}
                        </span>
                        <span className="text-sm font-bold text-on-surface">{tpl.title}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${tpl.badgeColor}`}>
                        {tpl.badge}
                      </span>
                    </div>

                    <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/20 font-mono text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed shadow-inner">
                      {tpl.content}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleCopy(tpl.content, idx)}
                        className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high active:scale-95 text-on-surface rounded-xl text-xs font-bold border border-outline-variant/40 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {copiedIndex === idx ? "check" : "content_copy"}
                        </span>
                        {copiedIndex === idx ? "Copied!" : "Copy SMS"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(tpl.content)}
                        className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        Send on WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
