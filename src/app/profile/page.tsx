import { getShopContext } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import EditShopSheet from "@/components/EditShopSheet";
import ExportDataButton from "@/components/ExportDataButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const { supabase, user, shop } = await getShopContext();

  if (!user) redirect("/login");

  let totalOutstanding = 0;
  let totalAdvance = 0;
  let activeCustomers = 0;
  let totalTransactions = 0;

  if (shop) {
    const [{ data: customerData }, { count: txCount }] = await Promise.all([
      supabase.from("customers").select("balance").eq("shop_id", shop.id).is("deleted_at", null),
      supabase.from("transactions").select("id", { count: "exact", head: true }).eq("shop_id", shop.id),
    ]);

    if (customerData) {
      activeCustomers = customerData.length;
      customerData.forEach(c => {
        const b = Number(c.balance);
        if (b > 0) totalOutstanding += b;
        if (b < 0) totalAdvance += Math.abs(b);
      });
    }
    totalTransactions = txCount || 0;
  }

  const joinDate = new Date(user.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  const initials = (shop?.name || "KV").substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-surface pb-28">
      {/* ── Floating Back Button ────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-10 pb-3 pointer-events-none">
        <Link href="/" className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all border border-white/20 shadow-lg">
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </Link>
        {shop && (
          <div className="pointer-events-auto">
            <EditShopSheet shopId={shop.id} initialName={shop.name} />
          </div>
        )}
      </div>

      {/* ── Hero Profile Card ───────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)", minHeight: "300px" }}>
        {/* Animated background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #e94560 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #533483 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full opacity-25" style={{ background: "radial-gradient(circle, #0f3460 0%, transparent 70%)", transform: "translate(-50%, 30%)" }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* PRO Badge */}
        <div className="absolute top-14 right-4 flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 to-amber-600/20 border border-amber-400/40 backdrop-blur-md px-3 py-1.5 rounded-full">
          <span className="material-symbols-outlined text-[14px] text-amber-400">workspace_premium</span>
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pro Plan</span>
        </div>

        {/* Profile Content */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-10 px-6 text-center">
          {/* Avatar Ring */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 blur-md opacity-70 scale-110" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-black border-4 border-white/20 shadow-2xl">
              {initials}
            </div>
            {/* Online dot */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white/30 shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1.5 tracking-tight">{shop?.name || "My Shop"}</h1>
          <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium mb-5">
            <span className="material-symbols-outlined text-[13px]">mail</span>
            {user.email}
          </div>

          {/* Inline stats row inside hero */}
          <div className="flex items-center gap-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden w-full max-w-sm shadow-xl">
            <div className="flex-1 py-3 px-2 text-center border-r border-white/10">
              <div className="text-white font-black text-xl leading-none">{activeCustomers}</div>
              <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mt-0.5">Customers</div>
            </div>
            <div className="flex-1 py-3 px-2 text-center border-r border-white/10">
              <div className="text-rose-300 font-black text-xl leading-none truncate">₹{totalOutstanding >= 1000 ? (totalOutstanding/1000).toFixed(1)+"k" : totalOutstanding.toLocaleString("en-IN")}</div>
              <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mt-0.5">Market Due</div>
            </div>
            <div className="flex-1 py-3 px-2 text-center">
              <div className="text-white font-black text-xl leading-none">{totalTransactions}</div>
              <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mt-0.5">Entries</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 space-y-5 max-w-lg mx-auto">

        {/* ── Quick Actions ────────────────────────────────────────── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: "50ms" }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: "/customers", icon: "group", label: "Customers", from: "from-blue-500", to: "to-cyan-500", shadow: "shadow-blue-500/30" },
              { href: "/ledger", icon: "menu_book", label: "Ledger", from: "from-violet-500", to: "to-purple-600", shadow: "shadow-violet-500/30" },
              { href: "/reports/daily", icon: "view_day", label: "Day Book", from: "from-emerald-500", to: "to-teal-500", shadow: "shadow-emerald-500/30" },
              { href: "/expenses", icon: "receipt", label: "Expenses", from: "from-amber-500", to: "to-orange-500", shadow: "shadow-amber-500/30" },
              { href: "/reports", icon: "monitoring", label: "Reports", from: "from-pink-500", to: "to-rose-500", shadow: "shadow-pink-500/30" },
              { href: "/customers?filter=DUE", icon: "priority_high", label: "Follow-ups", from: "from-red-500", to: "to-rose-600", shadow: "shadow-red-500/30" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center gap-2.5 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-[20px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.from} ${item.to} flex items-center justify-center shadow-md ${item.shadow} transition-transform group-hover:scale-110 duration-300`}>
                  <span className="material-symbols-outlined text-[22px] text-white">{item.icon}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Account Card ─────────────────────────────────────────── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: "100ms" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 mb-3 ml-1">Account Details</p>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] overflow-hidden shadow-sm divide-y divide-outline-variant/15">
            {[
              { icon: "storefront", label: "Shop Name", value: shop?.name || "—", color: "bg-primary/10 text-primary" },
              { icon: "mail", label: "Email Address", value: user.email || "—", color: "bg-blue-500/10 text-blue-500" },
              { icon: "calendar_today", label: "Member Since", value: joinDate, color: "bg-amber-500/10 text-amber-500" },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-4 p-4 hover:bg-surface-container/30 transition-colors">
                <div className={`w-10 h-10 rounded-full ${row.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[20px]">{row.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{row.label}</p>
                  <p className="font-bold text-sm text-on-surface mt-0.5 truncate">{row.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Account Status</p>
                <p className="font-bold text-sm text-emerald-600 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Active & Verified
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Export Data ───────────────────────────────────────────── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: "150ms" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 mb-3 ml-1">Data & Backup</p>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] p-4 shadow-sm space-y-4">
            {/* Realtime sync status */}
            <div className="flex items-center gap-4 pb-4 border-b border-outline-variant/15">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">cloud_done</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-on-surface">Cloud Backup</p>
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Real-time sync active
                </p>
              </div>
              <span className="material-symbols-outlined text-emerald-500 text-[22px]">check_circle</span>
            </div>
            {shop && <ExportDataButton shopId={shop.id} shopName={shop.name} />}
          </div>
        </section>

        {/* ── Danger Zone ──────────────────────────────────────────── */}
        <section className="animate-fade-in-up opacity-0 pb-4" style={{ animationDelay: "200ms" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 mb-3 ml-1">Account</p>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] p-4 shadow-sm">
            <LogoutButton />
          </div>
          <p className="mt-6 text-center text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-widest">
            KanchiVastra Management v1.0 · Made with ❤️ for Retailers
          </p>
        </section>
      </div>
    </div>
  );
}
