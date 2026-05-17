import { NextRequest, NextResponse } from "next/server";
import { buildScheduledPickup, type SchedulePickupInput } from "../shared";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SchedulePickupInput;
  const result = await buildScheduledPickup(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    recipientName: result.payload.buyerName,
    recipientEmail: result.payload.buyerEmail,
    subject: result.payload.subject,
    html: result.payload.html,
    pickupLocation: result.payload.pickupLocation,
    itemCount: result.payload.items.length,
  });
}
