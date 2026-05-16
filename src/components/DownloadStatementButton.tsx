"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

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
  const [showPopupErrorModal, setShowPopupErrorModal] = useState(false);

  const handleDownload = () => {
    let totalCredit = 0;
    let totalPayment = 0;

    const rowsHtml = transactions.map((tx) => {
      const date = new Date(tx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const isCredit = tx.type === "CREDIT";
      if (isCredit) totalCredit += Number(tx.amount);
      else totalPayment += Number(tx.amount);

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 12px; text-align: left; font-size: 13px; color: #555;">${date}</td>
          <td style="padding: 10px 12px; text-align: left; font-size: 13px; color: #111; font-weight: 500;">
            ${tx.description ? tx.description : isCredit ? "Credit Given (Udhar)" : "Payment Received (Jama)"}
            ${tx.payment_mode ? `<span style="font-size: 11px; background: #eee; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">${tx.payment_mode}</span>` : ""}
          </td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px; color: #dc2626; font-weight: 600;">${isCredit ? `₹${Number(tx.amount).toLocaleString("en-IN")}` : "-"}</td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px; color: #16a34a; font-weight: 600;">${!isCredit ? `₹${Number(tx.amount).toLocaleString("en-IN")}` : "-"}</td>
        </tr>
      `;
    }).join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setShowPopupErrorModal(true);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${customerName} - Statement - ${shopName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222; margin: 0; padding: 32px; background: #fff; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 24px; margin-bottom: 32px; }
          .shop-title { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; margin: 0 0 4px 0; color: #111; }
          .statement-title { font-size: 14px; font-weight: 700; uppercase; tracking: 2px; color: #666; letter-spacing: 1.5px; text-transform: uppercase; }
          .meta-grid { display: flex; justify-content: space-between; margin-bottom: 32px; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .meta-title { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px; }
          .meta-value { font-size: 18px; font-weight: 800; color: #0f172a; }
          .balance-box { text-align: right; }
          .balance-due { font-size: 24px; font-weight: 900; color: ${balance > 0 ? '#dc2626' : balance < 0 ? '#16a34a' : '#0f172a'}; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          th { background: #f1f5f9; color: #334155; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
          th.right { text-align: right; }
          .summary { display: flex; justify-content: flex-end; gap: 40px; border-top: 2px solid #cbd5e1; padding-top: 20px; font-size: 14px; }
          .summary-item { text-align: right; }
          .summary-label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
          .summary-val { font-size: 18px; font-weight: 800; color: #0f172a; }
          .footer { text-align: center; margin-top: 48px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px; }
          @media print { body { padding: 0; } .meta-grid { border: none; background: #fafafa; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="shop-title">${shopName}</h1>
          <div class="statement-title">Customer Account Statement</div>
        </div>

        <div class="meta-grid">
          <div>
            <div class="meta-title">Customer Details</div>
            <div class="meta-value">${customerName}</div>
            ${customerPhone ? `<div style="color: #64748b; font-size: 13px;">+91 ${customerPhone}</div>` : ""}
            ${customerAddress ? `<div style="color: #64748b; font-size: 13px;">${customerAddress}</div>` : ""}
          </div>
          <div class="balance-box">
            <div class="meta-title">Outstanding Balance</div>
            <div class="balance-due">₹${Math.abs(balance).toLocaleString("en-IN")} ${balance > 0 ? "Dr (Due)" : balance < 0 ? "Cr (Advance)" : "Settled"}</div>
            <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Generated on ${new Date().toLocaleDateString("en-IN")}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Particulars</th>
              <th class="right">Debit (Udhar)</th>
              <th class="right">Credit (Jama)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Udhar Given</div>
            <div class="summary-val" style="color: #dc2626;">₹${totalCredit.toLocaleString("en-IN")}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Jama Received</div>
            <div class="summary-val" style="color: #16a34a;">₹${totalPayment.toLocaleString("en-IN")}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Net Balance</div>
            <div class="summary-val">₹${Math.abs(balance).toLocaleString("en-IN")} ${balance > 0 ? "Dr" : balance < 0 ? "Cr" : ""}</div>
          </div>
        </div>

        <div class="footer">
          This is a computer generated ledger statement from Shop Credit Manager. Verify with ${shopName} for any discrepancies.
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        className="flex-1 py-3 px-4 bg-surface-container hover:bg-surface-container-high active:scale-95 text-on-surface rounded-2xl font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 border border-outline-variant/50 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">print</span>
        Print Statement
      </button>

      {showPopupErrorModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 pointer-events-auto">
          <div
            className="fixed inset-0 bg-black/50 z-[120] transition-opacity duration-300 backdrop-blur-sm opacity-100"
            onClick={() => setShowPopupErrorModal(false)}
          />
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[121] transition-all duration-300 transform scale-100 opacity-100">
            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-amber-500">
              <span className="material-symbols-outlined text-[32px]">web_asset_off</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface text-center mb-2">Popup Blocked</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
              Your browser blocked the statement popup window. Please allow popups for this site to view and print customer statements.
            </p>
            <button
              type="button"
              onClick={() => setShowPopupErrorModal(false)}
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
