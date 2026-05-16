"use client";

import { useAppStore } from "@/store";
import { useMemo, useState, useEffect } from "react";
import DeleteExpenseButton from "./DeleteExpenseButton";
import EditExpenseModal from "./EditExpenseModal";
import { formatRelativeTime } from "@/lib";

interface Expense {
  id: string;
  shop_id: string;
  category: string;
  amount: number;
  description?: string;
  payment_mode?: string;
  expense_date: string;
  created_by: string;
  created_at: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  totalMonthlyExpenses: number;
  hasTableError?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Supplies & Packaging": "inventory_2",
  "Tea & Refreshments": "coffee",
  "Staff Salary": "work",
  "Electricity & Utilities": "electric_bolt",
  "Rent": "real_estate_agent",
  "Maintenance": "build",
  "Transportation & Freight": "local_shipping",
  "Marketing": "campaign",
  "Other": "receipt",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Staff Salary": "#3B82F6", // blue-500
  "Rent": "#8B5CF6", // purple-500
  "Electricity & Utilities": "#EAB308", // yellow-500
  "Supplies & Packaging": "#10B981", // emerald-500
  "Marketing": "#EC4899", // pink-500
  "Transportation & Freight": "#F97316", // orange-500
  "Tea & Refreshments": "#A855F7", // violet-500
  "Maintenance": "#64748B", // slate-500
  "Other": "#94A3B8", // slate-400
};

