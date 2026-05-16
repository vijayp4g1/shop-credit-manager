import { getShopContext } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LedgerList from "@/components/LedgerList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Ledger() {
  const { supabase, user, shop } = await getShopContext();

  if (!user) redirect("/login");
  if (!shop) redirect("/setup");

  // Fetch all transactions for active customers
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, amount, type, payment_mode, description, created_at, customers!inner(name, deleted_at)")
    .eq("shop_id", shop.id)
    .is("customers.deleted_at", null)
    .order("created_at", { ascending: false });

  // Calculate totals
  let totalJama = 0;
  let totalUdhar = 0;

  transactions?.forEach(tx => {
    if (tx.type === 'PAYMENT') totalJama += Number(tx.amount);
    if (tx.type === 'CREDIT') totalUdhar += Number(tx.amount);
  });

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top AppBar with Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">History</span>
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight">
              Global Ledger
            </h1>
          </div>
        </div>
      </header>

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-6">
        
        {/* Stats Overview */}
        <section className="space-y-4 animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          
          {/* Net Market Balance Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary-container/30 border border-primary/20 p-6 rounded-[32px] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-container/30 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-3 relative z-10 border border-primary/20 shadow-inner">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            
            <span className="font-label-lg text-xs font-bold uppercase tracking-widest text-on-surface-variant relative z-10 mb-1">
              Net Market Balance
            </span>
            <div className={`font-amount-display text-4xl font-black tracking-tighter relative z-10 ${totalUdhar - totalJama >= 0 ? 'text-udhar-destructive' : 'text-jama-success'}`}>
              ₹{Math.abs(totalUdhar - totalJama).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-2 bg-surface-container/50 px-3 py-1 rounded-full relative z-10 mb-4">
              {totalUdhar - totalJama >= 0 ? 'People owe you' : 'You owe people'}
            </div>

            {/* Visual Ratio Bar */}
            {totalUdhar + totalJama > 0 && (
              <div className="w-full max-w-xs relative z-10 space-y-1.5 mt-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-udhar-destructive">{Math.round((totalUdhar / (totalUdhar + totalJama)) * 100)}% Udhar</span>
                  <span className="text-jama-success">{Math.round((totalJama / (totalUdhar + totalJama)) * 100)}% Jama</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-udhar-destructive transition-all duration-1000 ease-out"
                    style={{ width: `${(totalUdhar / (totalUdhar + totalJama)) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-jama-success transition-all duration-1000 ease-out"
                    style={{ width: `${(totalJama / (totalUdhar + totalJama)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-udhar-destructive/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
              <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10">
                <div className="w-8 h-8 rounded-full bg-udhar-destructive/10 flex items-center justify-center border border-udhar-destructive/20 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-udhar-destructive">shopping_bag</span>
                </div>
                <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-udhar-destructive leading-tight">Total<br/>Udhar</span>
              </div>
              <div className="font-amount-display text-2xl font-bold text-udhar-destructive tracking-tight relative z-10">
                ₹{totalUdhar.toLocaleString('en-IN')}
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-jama-success/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
              <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10">
                <div className="w-8 h-8 rounded-full bg-jama-success/10 flex items-center justify-center border border-jama-success/20 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-jama-success">payments</span>
                </div>
                <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-jama-success leading-tight">Total<br/>Jama</span>
              </div>
              <div className="font-amount-display text-2xl font-bold text-jama-success tracking-tight relative z-10">
                ₹{totalJama.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </section>

        {/* Transactions List */}
        <LedgerList initialTransactions={transactions || []} />
      </main>
    </div>
  );
}
