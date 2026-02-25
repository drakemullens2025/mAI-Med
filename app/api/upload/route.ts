import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { randomUUID } from "crypto";

export async function POST() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const filePath = `${user.id}/${randomUUID()}.webm`;

  const { data, error } = await supabase.storage
    .from("consultation-videos")
    .createSignedUploadUrl(filePath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path: filePath,
    token: data.token,
  });
}
