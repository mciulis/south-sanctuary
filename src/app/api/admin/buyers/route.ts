import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Update buyer contact info across all their reservations
export async function PUT(request: NextRequest) {
  const { oldEmail, name, email, phone } = await request.json();

  const { error } = await supabaseAdmin
    .from("reservations")
    .update({ buyer_name: name, buyer_email: email, buyer_phone: phone || null })
    .eq("buyer_email", oldEmail);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (email !== oldEmail) {
    const { data: existing } = await supabaseAdmin
      .from("buyer_notes")
      .select("notes")
      .eq("buyer_email", oldEmail)
      .maybeSingle();

    await supabaseAdmin.from("buyer_notes").delete().eq("buyer_email", oldEmail);

    if (existing?.notes) {
      await supabaseAdmin.from("buyer_notes").insert({
        buyer_email: email,
        notes: existing.notes,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
