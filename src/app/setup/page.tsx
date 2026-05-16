"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Setup() {
  const [shopName, setShopName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    getUser();
  }, [supabase]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("shops")
        .insert([
          { name: shopName, owner_id: userId }
        ]);
        
      if (error) throw error;
      
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error creating shop:", error);
      alert("Failed to create shop. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="flex flex-col items-center mb-10 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-container rounded-[24px] flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[40px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <h1 className="font-display-lg text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/60 text-center leading-none">
            Shop Setup
          </h1>
          <p className="font-body-md text-sm font-medium text-on-surface-variant/80 text-center mt-4 max-w-[280px]">
            Let&apos;s create your shop profile to get started.
          </p>
        </div>

        <form onSubmit={handleSetup} className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 p-8 rounded-[32px] shadow-xl shadow-black/5 border border-outline-variant/30 relative overflow-hidden backdrop-blur-xl">
          <div className="mb-8">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Shop Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant opacity-70">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </span>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-surface-container/50 border-2 border-outline-variant/30 rounded-[20px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold text-on-surface shadow-inner"
                placeholder="e.g. Royal Provisions"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !shopName.trim()}
            className="w-full py-4.5 bg-gradient-to-r from-primary to-primary/80 text-on-primary rounded-[20px] font-bold text-[13px] uppercase tracking-widest shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
