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
          title: language === "EN" ? "Payment Confirmation Receipt" : "అడ్వాన్స్ చెల్లింపు రసీదు",
          badge: "Confirmation",
          badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          content:
            language === "EN"
              ? `🎉 *PAYMENT SUCCESSFUL*\n*${shopName}*\n\nNamaskaram ${customerName} garu 🙏,\nWe have successfully received your advance payment / deposit!\n\n💵 Advance Received: ₹${absBal.toLocaleString("en-IN")}\n✅ *Current Khata Status: ₹${absBal.toLocaleString("en-IN")} Advance (Jama)*\n\nYour advance balance is safely secured in our ledger and will be automatically deducted during your next purchase. Thank you for your wonderful relationship! 💐`
              : `🎉 *చెల్లింపు రసీదు*\n*${shopName}*\n\nనమస్కారం ${customerName} గారు 🙏,\nమీరు చెల్లించిన అడ్వాన్స్ మొత్తం మాకు విజయవంతంగా అందింది!\n\n💵 జమ అయిన అడ్వాన్స్: ₹${absBal.toLocaleString("en-IN")}\n✅ *ప్రస్తుత ఖాతా నిల్వ: ₹${absBal.toLocaleString("en-IN")} (జమ)*\n\nమీ అడ్వాన్స్ మొత్తం మా వద్ద సురక్షితంగా ఉంది. మీ తదుపరి కొనుగోలులో ఈ మొత్తం మినహాయించబడుతుంది. మీ సహకారానికి ధన్యవాదాలు! 💐`,
        },
        {
          id: "summary_adv",
          icon: "receipt_long",
          title: language === "EN" ? "Account Summary (Advance)" : "ఖాతా నిల్వ నివేదిక",
          badge: "Detailed",
          badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          content:
            language === "EN"
              ? `📊 *LEDGER SUMMARY: ADVANCE ACCOUNT*\n*${shopName}*\n\nDear ${customerName},\nHere is the complete overview of your Khata ledger:\n\n🛍️ Total Saree/Textile Purchases: ₹${totalCredit.toLocaleString("en-IN")}\n💳 Total Payments Deposited: ₹${totalPayment.toLocaleString("en-IN")}\n----------------------------------------\n🟢 *Net Credit in Your Favour: ₹${absBal.toLocaleString("en-IN")} Advance (Jama)*\n----------------------------------------\n\nThank you for maintaining a credit surplus! We look forward to serving you with our finest sarees soon. 🌟`
              : `📊 *ఖాతా నిల్వ నివేదిక (అడ్వాన్స్)*\n*${shopName}*\n\nప్రియమైన ${customerName} గారు,\nమీ ఖాతా పూర్తి సారాంశం క్రింద ఇవ్వబడింది:\n\n🛍️ మొత్తం వస్త్రాల కొనుగోలు: ₹${totalCredit.toLocaleString("en-IN")}\n💳 మొత్తం జమ చేసిన డబ్బు: ₹${totalPayment.toLocaleString("en-IN")}\n----------------------------------------\n🟢 *మీ ఖాతాలో ఉన్న అడ్వాన్స్ నిల్వ: ₹${absBal.toLocaleString("en-IN")} (జమ)*\n----------------------------------------\n\nమీ ఖాతాలో అడ్వాన్స్ ఉంచినందుకు ధన్యవాదాలు! త్వరలోనే మీకు మరింత మెరుగైన వస్త్రాలను అందించడానికి సంతోషిస్తున్నాము. 🌟`,
        },
        {
          id: "invite_adv",
          icon: "styler",
          title: language === "EN" ? "New Arrivals Invitation" : "ప్రత్యేక ఆహ్వానం",
          badge: "Premium Invite",
          badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          content:
            language === "EN"
              ? `🥻 *SPECIAL INVITATION* ✨\n*${shopName}*\n\nNamaskaram ${customerName} garu 🙏,\nDid you know you currently have an advance balance of *₹${absBal.toLocaleString("en-IN")}* waiting for you at our showroom?\n\nOur exquisite new bridal and wedding silk sarees have just been unboxed! 🎁 Step into ${shopName} anytime to redeem your advance balance on our beautiful new collections.\n\nWe look forward to making your shopping experience magical! ✨`
              : `🥻 *ప్రత్యేక ఆహ్వానం* ✨\n*${shopName}*\n\nనమస్కారం ${customerName} గారు 🙏,\nమా వస్త్రాలయంలో మీ పేరిట *₹${absBal.toLocaleString("en-IN")}* అడ్వాన్స్ (జమ) నిల్వ ఉన్న విషయం మీకు తెలుసా?\n\nసరికొత్త పెళ్లి పట్టు చీరలు మరియు ప్రత్యేక డిజైన్లు ఇప్పుడే మా షోరూమ్‌కు చేరుకున్నాయి! 🎁 మీ అడ్వాన్స్ మొత్తాన్ని ఉపయోగించుకోవడానికి మరియు మా నూతన వస్త్రాలను వీక్షించడానికి సాదరంగా ఆహ్వానిస్తున్నాము.\n\nమీ పర్యటనను అద్భుతంగా మార్చడానికి మేము సిద్ధంగా ఉన్నాము! ✨`,
        },
      ]
    : [
        {
          id: "friendly",
          icon: "waving_hand",
          title: language === "EN" ? "Gentle Khata Reminder" : "స్నేహపూర్వక రిమైండర్",
          badge: "Polite",
          badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          content:
            language === "EN"
              ? `Namaskaram ${customerName} garu 🙏,\n\nGreetings from *${shopName}*! We hope you and your family are doing wonderful.\n\nThis is a polite reminder regarding your outstanding Khata balance of *₹${balance.toLocaleString("en-IN")}*.\n\nTotal Udhar: ₹${totalCredit.toLocaleString("en-IN")}\nTotal Jama: ₹${totalPayment.toLocaleString("en-IN")}\n*Net Due: ₹${balance.toLocaleString("en-IN")}*\n\nYou can easily make the payment via UPI, Google Pay, PhonePe, or at our showroom. Please share a screenshot once transferred.\n\nThank you for your trust and continued patronage! ✨`
              : `నమస్కారం ${customerName} గారు 🙏,\n\n*${shopName}* నుండి శుభాకాంక్షలు!\n\nఇది మీ ఖాతా నిల్వకు సంబంధించిన చిన్న రిమైండర్. మీ ఖాతాలో ప్రస్తుతం *₹${balance.toLocaleString("en-IN")}* బకాయి ఉంది.\n\nమొత్తం ఉధార్: ₹${totalCredit.toLocaleString("en-IN")}\nమొత్తం జమ: ₹${totalPayment.toLocaleString("en-IN")}\n*చెల్లించవలసిన మొత్తం: ₹${balance.toLocaleString("en-IN")}*\n\nమీరు Google Pay, PhonePe లేదా UPI ద్వారా చెల్లింపు చేయవచ్చు. డబ్బు పంపిన తర్వాత దయచేసి స్క్రీన్‌షాట్ పంపగలరు.\n\nమాపై మీ నమ్మకానికి మరియు సహకారానికి హృదయపూర్వక ధన్యవాదాలు! ✨`,
        },
        {
          id: "summary",
          icon: "receipt_long",
          title: language === "EN" ? "Itemized Account Summary" : "అధికారిక ఖాతా నివేదిక",
          badge: "Detailed",
          badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          content:
            language === "EN"
              ? `📋 *OFFICIAL LEDGER STATEMENT*\n*${shopName}*\n\nDear ${customerName},\nHere is the updated financial summary of your Khata account:\n\n🛍️ Total Saree/Textile Credit: ₹${totalCredit.toLocaleString("en-IN")}\n💳 Total Payments Received: ₹${totalPayment.toLocaleString("en-IN")}\n----------------------------------------\n🔴 *Current Outstanding Balance: ₹${balance.toLocaleString("en-IN")}*\n----------------------------------------\n\nTo ensure smooth account reconciliation, kindly clear the pending dues at your earliest convenience.\n\nFor any queries regarding your statement, please reply to this message. Have a blessed day! 🌟`
              : `📋 *అధికారిక ఖాతా నివేదిక*\n*${shopName}*\n\nప్రియమైన ${customerName} గారు,\nమీ ఖాతా నిల్వల పూర్తి సారాంశం క్రింద ఇవ్వబడింది:\n\n🛍️ మొత్తం కొనుగోలు అప్పు: ₹${totalCredit.toLocaleString("en-IN")}\n💳 ఇప్పటివరకు జమ చేసిన మొత్తం: ₹${totalPayment.toLocaleString("en-IN")}\n----------------------------------------\n🔴 *ప్రస్తుత బకాయి మొత్తం: ₹${balance.toLocaleString("en-IN")}*\n----------------------------------------\n\nదయచేసి బకాయి మొత్తాన్ని వీలైనంత త్వరగా చెల్లించి ఖాతాను క్లియర్ చేయగలరు.\n\nఏవైనా సందేహాలు ఉంటే ఈ నెంబర్‌కు మెసేజ్ చేయండి. శుభదినం! 🌟`,
        },
        {
          id: "urgent",
          icon: "error",
          title: language === "EN" ? "Urgent Overdue Alert" : "అత్యవసర రిమైండర్",
          badge: "High Priority",
          badgeColor: "bg-red-500/10 text-red-600 border-red-500/20",
          content:
            language === "EN"
              ? `⚠️ *URGENT PAYMENT ALERT*\n*${shopName}*\n\nNamaskaram ${customerName} garu,\n\nWe notice that your Khata balance of *₹${balance.toLocaleString("en-IN")}* at *${shopName}* has been outstanding for a while. We highly value your relationship with us and kindly request you to settle this overdue balance today.\n\nTimely settlements help us maintain high-quality inventory and offer better credit facilities in the future.\n\nPlease confirm once the transfer is completed. Thank you! 🙏`
              : `⚠️ *ముఖ్యమైన బకాయి గమనిక*\n*${shopName}*\n\nనమస్కారం ${customerName} గారు,\n\n*${shopName}* లో మీ ఖాతా బకాయి *₹${balance.toLocaleString("en-IN")}* చాలా రోజుల నుండి పెండింగ్‌లో ఉంది. మీతో మాకున్న వ్యాపార సంబంధాన్ని మేము ఎంతో గౌరవిస్తాము. దయచేసి ఈ రోజు బకాయి మొత్తాన్ని చెల్లించవలసిందిగా విజ్ఞప్తి చేస్తున్నాము.\n\nసకాలంలో చెల్లింపులు భవిష్యత్తులో మెరుగైన వస్త్రాలు అందించడానికి మాకు ఎంతో సహాయపడతాయి.\n\nడబ్బు పంపిన తర్వాత దయచేసి సమాచారం ఇవ్వగలరు. ధన్యవాదాలు! 🙏`,
        },
        {
          id: "festive_offer",
          icon: "celebration",
          title: language === "EN" ? "Festive Saree & Account Invite" : "నూతన కలెక్షన్ ఆహ్వానం",
          badge: "Festive Invite",
          badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          content:
            language === "EN"
              ? `🥻 *EXCLUSIVE FRESH ARRIVALS* ✨\n*${shopName}*\n\nNamaskaram ${customerName} garu 🙏,\n\nOur fresh collection of premium Kanchipuram silk sarees and festive wear has just arrived! 🌸 We would love to welcome you and your family to explore the new arrivals.\n\nWhile you plan your visit, kindly also note your pending Khata closing balance of *₹${balance.toLocaleString("en-IN")}*. Settle your account today to enjoy seamless shopping on your next visit!\n\nLooking forward to welcoming you soon! 💫`
              : `🥻 *నూతన కలెక్షన్ ఆహ్వానం* ✨\n*${shopName}*\n\nనమస్కారం ${customerName} గారు 🙏,\n\nమా వస్త్రాలయంలో సరికొత్త కంచి పట్టు చీరలు మరియు పండుగ వస్త్రాలు అందుబాటులోకి వచ్చాయి! 🌸 మీరు మరియు మీ కుటుంబ సభ్యులు విచ్చేసి సరికొత్త డిజైన్లను వీక్షించవలసిందిగా ఆహ్వానిస్తున్నాము.\n\nమీరు వచ్చే ముందు, మీ ఖాతాలో ఉన్న పెండింగ్ బకాయి *₹${balance.toLocaleString("en-IN")}* గమనించగలరు. మీ బకాయిని క్లియర్ చేసి మీ తదుపరి కొనుగోలును ఆనందించండి!\n\nమీ రాక కోసం ఎదురుచూస్తున్నాము! 💫`,
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

      {isPortalMounted && isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-auto animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div className="fixed bottom-0 left-0 w-full bg-surface dark:bg-surface-dim rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[101] transition-transform duration-300 ease-out transform max-h-[90dvh] flex flex-col border-t border-outline-variant/30 animate-slide-up">
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
