"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { formatDateIST, formatTimeIST } from "@/lib";

interface Transaction {
  id: string;
  created_at: string;
  type: "CREDIT" | "PAYMENT";
  amount: number;
  description?: string | null;
  payment_mode?: string | null;
}

interface Props {
  shopName: string;
  customerName: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  balance: number;
  transactions: Transaction[];
}

export default function DownloadStatementButton({
  shopName,
  customerName,
  customerPhone,
  customerAddress,
  balance,
  transactions,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setErrorMessage("");

    if (typeof window !== "undefined" && !(window as any).html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      script.onload = () => generatePdf();
      script.onerror = () => {
        setIsDownloading(false);
        setErrorMessage("Failed to load PDF library. Please check your internet connection.");
      };
      document.head.appendChild(script);
    } else {
      generatePdf();
    }
  };

  const generatePdf = () => {
    let totalCredit = 0;
    let totalPayment = 0;

    const rowsHtml = transactions.map((tx, index) => {
      const date = formatDateIST(tx.created_at, { day: "2-digit", month: "short", year: "numeric" });
      const time = formatTimeIST(tx.created_at, { hour: "2-digit", minute: "2-digit", hour12: true });
      const isCredit = tx.type === "CREDIT";
      if (isCredit) totalCredit += Number(tx.amount);
      else totalPayment += Number(tx.amount);

      return `
        <tr style="background: ${index % 2 === 1 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 16px; text-align: left; vertical-align: middle;">
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${date}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${time}</div>
          </td>
          <td style="padding: 16px; text-align: left; vertical-align: middle;">
            <div style="font-size: 14px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <span>${tx.description ? tx.description : isCredit ? "Credit Given (Udhar)" : "Payment Received (Jama)"}</span>
              ${tx.payment_mode ? `<span style="font-size: 10px; font-weight: 700; background: #e2e8f0; color: #334155; padding: 2px 8px; border-radius: 6px; margin-left: 6px; display: inline-block;">${tx.payment_mode}</span>` : ""}
            </div>
          </td>
          <td style="padding: 16px; text-align: right; vertical-align: middle; font-size: 15px; font-weight: 800; color: #b91c1c;">${isCredit ? `₹${Number(tx.amount).toLocaleString("en-IN")}` : "-"}</td>
          <td style="padding: 16px; text-align: right; vertical-align: middle; font-size: 15px; font-weight: 800; color: #15803d;">${!isCredit ? `₹${Number(tx.amount).toLocaleString("en-IN")}` : "-"}</td>
        </tr>
      `;
    }).join("");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "800px";
    iframe.style.height = "1600px";
    iframe.style.border = "none";
    iframe.style.zIndex = "-9999";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      setIsDownloading(false);
      setErrorMessage("Browser security settings prevented PDF generation.");
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Statement</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #334155; background: #ffffff; width: 800px; padding: 48px 56px; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 28px; margin-bottom: 36px;">
          <div>
            <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -0.8px; margin: 0 0 6px 0; color: #0f172a;">${shopName}</h1>
            <div style="display: inline-block; font-size: 11px; font-weight: 800; background: #0f172a; color: #ffffff; padding: 4px 12px; border-radius: 6px; letter-spacing: 1.5px; text-transform: uppercase;">Official Ledger Statement</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.5px;">Account Statement</div>
            <div style="font-size: 12px; font-weight: 600; color: #64748b;">Generated on ${formatDateIST(new Date(), { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        </div>

        <div style="display: flex; gap: 24px; margin-bottom: 40px; width: 100%;">
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">Customer Profile</div>
            <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${customerName}</div>
            ${customerPhone ? `<div style="font-size: 13px; color: #475569; font-weight: 500;">+91 ${customerPhone}</div>` : ""}
            ${customerAddress ? `<div style="font-size: 13px; color: #475569; font-weight: 500; margin-top: 4px;">${customerAddress}</div>` : ""}
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: right;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">Outstanding Balance</div>
            <div style="display: inline-block; font-size: 28px; font-weight: 900; padding: 6px 16px; border-radius: 12px; margin-top: 4px; ${
              balance > 0 ? 'background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;' : balance < 0 ? 'background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;' : 'background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0;'
            }">
              ₹${Math.abs(balance).toLocaleString("en-IN")} ${balance > 0 ? "Dr (Due)" : balance < 0 ? "Cr (Advance)" : "Settled"}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 8px;">As of statement generation date</div>
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 36px; width: 100%;">
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff;">
                <th style="padding: 16px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; width: 25%;">Date & Time</th>
                <th style="padding: 16px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; width: 45%;">Transaction Details</th>
                <th style="padding: 16px; text-align: right; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; width: 15%;">Debit (Udhar)</th>
                <th style="padding: 16px; text-align: right; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; width: 15%;">Credit (Jama)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="4" style="text-align: center; padding: 32px; font-weight: 600; color: #94a3b8;">No recorded transactions found</td></tr>`}
            </tbody>
          </table>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; display: flex; justify-content: space-around; align-items: center; margin-bottom: 48px; width: 100%;">
          <div style="text-align: center; padding: 0 16px; border-right: 1px solid #e2e8f0; flex: 1;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Total Udhar Given</div>
            <div style="font-size: 24px; font-weight: 800; color: #b91c1c;">₹${totalCredit.toLocaleString("en-IN")}</div>
          </div>
          <div style="text-align: center; padding: 0 16px; border-right: 1px solid #e2e8f0; flex: 1;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Total Jama Received</div>
            <div style="font-size: 24px; font-weight: 800; color: #15803d;">₹${totalPayment.toLocaleString("en-IN")}</div>
          </div>
          <div style="text-align: center; padding: 0 16px; flex: 1;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Net Balance</div>
            <div style="font-size: 28px; font-weight: 900; color: #0f172a;">₹${Math.abs(balance).toLocaleString("en-IN")} <span style="font-size: 16px; font-weight: 800;">${balance > 0 ? "Dr" : balance < 0 ? "Cr" : ""}</span></div>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 32px; font-size: 12px; font-weight: 500; color: #94a3b8; width: 100%;">
          This is an official, computer-generated ledger record from Shop Credit Manager. Verify with ${shopName} for any account reconciliations or discrepancies.
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      const opt = {
        margin: 10,
        filename: `${customerName.replace(/\s+/g, "_")}_Statement.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      (window as any).html2pdf()
        .set(opt)
        .from(doc.body)
        .save()
        .then(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          setIsDownloading(false);
        })
        .catch((err: any) => {
          console.error("PDF generation error:", err);
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          setIsDownloading(false);
          setErrorMessage("Failed to generate PDF. Please try again.");
        });
    }, 500);
  };

  return (
    <>
      <button
        type="button"
        disabled={isDownloading}
        onClick={handleDownload}
        className="flex-1 py-3.5 px-4 bg-surface-container hover:bg-surface-container-high active:scale-95 text-on-surface rounded-2xl font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 border border-outline-variant/50 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
      >
        {isDownloading ? (
          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-[20px]">download</span>
        )}
        {isDownloading ? "Generating PDF..." : "Download PDF"}
      </button>

      {errorMessage && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 pointer-events-auto">
          <div
            className="fixed inset-0 bg-black/50 z-[120] transition-opacity duration-300 backdrop-blur-sm opacity-100"
            onClick={() => setErrorMessage("")}
          />
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[121] transition-all duration-300 transform scale-100 opacity-100">
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-error/20 text-error">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface text-center mb-2">Download Failed</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
