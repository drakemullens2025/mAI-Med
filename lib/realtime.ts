"use client";

import { useEffect } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useRealtimeTable(
  supabase: SupabaseClient,
  table: string,
  filter: string | undefined,
  onUpdate: () => void
) {
  useEffect(() => {
    const channelName = `${table}-${filter || "all"}`;
    const config: any = {
      event: "*",
      schema: "public",
      table,
    };
    if (filter) config.filter = filter;

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", config, onUpdate)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, filter, onUpdate]);
}
