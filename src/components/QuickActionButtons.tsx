"use client";

import Link from "next/link";
import { useAppStore } from "@/store";

export default function QuickActionButtons() {
  const { openTransactionModal } = useAppStore();

  return (
    <section className="animate-fade-in-up opacity-0" style={{ animationDelay: "200ms" }}>
      <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">bolt</span>
        Quick Actions
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {/* Add Customer */}
        <Link href="/customers" className="flex flex-col items-center gap-2.5 group">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 group-hover:border-primary/50 group-hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></div>
            <span className="material-symbols-outlined text-primary text-[28px] relative z-10 group-hover:scale-110 transition-transform duration-300 font-normal">person_add</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center leading-tight">Add<br />Customer</span>
        </Link>

        {/* Record Advance (Take Jama) */}
        <button
          onClick={() => openTransactionModal("JAMA")}
          className="flex flex-col items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 group-hover:border-jama-success/50 group-hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-jama-success/0 group-hover:bg-jama-success/5 transition-colors duration-300"></div>
            <span className="material-symbols-outlined text-jama-success text-[28px] relative z-10 group-hover:scale-110 transition-transform duration-300 font-normal">account_balance</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center leading-tight">Record<br />Advance</span>
        </button>

        {/* Give Udhar */}
        <button
          onClick={() => openTransactionModal("UDHAR")}
          className="flex flex-col items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 group-hover:border-udhar-destructive/50 group-hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-udhar-destructive/0 group-hover:bg-udhar-destructive/5 transition-colors duration-300"></div>
            <span className="material-symbols-outlined text-udhar-destructive text-[28px] relative z-10 group-hover:scale-110 transition-transform duration-300 font-normal">shopping_bag</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center leading-tight">Give<br />Udhar</span>
        </button>

        {/* View Reports */}
        <Link href="/reports" className="flex flex-col items-center gap-2.5 group">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 group-hover:border-secondary/50 group-hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 transition-colors duration-300"></div>
            <span className="material-symbols-outlined text-secondary text-[28px] relative z-10 group-hover:scale-110 transition-transform duration-300 font-normal">analytics</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center leading-tight">View<br />Reports</span>
        </Link>
      </div>
    </section>
  );
}
