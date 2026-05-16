import AddCustomerSheet from "@/components/AddCustomerSheet";
import CustomerList from "@/components/CustomerList";
import HeaderSearchButton from "@/components/HeaderSearchButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Customers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch shop
  const { data: shops } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .limit(1);

  const shop = shops?.[0];

  if (!shop) {
    redirect("/setup");
  }

  // Fetch customers and shop summary in parallel
  const [
    { data: customers },
    { data: summaryData, error: summaryError }
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, phone, balance")
      .eq("shop_id", shop.id)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase.rpc("get_shop_balance_summary", { p_shop_id: shop.id })
  ]);

  let totalOutstanding = 0;
  let totalAdvance = 0;

  if (!summaryError && summaryData?.[0]) {
    totalOutstanding = Number(summaryData[0].total_outstanding || 0);
    totalAdvance = Number(summaryData[0].total_advance || 0);
  } else {
    customers?.forEach(c => {
      const bal = Number(c.balance);
      if (bal > 0) totalOutstanding += bal;
      if (bal < 0) totalAdvance += Math.abs(bal);
    });
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top AppBar with Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">Customers</span>
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight">
              {shop.name}
            </h1>
          </div>
        </div>
        <HeaderSearchButton />
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-6">
        <Suspense fallback={<div className="h-32 flex items-center justify-center text-sm font-medium text-on-surface-variant">Loading customers...</div>}>
          <CustomerList
            customers={customers || []}
            totalOutstanding={totalOutstanding}
            totalAdvance={totalAdvance}
          />
        </Suspense>
      </main>

      <AddCustomerSheet shopId={shop.id} />
    </div>
  );
}
