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
    <div className="min-h-screen bg-surface pb-24">
      {/* Top AppBar with Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">Shop Outflow</span>
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight">
              Expense Tracker
            </h1>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
        </div>
      </header>

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-6">
        <ExpenseList expenses={validExpenses} totalMonthlyExpenses={totalMonthlyExpenses} hasTableError={hasTableError} />
      </main>

      <AddExpenseSheet shopId={shop.id} />
    </div>
  );
}
