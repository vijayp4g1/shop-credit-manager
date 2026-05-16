import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TransactionFab from "@/components/TransactionFab";
import DeleteCustomerButton from "@/components/DeleteCustomerButton";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";
import EditTransactionSheet from "@/components/EditTransactionSheet";
import WhatsAppReminderSheet from "@/components/WhatsAppReminderSheet";
import DownloadStatementButton from "@/components/DownloadStatementButton";
import ClearKhataButton from "@/components/ClearKhataButton";
import AddTransactionSheet from "@/components/AddTransactionSheet";

export default async function CustomerLedger({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shops } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .limit(1);

  const shop = shops?.[0];

  if (!shop) {
    redirect("/setup");
  }

  // Fetch customer details, transactions, and all customers in parallel
  const [
    { data: customer },
    { data: transactions },
    { data: allCustomers }
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .eq("shop_id", shop.id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("customer_id", id)
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("customers")
      .select("id, name, phone, balance")
      .eq("shop_id", shop.id)
      .is("deleted_at", null)
      .order("name", { ascending: true })
  ]);

  if (!customer) {
    redirect("/customers");
  }

  const balance = Number(customer.balance);
  const isDue = balance > 0;
  const isAdvance = balance < 0;

  let totalCredit = 0;
  let totalPayment = 0;

  transactions?.forEach((tx) => {
    if (tx.type === "CREDIT") totalCredit += Number(tx.amount);
    if (tx.type === "PAYMENT") totalPayment += Number(tx.amount);
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateString = isToday
      ? "Today"
      : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return { dateString, timeString };
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">Customer Ledger</span>
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight truncate max-w-[200px]">
              {customer.name}
            </h1>
          </div>
        </div>
        <DeleteCustomerButton customerId={id} />
      </header>

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto space-y-6">
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[32px] p-6 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>

            <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-sm border-2 ${isDue ? "bg-udhar-destructive/5 text-udhar-destructive border-udhar-destructive/20" : isAdvance ? "bg-jama-success/5 text-jama-success border-jama-success/20" : "bg-surface-variant text-on-surface-variant border-outline-variant/30"}`}>
                {customer.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-headline-sm text-xl font-bold text-on-surface truncate">{customer.name}</h2>
                {customer.phone && (
                  <div className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-primary/70">call</span>
                    {customer.phone}
                  </div>
                )}
              </div>
            </div>

            {customer.address && (
              <div className="mb-6 p-3.5 bg-surface/50 backdrop-blur-sm rounded-2xl text-sm text-on-surface-variant flex items-start gap-2 relative z-10 border border-outline-variant/20">
                <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0 text-primary/70">location_on</span>
                <span className="leading-relaxed">{customer.address}</span>
              </div>
            )}

            <div className="relative z-10 flex items-end justify-between mt-2">
              <div>
                <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-80">Current Balance</div>
                <div className="flex items-baseline gap-2">
                  <div className={`font-amount-display text-[40px] leading-none font-bold tracking-tighter ${isDue ? "text-udhar-destructive" : isAdvance ? "text-jama-success" : "text-on-surface-variant"}`}>
                    ₹{Math.abs(balance).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border backdrop-blur-md mb-1 ${isDue ? "bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20" : isAdvance ? "bg-jama-success/10 text-jama-success border-jama-success/20" : "bg-surface-variant/50 text-on-surface-variant border-outline-variant/30"}`}>
                {isDue ? "Due" : isAdvance ? "Advance" : "Settled"}
              </div>
            </div>

            <div className="relative z-10 flex gap-3 mt-6 pt-5 border-t border-outline-variant/20">
              <WhatsAppReminderSheet
                customerName={customer.name}
                customerPhone={customer.phone}
                balance={balance}
                shopName={shop.name}
                totalCredit={totalCredit}
                totalPayment={totalPayment}
              />
              <DownloadStatementButton
                shopName={shop.name}
                customerName={customer.name}
                customerPhone={customer.phone}
                customerAddress={customer.address}
                balance={balance}
                transactions={(transactions || []).map(tx => ({
                  id: tx.id,
                  created_at: tx.created_at,
                  type: tx.type,
                  amount: Number(tx.amount),
                  description: tx.description,
                  payment_mode: tx.payment_mode,
                }))}
              />
            </div>

            {/* Direct Transaction Actions & Quick Buttons */}
            <div className="relative z-10 mt-2">
              <AddTransactionSheet
                customerId={id}
                shopId={shop.id}
                customerName={customer.name}
                type="CREDIT"
                balance={balance}
              />
            </div>
          </div>
        </section>

        {balance === 0 && transactions && transactions.length > 0 && (
          <ClearKhataButton
            customerId={id}
            customerName={customer.name}
            transactionCount={transactions.length}
          />
        )}

        <section className="grid grid-cols-2 gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm flex flex-col justify-between h-32 transition-all duration-300 hover:shadow-md hover:border-udhar-destructive/30 hover:-translate-y-0.5">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-udhar-destructive/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
            <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10">
              <div className="w-8 h-8 rounded-full bg-udhar-destructive/10 flex items-center justify-center border border-udhar-destructive/20 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-udhar-destructive">shopping_bag</span>
              </div>
              <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-udhar-destructive">Total Udhar</span>
            </div>
            <div className="font-amount-display text-2xl font-bold text-udhar-destructive tracking-tight relative z-10">
              ₹{totalCredit.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 p-5 rounded-[28px] shadow-sm flex flex-col justify-between h-32 transition-all duration-300 hover:shadow-md hover:border-jama-success/30 hover:-translate-y-0.5">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-jama-success/10 rounded-full blur-[30px] pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
            <div className="flex items-center gap-2.5 text-on-surface-variant relative z-10">
              <div className="w-8 h-8 rounded-full bg-jama-success/10 flex items-center justify-center border border-jama-success/20 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-jama-success">account_balance</span>
              </div>
              <span className="font-label-lg text-[11px] font-bold uppercase tracking-widest text-jama-success">Total Jama</span>
            </div>
            <div className="font-amount-display text-2xl font-bold text-jama-success tracking-tight relative z-10">
              ₹{totalPayment.toLocaleString("en-IN")}
            </div>
          </div>
        </section>

        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="font-headline-sm text-[13px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Transactions
              <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full text-[10px] ml-1">
                {transactions?.length || 0}
              </span>
            </h2>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-outline-variant/30 before:via-outline-variant/20 before:to-transparent">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx, index) => {
                const isJama = tx.type === "PAYMENT";
                const { dateString, timeString } = formatDateTime(tx.created_at);
                let runningBalance = 0;
                for (let i = transactions.length - 1; i >= 0; i--) {
                  const t = transactions[i];
                  if (t.id === tx.id) break;
                  if (t.type === "CREDIT") runningBalance += Number(t.amount);
                  else runningBalance -= Number(t.amount);
                }
                if (tx.type === "CREDIT") runningBalance += Number(tx.amount);
                else runningBalance -= Number(tx.amount);

                return (
                  <div
                    key={tx.id}
                    className="relative flex items-start gap-4 group"
                    style={{ animationDelay: `${300 + (index * 50)}ms` }}
                  >
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 mt-2 rounded-full border-[3px] border-surface bg-surface-container-lowest shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${isJama ? "text-jama-success border-jama-success/20" : "text-udhar-destructive border-udhar-destructive/20"}`}>
                       <span className="material-symbols-outlined text-[18px]">
                         {isJama ? "south_west" : "north_east"}
                       </span>
                    </div>

                    <div className="flex-1 min-w-0 bg-gradient-to-br from-surface-container-lowest to-surface-container/30 border border-outline-variant/30 rounded-[24px] p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-outline-variant/50 hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
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
                          <div className={`font-bold text-lg tracking-tight ${isJama ? "text-jama-success" : "text-udhar-destructive"}`}>
                            {isJama ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                          </div>
                          <div className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1.5 border ${
                            runningBalance > 0 
                              ? "bg-udhar-destructive/10 text-udhar-destructive border-udhar-destructive/20" 
                              : runningBalance < 0 
                              ? "bg-jama-success/10 text-jama-success border-jama-success/20" 
                              : "bg-surface-variant/50 text-on-surface-variant border-outline-variant/30 font-medium"
                          }`}>
                            Bal: ₹{Math.abs(runningBalance).toLocaleString("en-IN")} {runningBalance > 0 ? "Dr" : runningBalance < 0 ? "Cr (Adv)" : ""}
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
                            customerName={customer.name}
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
                <p className="text-sm text-on-surface-variant max-w-[220px] mx-auto opacity-80">
                  Record the first transaction for {customer.name}.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <TransactionFab shopId={shop.id} customers={allCustomers || []} preselectedCustomerId={id} />
    </div>
  );
}
