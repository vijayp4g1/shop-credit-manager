import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";
import EditTransactionSheet from "@/components/EditTransactionSheet";

export default async function Ledger() {
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

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, customers(name)")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  // Helper for formatting dates and times
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = isToday ? 'Today' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return { dateString, timeString };
  };

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
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
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
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 bg-surface-container-lowest shadow-sm border border-outline-variant/50">
          <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
        </button>
      </header>

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-6">
        
        {/* Stats Overview */}
        {/* Stats Overview */}
        <section className="grid grid-cols-2 gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-udhar-destructive/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
            <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10">
              <div className="w-8 h-8 rounded-full bg-udhar-destructive/10 flex items-center justify-center border border-udhar-destructive/20 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-udhar-destructive">shopping_bag</span>
              </div>
              <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-udhar-destructive">Total Udhar Given</span>
            </div>
            <div className="font-amount-display text-2xl font-bold text-udhar-destructive tracking-tight relative z-10">
              ₹{totalUdhar.toLocaleString('en-IN')}
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-jama-success/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
            <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10">
              <div className="w-8 h-8 rounded-full bg-jama-success/10 flex items-center justify-center border border-jama-success/20 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-jama-success">account_balance</span>
              </div>
              <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-jama-success">Total Jama Received</span>
            </div>
            <div className="font-amount-display text-2xl font-bold text-jama-success tracking-tight relative z-10">
              ₹{totalJama.toLocaleString('en-IN')}
            </div>
          </div>
        </section>

        {/* Transactions List */}
        {/* Transactions List */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              All Transactions
              <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full text-[10px] ml-1">
                {transactions?.length || 0}
              </span>
            </h2>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-outline-variant/30 before:via-outline-variant/20 before:to-transparent">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx, index) => {
                const isJama = tx.type === 'PAYMENT';
                const customerName = tx.customers?.name || 'Unknown Customer';
                const { dateString, timeString } = formatDateTime(tx.created_at);

                return (
                  <div 
                    key={tx.id} 
                    className="relative flex items-start gap-4 group"
                    style={{ animationDelay: `${200 + (index * 50)}ms` }}
                  >
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 mt-2 rounded-full border-[3px] border-surface bg-surface-container-lowest shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${isJama ? 'text-jama-success border-jama-success/20' : 'text-udhar-destructive border-udhar-destructive/20'}`}>
                       <span className="material-symbols-outlined text-[18px]">
                         {isJama ? "south_west" : "north_east"}
                       </span>
                    </div>

                    <div className="flex-1 min-w-0 bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[24px] p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-outline-variant/50 hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                           <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-0.5">{customerName}</h3>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                             <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                             {dateString} • {timeString}
                           </div>
                           {tx.description ? (
                             <div className="text-sm font-medium text-on-surface line-clamp-2 mt-1">
                               {tx.description}
                             </div>
                           ) : (
                             <div className="text-sm font-medium text-on-surface mt-1 italic opacity-50">
                               No description
                             </div>
                           )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`font-bold text-lg tracking-tight ${isJama ? 'text-jama-success' : 'text-udhar-destructive'}`}>
                            {isJama ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                          </div>
                          <div className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border mt-1.5 inline-block ${isJama ? 'bg-jama-success/10 text-jama-success border-jama-success/20' : 'bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20'}`}>
                            {isJama ? 'Jama' : 'Udhar'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/10">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                          <span className="material-symbols-outlined text-[14px]">
                            {tx.payment_mode === "UPI" ? "qr_code_scanner" : tx.payment_mode === "CASH" ? "payments" : "credit_card"}
                          </span>
                          {tx.payment_mode || "CASH"}
                        </div>
                        <div className="flex items-center gap-1 opacity-100 transition-opacity">
                          <EditTransactionSheet
                            transactionId={tx.id}
                            customerName={customerName}
                            type={tx.type}
                            amount={Number(tx.amount)}
                            paymentMode={tx.payment_mode}
                            description={tx.description}
                          />
                          <DeleteTransactionButton
                            transactionId={tx.id}
                          />
                        </div>
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
                <p className="font-semibold text-on-surface text-base mb-1">No transactions yet</p>
                <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">Your ledger will populate as you record Jama and Udhar.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
