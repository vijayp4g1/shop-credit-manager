import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Customer } from "@/types";

export function useCustomers(shopId?: string) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(Boolean(shopId));

  useEffect(() => {
    if (!shopId) return;
    const supabase = createClient();
    supabase
      .from("customers")
      .select("*")
      .eq("shop_id", shopId)
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (data) setCustomers(data as Customer[]);
        setLoading(false);
      });
  }, [shopId]);

  return { customers, loading };
}
