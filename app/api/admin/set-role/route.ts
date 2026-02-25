import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { OKLAHOMA_CONSENT_TEXT } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { role, full_name, phone, date_of_birth, license_number } = body as {
    role: UserRole;
    full_name: string;
    phone?: string;
    date_of_birth?: string;
    license_number?: string;
  };

  if (!role || !full_name || !["patient", "doctor"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (role === "doctor" && !license_number) {
    return NextResponse.json({ error: "License number required for doctors" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Create profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    role,
    full_name,
    phone: phone || null,
    date_of_birth: date_of_birth || null,
    license_number: license_number || null,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Record consent for patients
  if (role === "patient") {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await supabase.from("consent_records").insert({
      patient_id: user.id,
      consent_text: OKLAHOMA_CONSENT_TEXT,
      expires_at: expiresAt.toISOString(),
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    });
  }

  // Set role in Stack Auth metadata
  await user.update({
    displayName: full_name,
    serverMetadata: { role },
    clientReadOnlyMetadata: { role, onboarded: true },
  });

  return NextResponse.json({ success: true });
}
