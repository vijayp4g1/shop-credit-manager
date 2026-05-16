import { getShopContext } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseSheet from "@/components/AddExpenseSheet";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExpensesPage() {
  const { supabase, user, shop } = await getShopContext();

  if (!user) redirect("/login");
  if (!shop) redirect("/setup");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Fetch expenses for the shop
  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("shop_id", shop.id)
    .order("expense_date", { ascending: false });

  const hasTableError = !!(error && (error.code === "42P01" || error.message?.includes("does not exist") || error.code === "PGRST116"));

  const validExpenses = expenses || [];

  // Calculate current month's total expenses
  let totalMonthlyExpenses = 0;
  validExpenses.forEach((ex) => {
    const exDate = new Date(ex.expense_date);
    if (exDate >= startOfMonth) {
      totalMonthlyExpenses += Number(ex.amount);
    }
  });

  return (
    <div className="min-h-screen bg-surface pb-36 font-sans selection:bg-amber-500/20 selection:text-amber-700">
      {/* Top AppBar with Premium Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 shadow-xs flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container transition-all active:scale-95 duration-200 flex items-center justify-center text-on-surface shadow-2xs">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest leading-none">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] text-on-surface-variant font-extrabold tracking-wider">Shop Outflow</span>
            </div>
            <h1 className="text-lg font-black text-on-surface tracking-tight leading-tight flex items-center gap-1.5">
              Expense Tracker
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] border border-amber-400/20">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
        </div>
      </header>

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-6">
        <ExpenseList expenses={validExpenses} totalMonthlyExpenses={totalMonthlyExpenses} hasTableError={hasTableError} />
      </main>

      <AddExpenseSheet shopId={shop.id} hideFab />
    </div>
  );
}
