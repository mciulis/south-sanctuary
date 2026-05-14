// One-time: swap waitlist positions for Reed Hoffman and Owen Loh on the Couch.
// Run: node --env-file=.env.local scripts/swap-couch-waitlist.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error("Missing env vars NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY);

const { data: products, error: pErr } = await supabase
  .from("products")
  .select("id, name")
  .ilike("name", "%couch%");
if (pErr) throw pErr;
if (products.length !== 1) {
  console.error("Expected exactly 1 couch product, found:", products);
  process.exit(1);
}
const couch = products[0];
console.log(`Couch product: #${couch.id} ${couch.name}`);

const { data: reservations, error: rErr } = await supabase
  .from("reservations")
  .select("id, buyer_name, buyer_email, waitlist_position, status")
  .eq("product_id", couch.id)
  .order("waitlist_position", { ascending: true });
if (rErr) throw rErr;

console.log("\nCurrent couch waitlist:");
for (const r of reservations) {
  console.log(`  #${r.waitlist_position} ${r.buyer_name} <${r.buyer_email}> [${r.status}]`);
}

const reed = reservations.find(r => r.buyer_name.toLowerCase().includes("reed"));
const owen = reservations.find(r => r.buyer_name.toLowerCase().includes("owen"));
if (!reed || !owen) {
  console.error("Could not find Reed and/or Owen on couch waitlist.");
  process.exit(1);
}
console.log(`\nReed: #${reed.waitlist_position} (id ${reed.id})`);
console.log(`Owen: #${owen.waitlist_position} (id ${owen.id})`);

const reedPos = reed.waitlist_position;
const owenPos = owen.waitlist_position;

// Park Reed at a temp position to avoid any unique-constraint collision.
const TEMP = -1;
let { error } = await supabase.from("reservations").update({ waitlist_position: TEMP }).eq("id", reed.id);
if (error) throw error;
({ error } = await supabase.from("reservations").update({ waitlist_position: reedPos }).eq("id", owen.id));
if (error) throw error;
({ error } = await supabase.from("reservations").update({ waitlist_position: owenPos }).eq("id", reed.id));
if (error) throw error;

const { data: after, error: aErr } = await supabase
  .from("reservations")
  .select("buyer_name, waitlist_position, status")
  .eq("product_id", couch.id)
  .order("waitlist_position", { ascending: true });
if (aErr) throw aErr;

console.log("\nUpdated couch waitlist:");
for (const r of after) {
  console.log(`  #${r.waitlist_position} ${r.buyer_name} [${r.status}]`);
}
