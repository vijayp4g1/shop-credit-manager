"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ExportDataButton({ shopId, shopName }: { shopId: string; shopName: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"transactions" | "expenses" | null>(null);
  const supabase = createClient();

  const downloadCSV = (rows: string[][], filename: string) => {
    const csv = rows.map(row =>
      row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportTransactions = async () => {
    setIsExporting(true);
    setExportType("transactions");

    const { data, error } = await supabase
      .from("transactions")
      .select("created_at, amount, type, payment_mode, description, customers(name)")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const headers = ["Date", "Time", "Customer", "Type", "Amount (₹)", "Payment Mode", "Notes"];
      const rows = data.map((tx: any) => {
        const d = new Date(tx.created_at);
        return [
          d.toLocaleDateString("en-IN"),
          d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          tx.customers?.name || "Unknown",
          tx.type === "CREDIT" ? "Udhar (Credit)" : "Jama (Payment)",
          tx.amount,
          tx.payment_mode || "CASH",
          tx.description || "",
        ];
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadCSV([headers, ...rows], `${shopName}_Transactions_${dateStr}.csv`);
    }

    setIsExporting(false);
    setExportType(null);
  };

  const exportExpenses = async () => {
    setIsExporting(true);
    setExportType("expenses");

    const { data, error } = await supabase
      .from("expenses")
      .select("expense_date, category, amount, payment_mode, description")
      .eq("shop_id", shopId)
      .order("expense_date", { ascending: false });

    if (!error && data) {
      const headers = ["Date", "Category", "Amount (₹)", "Payment Mode", "Notes"];
      const rows = data.map((ex: any) => [
        new Date(ex.expense_date).toLocaleDateString("en-IN"),
        ex.category || "General",
        ex.amount,
        ex.payment_mode || "CASH",
        ex.description || "",
      ]);
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadCSV([headers, ...rows], `${shopName}_Expenses_${dateStr}.csv`);
    }

    setIsExporting(false);
    setExportType(null);
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Export Data as CSV</div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={exportTransactions}
          disabled={isExporting}
          className="group flex items-center gap-3 p-3.5 bg-surface-container/50 border border-outline-variant/30 rounded-2xl hover:bg-blue-500/5 hover:border-blue-500/30 transition-all disabled:opacity-60 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
            {isExporting && exportType === "transactions" ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            )}
          </div>
          <div className="text-left min-w-0">
            <div className="font-bold text-xs text-on-surface">Transactions</div>
            <div className="text-[10px] text-on-surface-variant">All Udhar & Jama</div>
          </div>
        </button>

        <button
          onClick={exportExpenses}
          disabled={isExporting}
          className="group flex items-center gap-3 p-3.5 bg-surface-container/50 border border-outline-variant/30 rounded-2xl hover:bg-amber-500/5 hover:border-amber-500/30 transition-all disabled:opacity-60 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
            {isExporting && exportType === "expenses" ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">receipt</span>
            )}
          </div>
          <div className="text-left min-w-0">
            <div className="font-bold text-xs text-on-surface">Expenses</div>
            <div className="text-[10px] text-on-surface-variant">All Shop Costs</div>
          </div>
        </button>
      </div>
    </div>
  );
}
