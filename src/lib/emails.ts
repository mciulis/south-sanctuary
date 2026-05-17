export function depositFor(salePrice: number | null): number | null {
  if (!salePrice) return null;
  return Math.max(10, Math.round((salePrice * 0.25) / 10) * 10);
}

function money(n: number | null | undefined): string | null {
  if (n == null) return null;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function firstNameOf(buyerName: string): string {
  return buyerName.trim().split(" ")[0] || buyerName;
}

export interface OfferEmailVars {
  buyerName: string;
  productName: string;
  unitsRequested: number;
  salePrice: number | null;
  reason: "first_in_line" | "promoted";
}

export function renderOfferEmailHtml(vars: OfferEmailVars): string {
  const firstName = firstNameOf(vars.buyerName);
  const quantityNote = vars.unitsRequested > 1 ? ` (${vars.unitsRequested} units)` : "";
  const priceDisplay = money(vars.salePrice);
  const deposit = depositFor(vars.salePrice);
  const depositDisplay = money(deposit);

  const lead =
    vars.reason === "promoted"
      ? `Good news — you're now first in line for ${vars.productName}${quantityNote}${priceDisplay ? ` — ${priceDisplay}` : ""}${depositDisplay ? ` (deposit: ${depositDisplay})` : ""}. The previous buyer wasn't able to move forward, so the item is yours if you'd like it.`
      : `Thanks for reaching out about our moving sale. Good news — you're first in line for ${vars.productName}${quantityNote}${priceDisplay ? ` — ${priceDisplay}` : ""}${depositDisplay ? ` (deposit: ${depositDisplay})` : ""}.`;

  const depositPara = depositDisplay
    ? `<p>To hold it, please send your deposit via Venmo to @mciulis within 48 hours. The deposit goes toward your total at pickup. Once you send it, reply to this email with a few times that work for pickup and we'll confirm one — pickup needs to happen within 72 hours of your deposit unless otherwise arranged. If we don't receive the deposit within 48 hours, we'll offer the item to the next person.</p>`
    : `<p>We'll be in touch in the next few days with details on next steps, including pickup timing and how to reserve your spot.</p>`;

  return `
      <p>Hi ${firstName},</p>

      <p>${lead}</p>

      ${depositPara}

      <p>Mike &amp; Ali<br>southsanctuarypdx.com/moving-sale</p>
    `;
}

export interface PickupItem {
  productName: string;
  salePrice: number | null;
  depositAmount: number | null;
  unitsRequested: number;
}

export interface PickupEmailVars {
  buyerName: string;
  items: PickupItem[];
  pickupAt: Date;
  pickupLocation: string;
  gcalUrl: string;
}

function formatPickupTime(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/Los_Angeles",
  });
}

export function renderPickupConfirmationHtml(vars: PickupEmailVars): string {
  const firstName = firstNameOf(vars.buyerName);
  const itemPlural = vars.items.length === 1 ? "" : "s";
  let totalBalance = 0;

  const itemLines = vars.items
    .map((it) => {
      const price = (it.salePrice ?? 0) * it.unitsRequested;
      const paid = it.depositAmount ?? 0;
      const balance = Math.max(0, price - paid);
      totalBalance += balance;
      const qty = it.unitsRequested > 1 ? ` ×${it.unitsRequested}` : "";
      return `<li>${it.productName}${qty} — balance: ${money(balance) ?? "$0"}</li>`;
    })
    .join("");

  return `
      <p>Hi ${firstName},</p>

      <p>You're confirmed for pickup on <strong>${formatPickupTime(vars.pickupAt)}</strong> at ${vars.pickupLocation}.</p>

      <p>Item${itemPlural}:</p>
      <ul>${itemLines}</ul>

      <p>Total balance due at pickup: <strong>${money(totalBalance)}</strong> (cash or Venmo @mciulis).</p>

      <p><a href="${vars.gcalUrl}">Add to Google Calendar</a></p>

      <p>See you then,<br>Mike &amp; Ali</p>
    `;
}
