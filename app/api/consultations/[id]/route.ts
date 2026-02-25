import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { createServerSupabaseClient } from "@/supabase/server";

// GET: get consultation detail with intake + prescriptions
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  const { data: consultation, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !consultation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check access
  const role = (user.serverMetadata as any)?.role;
  if (role === "patient" && consultation.patient_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (role === "doctor" && consultation.status !== "pending" && consultation.doctor_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch related data
  const [intakeRes, prescriptionRes, patientRes] = await Promise.all([
    supabase.from("intake_responses").select("*").eq("consultation_id", id).order("sort_order"),
    supabase.from("prescriptions").select("*").eq("consultation_id", id),
    supabase.from("profiles").select("*").eq("id", consultation.patient_id).single(),
  ]);

  // Generate signed video URL if exists
  let videoSignedUrl = null;
  if (consultation.video_url) {
    const { data: urlData } = await supabase.storage
      .from("consultation-videos")
      .createSignedUrl(consultation.video_url, 3600);
    videoSignedUrl = urlData?.signedUrl || null;
  }

  return NextResponse.json({
    ...consultation,
    intake_responses: intakeRes.data || [],
    prescriptions: prescriptionRes.data || [],
    patient: patientRes.data || null,
    video_signed_url: videoSignedUrl,
  });
}

// PATCH: update consultation (accept, prescribe, etc.)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (user.serverMetadata as any)?.role;
  const body = await request.json();
  const supabase = createServerSupabaseClient();

  // Get current consultation
  const { data: consultation } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (!consultation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Doctor accepting
  if (body.action === "accept" && role === "doctor") {
    if (consultation.status !== "pending") {
      return NextResponse.json({ error: "Already accepted" }, { status: 409 });
    }
    const { error } = await supabase
      .from("consultations")
      .update({
        doctor_id: user.id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending"); // optimistic lock

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Doctor marking in_review
  if (body.action === "start_review" && role === "doctor" && consultation.doctor_id === user.id) {
    await supabase
      .from("consultations")
      .update({ status: "in_review", updated_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  // Doctor prescribing
  if (body.action === "prescribe" && role === "doctor" && consultation.doctor_id === user.id) {
    const { prescription, note } = body;
    if (!prescription) {
      return NextResponse.json({ error: "Prescription data required" }, { status: 400 });
    }

    await supabase.from("prescriptions").insert({
      consultation_id: id,
      doctor_id: user.id,
      medication_name: prescription.medication_name,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      quantity: prescription.quantity || null,
      refills: prescription.refills || 0,
      pharmacy_notes: prescription.pharmacy_notes || null,
      notes_to_patient: prescription.notes_to_patient || null,
    });

    if (note) {
      await supabase.from("doctor_notes").insert({
        consultation_id: id,
        doctor_id: user.id,
        note_text: note,
      });
    }

    await supabase
      .from("consultations")
      .update({ status: "prescribed", updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ success: true });
  }

  // Doctor requesting follow-up
  if (body.action === "follow_up" && role === "doctor" && consultation.doctor_id === user.id) {
    if (body.note) {
      await supabase.from("doctor_notes").insert({
        consultation_id: id,
        doctor_id: user.id,
        note_text: body.note,
      });
    }
    await supabase
      .from("consultations")
      .update({
        status: "follow_up",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  // Complete
  if (body.action === "complete" && role === "doctor" && consultation.doctor_id === user.id) {
    await supabase
      .from("consultations")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  // Patient cancel
  if (body.action === "cancel" && role === "patient" && consultation.patient_id === user.id) {
    if (consultation.status !== "pending") {
      return NextResponse.json({ error: "Can only cancel pending consultations" }, { status: 400 });
    }
    await supabase
      .from("consultations")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