export default function ExpenseList({ expenses, totalMonthlyExpenses, hasTableError }: ExpenseListProps) {
  const { selectedExpenseCategory, setSelectedExpenseCategory, openAddExpenseModal } = useAppStore();
  const [timeFilter, setTimeFilter] = useState<"month" | "30days" | "all">("month");
  const [paymentModeFilter, setPaymentModeFilter] = useState<"ALL" | "CASH" | "UPI" | "BANK TRANSFER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "amount_desc" | "amount_asc">("date_desc");

  // Budget State
  const [budgetAmount, setBudgetAmount] = useState<number>(25000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [inputBudget, setInputBudget] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Expense State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBudget = localStorage.getItem("kanchivastra_monthly_budget");
      if (savedBudget && !isNaN(Number(savedBudget))) {
        setBudgetAmount(Number(savedBudget));
      }
    }
  }, []);

  const handleSaveBudget = () => {
    const num = Number(inputBudget);
    if (!isNaN(num) && num > 0) {
      setBudgetAmount(num);
      if (typeof window !== "undefined") {
        localStorage.setItem("kanchivastra_monthly_budget", String(num));
      }
      setIsEditingBudget(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startOfCurrentMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  // 1. Filter by Time Period
  const timeFilteredExpenses = useMemo(() => {
    return expenses.filter((ex) => {
      const exDate = new Date(ex.expense_date);
      if (timeFilter === "month") return exDate >= startOfCurrentMonth;
      if (timeFilter === "30days") return exDate >= thirtyDaysAgo;
      return true;
    });
  }, [expenses, timeFilter, startOfCurrentMonth, thirtyDaysAgo]);

  // Total spend in active time filter
  const currentTotalSpend = useMemo(() => {
    return timeFilteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [timeFilteredExpenses]);

  // Budget metrics (for 'month' view)
  const budgetPercentage = useMemo(() => {
    if (budgetAmount <= 0) return 0;
    return Math.min(100, (currentTotalSpend / budgetAmount) * 100);
  }, [currentTotalSpend, budgetAmount]);

  const budgetRemaining = Math.max(0, budgetAmount - currentTotalSpend);

  // 2. Metrics & KPI calculations
  const daysInFilter = useMemo(() => {
    if (timeFilter === "month") return Math.max(1, new Date().getDate());
    if (timeFilter === "30days") return 30;
    if (timeFilteredExpenses.length === 0) return 1;
    const oldest = new Date(timeFilteredExpenses[timeFilteredExpenses.length - 1].expense_date);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - oldest.getTime()) / (1000 * 3600 * 24));
    return Math.max(1, diffDays);
  }, [timeFilter, timeFilteredExpenses]);

  const dailyAverage = currentTotalSpend / daysInFilter;

  // Breakdown by Category in active time filter
  const categorySummary = useMemo(() => {
    const map: Record<string, number> = {};
    timeFilteredExpenses.forEach((ex) => {
      map[ex.category] = (map[ex.category] || 0) + Number(ex.amount);
    });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: currentTotalSpend > 0 ? (amount / currentTotalSpend) * 100 : 0,
        color: CATEGORY_COLORS[name] || "#94A3B8",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [timeFilteredExpenses, currentTotalSpend]);

  const topCategory = categorySummary[0] || { name: "None", amount: 0 };

  // 3. Search and Sort & Payment Mode Filter
  const finalFilteredExpenses = useMemo(() => {
    let result = timeFilteredExpenses;

    if (selectedExpenseCategory !== "ALL") {
      result = result.filter((ex) => ex.category === selectedExpenseCategory);
    }

    if (paymentModeFilter !== "ALL") {
      result = result.filter((ex) => ex.payment_mode === paymentModeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ex) =>
          ex.category.toLowerCase().includes(q) ||
          ex.description?.toLowerCase().includes(q) ||
          ex.payment_mode?.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime();
      if (sortBy === "amount_desc") return Number(b.amount) - Number(a.amount);
      if (sortBy === "amount_asc") return Number(a.amount) - Number(b.amount);
      return 0;
    });
  }, [timeFilteredExpenses, selectedExpenseCategory, paymentModeFilter, searchQuery, sortBy]);

  // Group by Date for timeline view
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, { label: string; dateKey: string; expenses: Expense[]; total: number }> = {};
    
    finalFilteredExpenses.forEach((ex) => {
      const dateObj = new Date(ex.expense_date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let label = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      if (dateObj.toDateString() === today.toDateString()) {
        label = "Today, " + dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        label = "Yesterday, " + dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      }

      const dateKey = dateObj.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = { label, dateKey, expenses: [], total: 0 };
      }
      groups[dateKey].expenses.push(ex);
      groups[dateKey].total += Number(ex.amount);
    });

    return Object.values(groups);
  }, [finalFilteredExpenses]);

  // Handle Export / Share Report
  const handleShareReport = () => {
    let report = `📊 *KANCHIVASTRA - EXPENSE REPORT*\nPeriod: ${timeFilter === "month" ? "This Month" : timeFilter === "30days" ? "Last 30 Days" : "All Time"}\nTotal Outflow: ₹${currentTotalSpend.toLocaleString("en-IN")}\nReceipts: ${timeFilteredExpenses.length}\n\n`;
    
    if (categorySummary.length > 0) {
      report += `*Category Breakdown:*\n`;
      categorySummary.forEach(c => {
        report += `• ${c.name}: ₹${c.amount.toLocaleString("en-IN")} (${c.percentage.toFixed(0)}%)\n`;
      });
      report += `\n`;
    }

    report += `*Payment Breakdown:*\n`;
    const cash = timeFilteredExpenses.filter(e => e.payment_mode === "CASH").reduce((a, b) => a + Number(b.amount), 0);
    const upi = timeFilteredExpenses.filter(e => e.payment_mode === "UPI").reduce((a, b) => a + Number(b.amount), 0);
    const bank = timeFilteredExpenses.filter(e => e.payment_mode === "BANK TRANSFER").reduce((a, b) => a + Number(b.amount), 0);
    if (cash > 0) report += `• CASH: ₹${cash.toLocaleString("en-IN")}\n`;
    if (upi > 0) report += `• UPI: ₹${upi.toLocaleString("en-IN")}\n`;
    if (bank > 0) report += `• BANK TRANSFER: ₹${bank.toLocaleString("en-IN")}\n`;

    report += `\nGenerated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      showToast("Report copied to clipboard for WhatsApp!");
    } else {
      showToast("Unable to copy to clipboard");
    }
  };

  return (
    <div className="font-sans space-y-6 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in text-xs font-bold">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {hasTableError && (
        <div className="p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl flex items-start gap-4 text-amber-700 dark:text-amber-300 shadow-xs animate-fade-in-up">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
            <span className="material-symbols-outlined text-[22px]">database</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-on-surface">Database Table Setup Required</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              The <code className="bg-surface-container font-bold px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400">expenses</code> table was not found in your Supabase project. To enable expense tracking, please execute the SQL migration script located in <code className="bg-surface-container font-bold px-1.5 py-0.5 rounded text-primary">supabase/expenses_schema.sql</code> inside your Supabase project&apos;s SQL Editor.
            </p>
          </div>
        </div>
      )}

      {/* Time Horizon Selector - Clean pill bar */}
      <section className="flex items-center justify-between bg-surface-container-lowest p-1.5 rounded-full border border-outline-variant/30 shadow-xs animate-fade-in-up">
        <div className="flex w-full gap-1">
          <button
            type="button"
            onClick={() => setTimeFilter("month")}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-black transition-all cursor-pointer text-center tracking-wider ${
              timeFilter === "month"
                ? "bg-amber-500 text-white shadow-md scale-[1.02]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 font-bold"
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("30days")}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-black transition-all cursor-pointer text-center tracking-wider ${
              timeFilter === "30days"
                ? "bg-amber-500 text-white shadow-md scale-[1.02]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 font-bold"
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("all")}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-black transition-all cursor-pointer text-center tracking-wider ${
              timeFilter === "all"
                ? "bg-amber-500 text-white shadow-md scale-[1.02]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 font-bold"
            }`}
          >
            All Time
          </button>
        </div>
      </section>

      {/* Primary Metrics Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: "50ms" }}>
        {/* Main Outflow Summary Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest via-surface-container/30 to-amber-500/10 border border-outline-variant/40 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-130"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3.5 text-on-surface-variant">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/30 shadow-xs text-amber-500 font-bold shrink-0">
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
              </div>
              <div>
                <span className="font-extrabold text-xs uppercase tracking-widest text-on-surface block leading-tight">
                  {timeFilter === "month" ? "Monthly Outflow" : timeFilter === "30days" ? "30-Day Outflow" : "Total Outflow"}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">Realtime store tracking</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShareReport}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-amber-500/20 border border-outline-variant/40 hover:border-amber-500/30 text-on-surface font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs group"
              title="Share Report"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500 group-hover:scale-110 transition-transform">share</span>
            </button>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="font-amount-display text-[42px] font-black text-amber-600 dark:text-amber-400 tracking-tighter leading-none mb-2">
              ₹{currentTotalSpend.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1.5 font-bold uppercase tracking-wider opacity-90">
              <span className="material-symbols-outlined text-[16px] text-amber-500">insights</span>
              <span>{timeFilteredExpenses.length} receipts recorded</span>
            </div>
          </div>
        </div>

        {/* Action & Budget Card / Side Bento */}
        <div className="flex flex-col gap-4">
          {/* Quick Record Button Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 p-6 rounded-[32px] shadow-md hover:shadow-lg transition-all text-white flex items-center justify-between cursor-pointer active:scale-[0.98] group" onClick={() => openAddExpenseModal()}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30 shadow-inner group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">add</span>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-tight">Record New Expense</h3>
                <p className="text-xs text-white/80 font-medium">Log bills, rent, salary or chai expenses</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[24px] text-white/80 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>

          {/* Monthly Budget Card */}
          {timeFilter === "month" ? (
            <div className="bg-surface-container-lowest/80 border border-outline-variant/40 p-5 rounded-[28px] shadow-2xs flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-on-surface mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">target</span>
                  <span>Monthly Spend Limit Budget</span>
                </div>
                {isEditingBudget ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={inputBudget}
                      onChange={(e) => setInputBudget(e.target.value)}
                      placeholder={String(budgetAmount)}
                      className="w-20 px-2 py-0.5 text-right bg-surface border border-amber-500/50 rounded font-amount-display text-xs font-bold text-amber-600 outline-none"
                      autoFocus
                    />
                    <button onClick={handleSaveBudget} className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-black cursor-pointer">Save</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setInputBudget(String(budgetAmount)); setIsEditingBudget(true); }}
                    className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline flex items-center gap-0.5 text-[11px] cursor-pointer"
                    title="Edit monthly budget"
                  >
                    <span>₹{budgetAmount.toLocaleString("en-IN")}</span>
                    <span className="material-symbols-outlined text-[12px]">edit</span>
                  </button>
                )}
              </div>

              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex shadow-inner mb-2.5">
                <div
                  style={{ width: `${budgetPercentage}%` }}
                  className={`h-full transition-all duration-1000 ${
                    budgetPercentage >= 100 ? "bg-red-500" : budgetPercentage >= 85 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>

              <div className="flex justify-between text-xs font-black">
                <span className="text-on-surface-variant">Spent: {budgetPercentage.toFixed(0)}%</span>
                <span className={budgetRemaining === 0 ? "text-error" : "text-emerald-600 dark:text-emerald-400"}>
                  {budgetRemaining === 0 ? "Over Budget!" : `₹${budgetRemaining.toLocaleString("en-IN")} left`}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest/80 border border-outline-variant/40 p-5 rounded-[28px] shadow-2xs flex items-center justify-between flex-1 text-on-surface-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-amber-500">date_range</span>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-widest text-on-surface">Timeframe Active</h4>
                  <p className="text-xs font-medium mt-0.5">Showing records for {timeFilter === "30days" ? "last 30 days" : "entire history"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KPI Bento Box */}
      <section className="grid grid-cols-2 gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: "100ms" }}>
        <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/40 rounded-[28px] p-5 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-[18px] text-blue-500">today</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-on-surface">Daily Average</span>
          </div>
          <div>
            <div className="font-amount-display text-3xl font-black text-on-surface tracking-tight">
              ₹{Math.round(dailyAverage).toLocaleString("en-IN")}
              <span className="text-xs font-bold text-on-surface-variant ml-1">/day</span>
            </div>
            <p className="text-[10px] font-semibold text-on-surface-variant mt-1">Based on {daysInFilter} active days</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/40 rounded-[28px] p-5 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-[18px] text-red-500">local_fire_department</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-on-surface truncate">Top Outflow Category</span>
          </div>
          <div>
            <div className="font-amount-display text-xl font-black text-udhar-destructive truncate tracking-tight">
              {topCategory.name}
            </div>
            <div className="text-sm font-black text-on-surface-variant opacity-90 mt-0.5">
              ₹{topCategory.amount.toLocaleString("en-IN")} <span className="text-[10px] font-bold text-on-surface-variant">({categorySummary.length > 0 ? categorySummary[0].percentage.toFixed(0) : 0}%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Search & Filter Controls */}
      <section className="space-y-3 animate-fade-in-up opacity-0" style={{ animationDelay: "150ms" }}>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-amber-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 pl-12 pr-10 bg-surface/85 backdrop-blur-md border border-outline-variant/40 rounded-2xl shadow-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-surface-container-lowest transition-all text-xs font-bold placeholder:text-on-surface-variant/50 outline-none"
              placeholder="Search expenses by note, vendor, tag, or category..."
              type="text"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-13 px-4 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl text-xs font-black text-on-surface outline-none focus:border-amber-500 shadow-xs cursor-pointer"
          >
            <option value="date_desc">Latest Date First</option>
            <option value="amount_desc">Highest Amount ₹</option>
            <option value="amount_asc">Lowest Amount ₹</option>
          </select>
        </div>

        {/* Payment Mode Horizontal Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(["ALL", "CASH", "UPI", "BANK TRANSFER"] as const).map((mode) => {
            const isSelected = paymentModeFilter === mode;
            const modeIcons: Record<string, string> = { "ALL": "filter_alt", "CASH": "payments", "UPI": "qr_code_scanner", "BANK TRANSFER": "account_balance" };
            const count = mode === "ALL" ? timeFilteredExpenses.length : timeFilteredExpenses.filter(e => e.payment_mode === mode).length;
            const total = mode === "ALL" ? currentTotalSpend : timeFilteredExpenses.filter(e => e.payment_mode === mode).reduce((a, b) => a + Number(b.amount), 0);

            return (
              <button
                type="button"
                key={mode}
                onClick={() => setPaymentModeFilter(mode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm scale-105"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{modeIcons[mode]}</span>
                <span>{mode === "ALL" ? "All Payment Modes" : mode}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ml-1 font-black ${isSelected ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface"}`}>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Spend Allocation & Category Breakdown Cards */}
      {categorySummary.length > 0 && (
        <section className="bg-surface-container-lowest/40 border border-outline-variant/30 p-4 rounded-3xl shadow-2xs animate-fade-in-up opacity-0" style={{ animationDelay: "180ms" }}>
          <div className="flex justify-between items-center text-xs font-black text-on-surface uppercase tracking-wider mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 border border-amber-500/30 shadow-2xs">
                <span className="material-symbols-outlined text-[16px]">pie_chart</span>
              </div>
              <span>Category Allocation & Filters</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedExpenseCategory !== "ALL" && (
                <button onClick={() => setSelectedExpenseCategory("ALL")} className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold hover:underline cursor-pointer">
                  Show All
                </button>
              )}
              <span className="text-[10px] font-extrabold text-on-surface-variant bg-surface-container-highest/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                {categorySummary.length} {categorySummary.length === 1 ? "Category" : "Categories"}
              </span>
            </div>
          </div>

          {/* High Fidelity Stacked Proportion Bar */}
          <div className="w-full h-5 bg-surface-container/60 backdrop-blur-sm rounded-full overflow-hidden flex p-1 gap-1 border border-outline-variant/30 shadow-inner mb-4">
            {categorySummary.map((item) => (
              <button
                type="button"
                key={item.name}
                onClick={() => setSelectedExpenseCategory(selectedExpenseCategory === item.name ? "ALL" : item.name)}
                title={`${item.name}: ₹${item.amount.toLocaleString("en-IN")} (${item.percentage.toFixed(1)}%)`}
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                className={`h-full rounded-full transition-all duration-500 hover:opacity-85 cursor-pointer relative group ${
                  selectedExpenseCategory === item.name ? "ring-2 ring-white scale-105 shadow-sm" : ""
                }`}
              />
            ))}
          </div>

          {/* Interactive Category Breakdown Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categorySummary.map((item) => {
              const isSelected = selectedExpenseCategory === item.name;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setSelectedExpenseCategory(isSelected ? "ALL" : item.name)}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]"
                      : "bg-surface/80 border-outline-variant/40 hover:bg-surface-container hover:border-outline-variant/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ${isSelected ? "border-2 border-white" : ""}`} style={{ backgroundColor: item.color }} />
                    <span className={`text-xs font-black truncate ${isSelected ? "text-white font-extrabold" : "text-on-surface"}`}>{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-black ${isSelected ? "text-white" : "text-on-surface"}`}>₹{item.amount.toLocaleString("en-IN")}</div>
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto mt-0.5 w-fit inline-block ${isSelected ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                      {item.percentage.toFixed(0)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Expense List Grouped by Date */}
      <section className="animate-fade-in-up opacity-0 space-y-4" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            {selectedExpenseCategory === "ALL" ? "Expense Transactions" : `${selectedExpenseCategory} Expenses`}
            <span className="bg-surface-container-highest/60 text-on-surface px-2.5 py-0.5 rounded-full text-[10px] ml-1 font-black">
              {finalFilteredExpenses.length} records
            </span>
          </h2>
          {(selectedExpenseCategory !== "ALL" || paymentModeFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => { setSelectedExpenseCategory("ALL"); setPaymentModeFilter("ALL"); setSearchQuery(""); }}
              className="text-[11px] font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="space-y-6 pb-20">
          {groupedExpenses.length > 0 ? (
            groupedExpenses.map((group) => (
              <div key={group.dateKey} className="space-y-3 bg-surface-container-lowest/40 rounded-3xl p-3 sm:p-4 border border-outline-variant/20 shadow-2xs">
                {/* Daily Subheader */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">calendar_today</span>
                    <span className="text-xs font-black text-on-surface tracking-wider">{group.label}</span>
                  </div>
                  <div className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    Subtotal: ₹{group.total.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {group.expenses.map((ex) => {
                    const icon = CATEGORY_ICONS[ex.category] || "receipt";
                    const color = CATEGORY_COLORS[ex.category] || "#94A3B8";

                    const paymentModePillColors: Record<string, string> = {
                      "CASH": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                      "UPI": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                      "BANK TRANSFER": "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
                    };
                    const modePillClass = ex.payment_mode ? paymentModePillColors[ex.payment_mode] || "bg-primary/10 text-primary border-primary/20" : "";

                    return (
                      <div
                        key={ex.id}
                        className="group relative overflow-hidden bg-surface hover:bg-surface-container-lowest border border-outline-variant/40 hover:border-amber-500/50 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3.5 relative z-10 min-w-0 flex-1 pr-3">
                          <div 
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-2xs border-2 shrink-0 transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color: color }}
                          >
                            <span className="material-symbols-outlined text-[22px]">{icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm sm:text-base text-on-surface group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                                {ex.category}
                              </span>
                              {ex.payment_mode && (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-widest uppercase shrink-0 ${modePillClass}`}>
                                  {ex.payment_mode}
                                </span>
                              )}
                            </div>
                            
                            {ex.description && (
                              <div className="text-xs text-on-surface-variant font-medium mt-1 truncate pl-1 border-l-2 border-amber-500/40 italic">
                                &ldquo;{ex.description}&rdquo;
                              </div>
                            )}

                            <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5 mt-1 font-semibold opacity-80">
                              <span className="material-symbols-outlined text-[12px] opacity-70">schedule</span>
                              <span>{formatRelativeTime(ex.expense_date).replace(/^(Today|Yesterday),? /, "")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3 relative z-10 shrink-0 pl-2">
                          <div className="flex flex-col items-end">
                            <div className="font-amount-display text-lg sm:text-xl font-black tracking-tight text-amber-600 dark:text-amber-400 leading-none mb-1">
                              -₹{Number(ex.amount).toLocaleString("en-IN")}
                            </div>
                            <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-80">
                              Outflow
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingExpense(ex)}
                              className="w-8 h-8 rounded-full bg-surface-container hover:bg-amber-500/15 flex items-center justify-center transition-all duration-200 shrink-0 border border-outline-variant/40 shadow-2xs cursor-pointer text-on-surface-variant hover:text-amber-600 dark:hover:text-amber-400"
                              title="Edit expense"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <DeleteExpenseButton expenseId={ex.id} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl border-dashed shadow-xs">
              <div className="w-16 h-16 bg-surface-container/50 mx-auto rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant opacity-40">receipt_long</span>
              </div>
              <p className="font-extrabold text-on-surface text-base mb-1">
                {searchQuery || selectedExpenseCategory !== "ALL" || paymentModeFilter !== "ALL" ? "No matching expenses found" : "No expenses recorded yet"}
              </p>
              <p className="text-xs font-semibold text-on-surface-variant max-w-[240px] mx-auto opacity-80 mb-4">
                {searchQuery || selectedExpenseCategory !== "ALL" || paymentModeFilter !== "ALL" ? "Try clearing your active filters or search query." : "Tap the Record button above to log your store expenses."}
              </p>
              {(searchQuery || selectedExpenseCategory !== "ALL" || paymentModeFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => { setSelectedExpenseCategory("ALL"); setPaymentModeFilter("ALL"); setSearchQuery(""); }}
                  className="px-4 py-2 bg-amber-500 text-white font-extrabold rounded-full text-xs shadow-xs hover:bg-amber-600 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Expense Modal */}
      <EditExpenseModal
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
      />
    </div>
  );
}
