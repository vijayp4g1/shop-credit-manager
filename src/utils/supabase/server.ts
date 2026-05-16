import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

/**
 * Cached helper: get the current user + their shop in ONE parallel round-trip.
 * `cache()` deduplicates calls within the same React render tree,
 * so calling getShopContext() twice on the same request returns the same promise.
 */
export const getShopContext = cache(async () => {
  const supabase = await createClient();
  
  // Run auth check and shop lookup in parallel
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, shop: null };

  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, owner_id')
    .eq('owner_id', user.id)
    .limit(1);

  return { supabase, user, shop: shops?.[0] ?? null };
});
