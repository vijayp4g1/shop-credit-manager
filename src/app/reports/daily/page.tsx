import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DailyDayBook from "@/components/DailyDayBook";

export const dynamic = "force-dynamic";

export default async function DailyReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch shop
  const { data: shops } = await supabase
    .from("shops")
    .select("id, name")
    .eq("owner_id", user.id)
    .limit(1);

  const shop = shops?.[0];

  if (!shop) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-margin-mobile h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">Reports</span>
            <h1 className="font-headline-sm text-base font-bold text-on-surface leading-tight">
              Day Book
            </h1>
          </div>
        </div>
      </header>

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto">
        <DailyDayBook shopId={shop.id} />
      </main>
    </div>
  );
}
