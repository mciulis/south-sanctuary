import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildScheduledPickup, type SchedulePickupInput } from "./shared";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SchedulePickupInput;
  const result = await buildScheduledPickup(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { payload } = result;

  const updatePatch: Record<string, unknown> = {
    pickup_state: "scheduled",
    pickup_at: payload.pickupAt.toISOString(),
  };
  if (payload.pickupLocationOverride !== undefined) {
    updatePatch.pickup_location = payload.pickupLocationOverride || null;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("reservations")
    .update(updatePatch)
    .in("id", payload.reservationIds);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "mike@southsanctuarypdx.com",
    replyTo: [process.env.NOTIFICATION_EMAIL!],
    to: payload.buyerEmail,
    bcc: [process.env.NOTIFICATION_EMAIL!],
    subject: payload.subject,
    html: payload.html,
  });

  return NextResponse.json({ ok: true, gcalUrl: payload.gcalUrl, itemCount: payload.items.length });
}
