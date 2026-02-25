import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { INTAKE_QUESTIONS } from "@/lib/constants";

// POST: create a new consultation
export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (user.serverMetadata as any)?.role;
  if (role !== "patient") {
    return NextResponse.json({ error: "Only patients can create consultations" }, { status: 403 });
  }

  const body = await request.json();
  const { answers, video_url, video_duration_seconds } = body as {
    answers: Record<string, string>;
    video_url: string | null;
    video_duration_seconds: number | null;
  };

  const chiefComplaint = answers.chief_complaint;
  if (!chiefComplaint) {
    return NextResponse.json({ error: "Chief complaint required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Verify active consent
  const { data: consent } = await supabase
    .from("consent_records")
    .select("id")
    .eq("patient_id", user.id)
    .gte("expires_at", new Date().toISOString())
    .limit(1)
    .single();

  if (!consent) {
    return NextResponse.json({ error: "Valid consent required. Please complete onboarding." }, { status: 403 });
  }

  // Create consultation
  const { data: consultation, error: consultError } = await supabase
    .from("consultations")
    .insert({
      patient_id: user.id,
      chief_complaint: chiefComplaint,
      video_url: video_url || null,
      video_duration_seconds: video_duration_seconds || null,
    })
    .select()
    .single();

  if (consultError) {
    return NextResponse.json({ error: consultError.message }, { status: 500 });
  }

  // Insert intake responses
  const intakeRows = INTAKE_QUESTIONS.map((q, i) => ({
    consultation_id: consultation.id,
    question_key: q.key,
    question_text: q.text,
    answer: answers[q.key] || "",
    sort_order: i,
  })).filter((r) => r.answer);

  if (intakeRows.length > 0) {
    await supabase.from("intake_responses").insert(intakeRows);
  }

  return NextResponse.json({ id: consultation.id });
}

// GET: list consultations for current user
export async function GET() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (user.serverMetadata as any)?.role;
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false });

  if (role === "patient") {
    query = query.eq("patient_id", user.id);
  } else if (role === "doctor") {
    query = query.or(`status.eq.pending,doctor_id.eq.${user.id}`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
