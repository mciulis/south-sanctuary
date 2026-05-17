import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const authHeader = request.headers.get("x-admin-password");

  if (!authHeader || authHeader !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: { key: string; value: string }[] = [];

  if (typeof body.password_protection_enabled === "boolean") {
    updates.push({ key: "password_protection_enabled", value: String(body.password_protection_enabled) });
  }
  if (typeof body.site_password === "string" && body.site_password.trim()) {
    updates.push({ key: "site_password", value: body.site_password.trim() });
  }
  if (typeof body.pickup_address === "string") {
    updates.push({ key: "pickup_address", value: body.pickup_address.trim() });
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value: update.value })
      .eq("key", update.key);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
