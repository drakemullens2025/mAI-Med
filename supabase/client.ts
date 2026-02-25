"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseJwt } from "./actions";
import type { Database } from "@/lib/types";

export function createSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { accessToken: async () => (await getSupabaseJwt()) || "" }
  );
}
