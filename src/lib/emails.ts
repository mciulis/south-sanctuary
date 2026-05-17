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
    ? `<p ${P}>To hold it, please send your deposit via Venmo to @mciulis within 48 hours. The deposit goes toward your total at pickup. Once you send it, reply to this email with a few times that work for pickup and we'll confirm one — pickup needs to happen within 72 hours of your deposit unless otherwise arranged. If we don't receive the deposit within 48 hours, we'll offer the item to the next person.</p>`
    : `<p ${P}>We'll be in touch in the next few days with details on next steps, including pickup timing and how to reserve your spot.</p>`;

  return `
      <p ${P}>Hi ${firstName},</p>

      <p ${P}>${lead}</p>

      ${depositPara}

      <p ${P}>Mike &amp; Ali<br>southsanctuarypdx.com/moving-sale</p>
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

export function renderPickupBreakdownText(items: PickupItem[]): string {
  const isSingle = items.length === 1;
  let totalPrice = 0;
  let totalDeposit = 0;
  let totalBalance = 0;
  const rows = items.map((it) => {
    const price = (it.salePrice ?? 0) * it.unitsRequested;
    const deposit = it.depositAmount ?? 0;
    const balance = Math.max(0, price - deposit);
    totalPrice += price;
    totalDeposit += deposit;
    totalBalance += balance;
    const qty = it.unitsRequested > 1 ? ` ×${it.unitsRequested}` : "";
    return { name: `${it.productName}${qty}`, price, deposit, balance };
  });

  const itemLines = rows.map((r) => {
    if (r.balance === 0) return `- ${r.name} — $${r.price} total, paid in full`;
    const parts = [`$${r.price} total`];
    if (r.deposit > 0) parts.push(`deposit paid $${r.deposit}`);
    parts.push(`balance due $${r.balance}`);
    return `- ${r.name} — ${parts.join(", ")}`;
  });

  const lines: string[] = [];
  lines.push(isSingle ? "Item:" : "Items:");
  lines.push(...itemLines);
  lines.push("");

  if (totalBalance === 0) {
    lines.push("Paid in full — nothing further due at pickup.");
  } else if (!isSingle && totalDeposit > 0) {
    lines.push(`Total: $${totalPrice}`);
    lines.push(`Deposits paid: $${totalDeposit}`);
    lines.push(`Balance due at pickup: $${totalBalance} (cash or Venmo @mciulis)`);
  } else {
    lines.push(`Balance due at pickup: $${totalBalance} (cash or Venmo @mciulis)`);
  }

  return lines.join("\n");
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

const P = `style="margin:0 0 1em 0; line-height:1.5"`;
const UL = `style="margin:0 0 1em 0; padding-left:1.4em; line-height:1.5"`;
const LI = `style="margin:0 0 0.25em 0"`;

export function renderPickupConfirmationHtml(vars: PickupEmailVars): string {
  const firstName = firstNameOf(vars.buyerName);
  const isSingle = vars.items.length === 1;

  let totalPrice = 0;
  let totalDeposit = 0;
  let totalBalance = 0;
  const itemRows = vars.items.map((it) => {
    const price = (it.salePrice ?? 0) * it.unitsRequested;
    const deposit = it.depositAmount ?? 0;
    const balance = Math.max(0, price - deposit);
    totalPrice += price;
    totalDeposit += deposit;
    totalBalance += balance;
    const qty = it.unitsRequested > 1 ? ` ×${it.unitsRequested}` : "";
    return { name: `${it.productName}${qty}`, price, deposit, balance };
  });

  const venmoNote = "cash or Venmo @mciulis";

  let balanceBlock: string;
  if (isSingle) {
    const r = itemRows[0];
    if (r.deposit > 0 && r.balance > 0) {
      balanceBlock = `
        <p ${P}><strong>${r.name}</strong> — ${money(r.price)} total. You've paid <strong>${money(r.deposit)}</strong> as a deposit.</p>
        <p ${P}>Balance due at pickup: <strong>${money(r.balance)}</strong> (${venmoNote}).</p>`;
    } else if (r.balance === 0) {
      balanceBlock = `
        <p ${P}><strong>${r.name}</strong> — ${money(r.price)} total, paid in full. Nothing further due at pickup.</p>`;
    } else {
      balanceBlock = `
        <p ${P}>Balance due at pickup for <strong>${r.name}</strong>: <strong>${money(r.balance)}</strong> (${venmoNote}).</p>`;
    }
  } else {
    const itemLines = itemRows
      .map((r) => {
        const parts = [`${money(r.price)} total`];
        if (r.deposit > 0) parts.push(`deposit paid ${money(r.deposit)}`);
        parts.push(`balance ${money(r.balance) ?? "$0"}`);
        return `<li ${LI}><strong>${r.name}</strong> — ${parts.join(", ")}</li>`;
      })
      .join("");
    const totalsLine =
      totalDeposit > 0
        ? `<p ${P}>Total: ${money(totalPrice)} · Deposits paid: <strong>${money(totalDeposit)}</strong> · Balance due at pickup: <strong>${money(totalBalance)}</strong> (${venmoNote}).</p>`
        : `<p ${P}>Total balance due at pickup: <strong>${money(totalBalance)}</strong> (${venmoNote}).</p>`;
    balanceBlock = `
      <p ${P}>Items:</p>
      <ul ${UL}>${itemLines}</ul>
      ${totalsLine}`;
  }

  return `
      <p ${P}>Hi ${firstName},</p>

      <p ${P}>You're confirmed for pickup on <strong>${formatPickupTime(vars.pickupAt)}</strong> at ${vars.pickupLocation}.</p>

      ${balanceBlock}

      <p ${P}><a href="${vars.gcalUrl}">Add to Google Calendar</a></p>

      <p ${P}>See you then,<br>Mike &amp; Ali</p>
    `;
}
