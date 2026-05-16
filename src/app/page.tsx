import TransactionFab from "@/components/TransactionFab";
import HeaderSearchButton from "@/components/HeaderSearchButton";
import QuickActionButtons from "@/components/QuickActionButtons";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
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

  // Fetch customers, summary, and recent transactions in parallel
  const [
    { data: customers },
    { data: summaryData, error: summaryError },
    { data: transactions }
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, phone, balance")
      .eq("shop_id", shop.id)
      .is("deleted_at", null),
    supabase.rpc("get_shop_balance_summary", { p_shop_id: shop.id }),
    supabase
      .from("transactions")
      .select("*, customers(name)")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  let totalOutstanding = 0;
  let totalAdvance = 0;
  let activeCustomers = customers?.length || 0;

  if (!summaryError && summaryData?.[0]) {
    totalOutstanding = Number(summaryData[0].total_outstanding || 0);
    totalAdvance = Number(summaryData[0].total_advance || 0);
    activeCustomers = Number(summaryData[0].active_customers || 0);
  } else {
    customers?.forEach(c => {
      const bal = Number(c.balance);
      if (bal > 0) totalOutstanding += bal;
      if (bal < 0) totalAdvance += Math.abs(bal);
    });
  }

  // Helper for formatting relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Today, ${timeString}` : `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${timeString}`;
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top AppBar with Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">Welcome back</span>
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight">
              {shop.name}
            </h1>
          </div>
        </div>
        <HeaderSearchButton />
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-8">
        
        {/* Metrics Bento Grid */}
        <section className="grid grid-cols-2 gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          {/* Primary Metric: Total Outstanding */}
          <div className="col-span-2 group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-udhar-destructive/10 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-10 h-10 rounded-full bg-udhar-destructive/10 flex items-center justify-center border border-udhar-destructive/20 shadow-sm">
                  <span className="material-symbols-outlined text-[18px] text-udhar-destructive">account_balance_wallet</span>
                </div>
                <span className="font-label-lg text-sm font-bold uppercase tracking-widest text-udhar-destructive">Total Outstanding</span>
              </div>
              <Link href="/customers?filter=DUE" className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm border border-outline-variant/30 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">arrow_forward_ios</span>
              </Link>
            </div>
            <div className="relative z-10">
              <div className="font-amount-display text-[44px] font-bold text-udhar-destructive tracking-tighter leading-none mb-2">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-on-surface-variant flex items-center gap-1.5 font-semibold uppercase tracking-widest opacity-80">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Total amount to be collected
              </div>
            </div>
          </div>

          {/* Metric: Total Advance */}
          <Link href="/customers?filter=ADVANCE" className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-36 delay-75 animate-fade-in-up opacity-0 block">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-jama-success/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5 text-on-surface-variant">
                <div className="w-8 h-8 rounded-full bg-jama-success/10 flex items-center justify-center border border-jama-success/20 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-jama-success">payments</span>
                </div>
                <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-jama-success">Advance</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
            <div className="font-amount-display text-3xl font-bold text-jama-success tracking-tight relative z-10">
              ₹{totalAdvance.toLocaleString('en-IN')}
            </div>
          </Link>

          {/* Metric: Active Customers */}
          <Link href="/customers?filter=ALL" className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-36 delay-150 animate-fade-in-up opacity-0 block">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5 text-on-surface-variant">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                </div>
                <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-primary">Customers</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
            <div className="font-amount-display text-3xl font-bold text-primary tracking-tight relative z-10">
              {activeCustomers}
            </div>
          </Link>
        </section>

        {/* Quick Actions */}
        <QuickActionButtons />

        {/* Recent Activity Section */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Recent Activity
            </h2>
            <Link href="/ledger" className="text-primary text-[11px] font-bold uppercase tracking-widest bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm border border-primary/10">
              View All
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx, index) => {
                const isJama = tx.type === 'PAYMENT';
                const customerName = tx.customers?.name || 'Unknown';
                const initials = customerName.substring(0, 2).toUpperCase();
                
                return (
                  <div 
                    key={tx.id} 
                    className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/20 border border-outline-variant/30 hover:border-outline-variant/60 rounded-[24px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    style={{ animationDelay: `${400 + (index * 50)}ms` }}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-[3px] transition-transform duration-300 group-hover:scale-110 ${isJama ? 'bg-jama-success/5 text-jama-success border-jama-success/20' : 'bg-udhar-destructive/5 text-udhar-destructive border-udhar-destructive/20'}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors">{customerName}</div>
                        <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5 font-medium">
                          <span className="material-symbols-outlined text-[14px] opacity-70">schedule</span>
                          {formatTime(tx.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end relative z-10">
                      <div className={`font-amount-display text-[20px] font-bold tracking-tight leading-none mb-1 ${isJama ? 'text-jama-success' : 'text-udhar-destructive'}`}>
                        {isJama ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border ${isJama ? 'bg-jama-success/10 text-jama-success border-jama-success/20' : 'bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20'}`}>
                        {isJama ? 'Jama' : 'Udhar'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] border-dashed shadow-sm">
                <div className="w-20 h-20 bg-surface-container/50 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-40">receipt_long</span>
                </div>
                <p className="font-semibold text-on-surface text-base mb-1">No recent transactions</p>
                <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">Tap the + button below to record your first transaction.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <TransactionFab shopId={shop.id} customers={customers || []} />
    </div>
  );
}
