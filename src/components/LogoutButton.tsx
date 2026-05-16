"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full bg-surface-container-lowest border border-error/30 text-error p-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-sm hover:shadow-md hover:bg-error-container/20 active:scale-95 transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
      ) : (
        <span className="material-symbols-outlined">logout</span>
      )}
      <span>{isLoading ? "Logging out..." : "Log Out Securely"}</span>
    </button>
  );
}
