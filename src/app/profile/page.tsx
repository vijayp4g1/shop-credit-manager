import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

import EditShopSheet from "@/components/EditShopSheet";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch shop and shop stats
  const [
    { data: shops },
    { data: summaryData }
  ] = await Promise.all([
    supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user.id)
      .limit(1),
    supabase.rpc("get_shop_balance_summary", { p_shop_id: user.id }) // Might be null initially, handled below
  ]);

  const shop = shops?.[0];

  // Fetch true active customer stats if shop exists
  let totalOutstanding = 0;
  let activeCustomers = 0;
  
  if (shop) {
    const { data: customerData } = await supabase
      .from("customers")
      .select("balance")
      .eq("shop_id", shop.id)
      .is("deleted_at", null);
      
    if (customerData) {
      activeCustomers = customerData.length;
      customerData.forEach(c => {
        if (Number(c.balance) > 0) totalOutstanding += Number(c.balance);
      });
    }
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight">
              My Profile
            </h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-margin-mobile max-w-5xl mx-auto space-y-6">
        {/* Profile Card */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-container/20 border border-primary/20 rounded-[32px] p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden animate-fade-in-up">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl border-4 border-surface mb-4 relative z-10">
            <span className="material-symbols-outlined text-[48px]">person</span>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-jama-success rounded-full border-2 border-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] text-white">verified</span>
            </div>
          </div>
          
          <h2 className="font-headline-sm text-2xl font-bold text-on-surface relative z-10 mb-1">
            {shop?.name || "My Retail Shop"}
          </h2>
          <div className="text-sm font-medium text-on-surface-variant flex items-center justify-center gap-1.5 bg-surface-container/50 px-3 py-1 rounded-full relative z-10">
            <span className="material-symbols-outlined text-[16px]">mail</span>
            {user.email}
          </div>

          {shop && (
            <EditShopSheet shopId={shop.id} initialName={shop.name} />
          )}
        </section>

        {/* Dynamic Business Stats */}
        <section className="grid grid-cols-2 gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-[16px]">group</span>
            </div>
            <div className="font-amount-display text-2xl font-bold text-on-surface leading-none mb-1">
              {activeCustomers}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Active Customers</div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-full bg-udhar-destructive/10 flex items-center justify-center text-udhar-destructive mb-2">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </div>
            <div className="font-amount-display text-xl font-bold text-udhar-destructive leading-tight mb-1 truncate w-full">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Market Due</div>
          </div>
        </section>

        {/* Business Details */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          <h3 className="font-label-lg text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 ml-2">Business Information</h3>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Shop Name</div>
                  <div className="text-xs text-on-surface-variant font-medium">{shop?.name || "-"}</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Business Type</div>
                  <div className="text-xs text-on-surface-variant font-medium">Textile & Retail</div>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Account Status</div>
                  <div className="text-xs text-jama-success font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-jama-success inline-block"></span> Active
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-surface-container/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Current Plan</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-bold tracking-wide">KanchiVastra PRO</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
          <h3 className="font-label-lg text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 ml-2">Data & Backup</h3>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Cloud Backup</div>
                  <div className="text-xs text-on-surface-variant font-medium">Real-time sync active</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
            </div>
            
            <div className="p-4 flex items-center justify-between hover:bg-surface-container/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Export All Data</div>
                  <div className="text-xs text-on-surface-variant font-medium">Download CSV / Excel</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
          <h3 className="font-label-lg text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 ml-2">Preferences & Settings</h3>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] overflow-hidden shadow-sm">
            
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">translate</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">App Language</div>
                  <div className="text-xs text-on-surface-variant font-medium">English (Default)</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>

            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Theme</div>
                  <div className="text-xs text-on-surface-variant font-medium">System Default</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-surface-container/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm">Help & Support</div>
                  <div className="text-xs text-on-surface-variant font-medium">Contact KanchiVastra Team</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>

          </div>
        </section>

        {/* Actions */}
        <section className="pt-4 animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
          <LogoutButton />
          
          <div className="mt-8 text-center text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">local_mall</span>
            KanchiVastra Management v1.0.0
            <span className="mt-1 normal-case font-medium opacity-80">Made with ❤️ for Retailers</span>
          </div>
        </section>
      </main>
    </div>
  );
}
