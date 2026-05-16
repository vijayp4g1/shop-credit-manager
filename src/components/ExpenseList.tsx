"use client";

import { useAppStore } from "@/store";
import { useMemo, useState } from "react";
import DeleteExpenseButton from "./DeleteExpenseButton";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "amount_desc" | "amount_asc">("date_desc");

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

  // 2. Metrics & KPI calculations
  const daysInFilter = useMemo(() => {
    if (timeFilter === "month") return Math.max(1, new Date().getDate());
    if (timeFilter === "30days") return 30;
    // For all time, calculate day span from oldest expense
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

  const categories = useMemo(() => {
    const list = ["ALL"];
    expenses.forEach((ex) => {
      if (!list.includes(ex.category)) {
        list.push(ex.category);
      }
    });
    return list;
  }, [expenses]);

  // 3. Search and Sort
  const finalFilteredExpenses = useMemo(() => {
    let result = timeFilteredExpenses;

    if (selectedExpenseCategory !== "ALL") {
      result = result.filter((ex) => ex.category === selectedExpenseCategory);
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
  }, [timeFilteredExpenses, selectedExpenseCategory, searchQuery, sortBy]);

  return (
    <>
      {hasTableError && (
        <div className="p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl flex items-start gap-4 text-amber-700 dark:text-amber-300 shadow-sm animate-fade-in-up">
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

      {/* Time Horizon Selector */}
      <section className="flex items-center justify-between bg-surface-container-lowest p-1.5 rounded-full border border-outline-variant/30 shadow-xs animate-fade-in-up">
        <div className="flex w-full gap-1">
          <button
            type="button"
            onClick={() => setTimeFilter("month")}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
              timeFilter === "month"
                ? "bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-sm scale-[1.02]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("30days")}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
              timeFilter === "30days"
                ? "bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-sm scale-[1.02]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("all")}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
              timeFilter === "all"
                ? "bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-sm scale-[1.02]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
            }`}
          >
            All Time
          </button>
        </div>
      </section>

      {/* Overview Hero Card */}
      <section className="animate-fade-in-up opacity-0" style={{ animationDelay: "50ms" }}>
        <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/40 border border-outline-variant/30 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-125"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-sm text-amber-500">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <span className="font-label-lg text-sm font-bold uppercase tracking-widest text-on-surface">
                {timeFilter === "month" ? "Monthly Outflow" : timeFilter === "30days" ? "30-Day Outflow" : "Total Outflow"}
              </span>
            </div>
            <button
              onClick={() => openAddExpenseModal()}
              className="px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Record
            </button>
          </div>

          <div className="relative z-10 mb-6">
            <div className="font-amount-display text-[44px] font-bold text-amber-600 dark:text-amber-400 tracking-tighter leading-none mb-2">
              ₹{currentTotalSpend.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1.5 font-semibold uppercase tracking-widest opacity-80">
              <span className="material-symbols-outlined text-[14px]">insights</span>
              {timeFilteredExpenses.length} receipts recorded in this timeframe
            </div>
          </div>

          {/* Visual Percentage Breakdown Bar */}
          {categorySummary.length > 0 && (
            <div className="relative z-10 pt-4 border-t border-outline-variant/20">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">pie_chart</span> Spend Allocation</span>
                <span>100%</span>
              </div>
              <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden flex shadow-inner border border-outline-variant/10 mb-3">
                {categorySummary.map((item) => (
                  <div
                    key={item.name}
                    title={`${item.name}: ₹${item.amount.toLocaleString("en-IN")} (${item.percentage.toFixed(1)}%)`}
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full transition-all duration-1000 ease-out hover:opacity-80"
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {categorySummary.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                    <span className="text-on-surface truncate max-w-[100px]">{item.name}</span>
                    <span className="text-on-surface-variant opacity-75">({item.percentage.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KPI Bento Box */}
      <section className="grid grid-cols-2 gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: "100ms" }}>
        <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[24px] p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px] text-blue-500">today</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Daily Average</span>
          </div>
          <div className="font-amount-display text-2xl font-bold text-on-surface tracking-tight">
            ₹{Math.round(dailyAverage).toLocaleString("en-IN")}
            <span className="text-xs font-medium text-on-surface-variant ml-1">/day</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[24px] p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px] text-red-500">trending_up</span>
            <span className="text-[10px] font-bold uppercase tracking-widest truncate">Top Drain</span>
          </div>
          <div className="font-amount-display text-lg font-bold text-udhar-destructive truncate tracking-tight">
            {topCategory.name}
            <div className="text-xs font-bold text-on-surface-variant opacity-80">
              ₹{topCategory.amount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar & Sorting Controls */}
      <section className="space-y-3 animate-fade-in-up opacity-0" style={{ animationDelay: "150ms" }}>
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-amber-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 sm:h-14 pl-11 pr-4 bg-surface/80 backdrop-blur-md border border-outline-variant/30 rounded-[20px] shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-surface-container-lowest transition-all text-xs font-semibold placeholder:text-on-surface-variant/50 outline-none"
              placeholder="Search expenses by note, category, or payment mode..."
              type="text"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-12 sm:h-14 px-3 bg-surface-container-lowest border border-outline-variant/30 rounded-[20px] text-xs font-bold text-on-surface outline-none focus:border-amber-500 shadow-sm cursor-pointer"
          >
            <option value="date_desc">Latest First</option>
            <option value="amount_desc">Highest ₹</option>
            <option value="amount_asc">Lowest ₹</option>
          </select>
        </div>

        {/* Filter Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const isSelected = selectedExpenseCategory === cat;
            const total = cat === "ALL" ? currentTotalSpend : timeFilteredExpenses.filter(e => e.category === cat).reduce((acc, curr) => acc + Number(curr.amount), 0);
            
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedExpenseCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-500 shadow-md scale-105"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {cat === "ALL" ? "dashboard" : CATEGORY_ICONS[cat] || "receipt"}
                </span>
                <span className="uppercase">{cat}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ml-1 ${isSelected ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface"}`}>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Expense List */}
      <section className="animate-fade-in-up opacity-0" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            {selectedExpenseCategory === "ALL" ? "Recorded Expenses" : `${selectedExpenseCategory} Expenses`}
            <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">
              {finalFilteredExpenses.length}
            </span>
          </h2>
        </div>

        <div className="space-y-3.5 pb-12">
          {finalFilteredExpenses.length > 0 ? (
            finalFilteredExpenses.map((ex, index) => {
              const icon = CATEGORY_ICONS[ex.category] || "receipt";
              const color = CATEGORY_COLORS[ex.category] || "#94A3B8";

              return (
                <div
                  key={ex.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/20 border border-outline-variant/30 hover:border-amber-500/40 hover:bg-surface-container/40 rounded-[28px] p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 relative z-10 min-w-0 flex-1 pr-3">
                    <div 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-[3px] shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color: color }}
                    >
                      <span className="material-symbols-outlined text-[24px]">{icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-headline-sm text-base font-bold text-on-surface group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate leading-tight">
                        {ex.category}
                      </div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-1 font-medium truncate opacity-90">
                        <span className="material-symbols-outlined text-[14px] opacity-70 shrink-0">schedule</span>
                        <span>{formatRelativeTime(ex.expense_date)}</span>
                        {ex.payment_mode && (
                          <>
                            <span className="opacity-50">•</span>
                            <span className="font-bold bg-surface-container-highest/60 px-2 py-0.5 rounded-full text-[9px] text-on-surface tracking-wider uppercase">
                              {ex.payment_mode}
                            </span>
                          </>
                        )}
                      </div>
                      {ex.description && (
                        <div className="text-xs text-on-surface-variant/80 italic mt-1 truncate pl-0.5 border-l-2 border-amber-500/30">
                          &ldquo;{ex.description}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3 relative z-10 shrink-0 pl-2">
                    <div className="flex flex-col items-end">
                      <div className="font-amount-display text-[20px] font-bold tracking-tight text-amber-600 dark:text-amber-400 leading-none mb-1.5">
                        -₹{Number(ex.amount).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-2xs">
                        Expense
                      </div>
                    </div>
                    <DeleteExpenseButton expenseId={ex.id} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] border-dashed shadow-sm">
              <div className="w-20 h-20 bg-surface-container/50 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-40">receipt_long</span>
              </div>
              <p className="font-semibold text-on-surface text-base mb-1">
                {searchQuery || selectedExpenseCategory !== "ALL" ? "No matching expenses found" : "No expenses recorded yet"}
              </p>
              <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">
                {searchQuery || selectedExpenseCategory !== "ALL" ? "Try adjusting your search query or filter tab." : "Tap the Record button above or the + icon below to log an expense."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
