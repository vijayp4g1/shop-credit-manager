import { getShopContext } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import WhatsAppReminderButton from "@/components/WhatsAppReminderButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Reports() {
  const { supabase, user, shop } = await getShopContext();

  if (!user) redirect("/login");
  if (!shop) redirect("/setup");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Fetch customers and current month transactions in parallel
  const [
    { data: customers },
    { data: currentMonthTransactions }
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("shop_id", shop.id)
      .is("deleted_at", null),
    supabase
      .from("transactions")
      .select("*, customers!inner(name, deleted_at)")
      .eq("shop_id", shop.id)
      .is("customers.deleted_at", null)
      .gte("created_at", startOfMonth.toISOString())
  ]);
  
  let totalOutstanding = 0;
  let totalAdvance = 0;
  let topDefaulters: { id: string; name: string; phone: string | null; balance: number }[] = [];

  if (customers) {
    customers.forEach(c => {
      if (c.balance > 0) totalOutstanding += Number(c.balance);
      if (c.balance < 0) totalAdvance += Math.abs(Number(c.balance));
    });

    // Sort to get top 3 defaulters (highest due)
    topDefaulters = [...customers]
      .filter(c => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 3);
  }

  let thisMonthCredit = 0;
  let thisMonthCollection = 0;

  if (currentMonthTransactions) {
    currentMonthTransactions.forEach(tx => {
      if (tx.type === 'CREDIT') thisMonthCredit += Number(tx.amount);
      if (tx.type === 'PAYMENT') thisMonthCollection += Number(tx.amount);
    });
  }

  // Calculation for progress bars
  const totalVolume = thisMonthCredit + thisMonthCollection;
  const collectionPercent = totalVolume > 0 ? (thisMonthCollection / totalVolume) * 100 : 0;
  const creditPercent = totalVolume > 0 ? (thisMonthCredit / totalVolume) * 100 : 0;
  
  const currentMonthName = startOfMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top AppBar with Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">Analytics</span>
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight">
              Reports
            </h1>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 bg-surface-container-lowest shadow-sm border border-outline-variant/50">
          <span className="material-symbols-outlined text-on-surface-variant">ios_share</span>
        </button>
      </header>

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-6">
        
        {/* Monthly Performance Card */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          <div className="group bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary/10 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-125"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px]">calendar_month</span>
                </div>
                <h2 className="font-headline-sm text-lg font-bold text-on-surface">{currentMonthName}</h2>
              </div>
              <span className="text-[10px] font-bold bg-secondary/10 border border-secondary/20 text-secondary px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">This Month</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="bg-surface-container/30 rounded-[20px] p-4 border border-outline-variant/20 transition-colors group-hover:bg-surface-container/50">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">south_west</span>
                  Collected
                </p>
                <p className="text-[28px] font-bold text-jama-success tracking-tight leading-none">₹{thisMonthCollection.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-surface-container/30 rounded-[20px] p-4 border border-outline-variant/20 transition-colors group-hover:bg-surface-container/50">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">north_east</span>
                  Credit Given
                </p>
                <p className="text-[28px] font-bold text-udhar-destructive tracking-tight leading-none">₹{thisMonthCredit.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="relative z-10 bg-surface-container/30 rounded-[20px] p-4 border border-outline-variant/20">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">monitoring</span> Volume Ratio</span>
                <span className="bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/30">{totalVolume > 0 ? '100%' : '0%'}</span>
              </div>
              <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden flex shadow-inner border border-outline-variant/10">
                {totalVolume > 0 ? (
                  <>
                    <div style={{ width: `${collectionPercent}%` }} className="h-full bg-jama-success transition-all duration-1000 ease-out relative overflow-hidden">
                       <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                    </div>
                    <div style={{ width: `${creditPercent}%` }} className="h-full bg-udhar-destructive transition-all duration-1000 ease-out"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-outline-variant/30"></div>
                )}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-bold tracking-widest">
                <span className="text-jama-success uppercase">{collectionPercent.toFixed(0)}% Collection</span>
                <span className="text-udhar-destructive uppercase">{creditPercent.toFixed(0)}% Credit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Day Book Entry */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          <Link href="/reports/daily" className="group block relative overflow-hidden bg-gradient-to-r from-primary to-primary-container p-6 rounded-[32px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute right-0 top-0 w-32 h-full bg-white/10 skew-x-[-20deg] translate-x-10 group-hover:-translate-x-full transition-transform duration-1000"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30 backdrop-blur-md">
                  <span className="material-symbols-outlined text-[24px]">view_day</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-primary">Daily Day Book</h3>
                  <p className="text-on-primary/80 text-xs font-bold uppercase tracking-widest mt-0.5">View date-wise transactions</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Top Defaulters / Follow Ups */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">priority_high</span>
              Follow Up Priority
            </h2>
            <Link href="/customers" className="text-primary text-[11px] font-bold uppercase tracking-widest bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm border border-primary/10">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {topDefaulters.length > 0 ? (
              topDefaulters.map((c, index) => {
                const initials = c.name.substring(0, 2).toUpperCase();
                return (
                  <div 
                    key={c.id} 
                    className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/20 border border-outline-variant/30 hover:border-outline-variant/60 rounded-[24px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    style={{ animationDelay: `${200 + (index * 50)}ms` }}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-[3px] transition-transform duration-300 group-hover:scale-110 bg-udhar-destructive/5 text-udhar-destructive border-udhar-destructive/20">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors">{c.name}</h3>
                        <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5 font-medium tracking-wide">
                          <span className="material-symbols-outlined text-[14px] opacity-70">call</span>
                          {c.phone || 'No Phone'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end relative z-10">
                      <div className="font-amount-display text-[20px] font-bold tracking-tight leading-none mb-1 text-udhar-destructive">
                        ₹{Number(c.balance).toLocaleString('en-IN')}
                      </div>
                      <WhatsAppReminderButton
                        customerName={c.name}
                        customerPhone={c.phone}
                        balance={Number(c.balance)}
                        shopName={shop.name}
                        variant="compact"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] border-dashed shadow-sm">
                <div className="w-20 h-20 bg-jama-success/10 text-jama-success mx-auto rounded-full flex items-center justify-center mb-4 border border-jama-success/20">
                  <span className="material-symbols-outlined text-[36px]">verified</span>
                </div>
                <p className="font-semibold text-on-surface text-base mb-1">No Outstanding Dues</p>
                <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">All your customers are settled up!</p>
              </div>
            )}
          </div>
        </section>

        {/* Overall Health Card */}
        <section className="animate-fade-in-up opacity-0 pb-6" style={{ animationDelay: '250ms' }}>
          <div className="group bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-125"></div>
            <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
              Business Health
            </h2>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-4 rounded-[20px] bg-surface-container/40 border border-outline-variant/20 hover:bg-surface-container/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-udhar-destructive/10 flex items-center justify-center border border-udhar-destructive/20 shadow-sm">
                    <span className="material-symbols-outlined text-udhar-destructive text-[18px]">account_balance_wallet</span>
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-widest text-on-surface">Market Outstanding</span>
                </div>
                <span className="font-amount-display text-xl font-bold text-udhar-destructive tracking-tight">₹{totalOutstanding.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-[20px] bg-surface-container/40 border border-outline-variant/20 hover:bg-surface-container/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-jama-success/10 flex items-center justify-center border border-jama-success/20 shadow-sm">
                    <span className="material-symbols-outlined text-jama-success text-[18px]">payments</span>
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-widest text-on-surface">Advance Holdings</span>
                </div>
                <span className="font-amount-display text-xl font-bold text-jama-success tracking-tight">₹{totalAdvance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
