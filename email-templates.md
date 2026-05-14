# South Sanctuary Estate Sale — Email Templates

Placeholders to fill before sending:
- `[Name]` — recipient first name
- `[Item]` / `[Item 1]`, `[Item 2]` etc. — item name(s)
- `[PRICE]` — sale price per item
- `[AMOUNT]` — deposit per item (25% of sale price, rounded to nearest $10, min $10)
- `[TOTAL]` — sum of all deposits for that person
- `[DAY, MONTH DATE at TIME PT]` — specific deadline (72 hrs from send time for Drafts 2 & 4, 48 hrs for Drafts 3 & 5)
- `[N]` — waitlist position number
- Venmo: @mciulis — attach Mike's Venmo QR Code PDF

---

## Draft 1 — General announcement to all (send once, manually)

**Subject:** Estate Sale Update — What Happens Next

Hi [Name],

Thanks again for expressing interest in our [estate sale](https://southsanctuarypdx.com/estate-sale). Good news, we were able to move things along sooner than expected and are now targeting a pickup window of May 15 to 22.

One thing to know before you hear from us about next steps: we gave family and a few close friends first priority, so some waitlist positions have shifted.

You'll start hearing from us in the next few days with details on your specific items. If the pickup window doesn't work for you, just reply and we're happy to be flexible.

Mike & Ali
southsanctuarypdx.com/estate-sale

---

## Draft 2 — Deposit request for #1 on waitlist (manual, per person)

**Subject:** Your First Look — South Sanctuary Estate Sale

📎 Attach: Mike's Venmo QR Code for Pmt.pdf

Hi [Name],

We'd like to offer you the first opportunity to purchase the following items you expressed interest in:

- [Item 1] — $[PRICE] (deposit: $[AMOUNT])
- [Item 2] — $[PRICE] (deposit: $[AMOUNT])
- **Total deposit: $[TOTAL]**

To reserve these, please send a deposit of $[TOTAL] via Venmo to @mciulis (QR code attached). The deposit goes toward your total at pickup. Once you send it, reply to this email with a few dates and times that work for pickup and we'll confirm one.

We're targeting a pickup window of May 15 to 22. If those dates don't work for you, just reply and we're happy to be flexible. Please send the deposit by [DAY, MONTH DATE at TIME PT]. If we don't hear back by then, we'll offer the items to the next person on the list. If pickup doesn't happen by May 22, the deposit will be forfeited.

[IF APPLICABLE — only include if they have items they're not #1 on:]
You also expressed interest in the following items. Here's where you currently stand:
- [Item A] — you're #[N] on the list
- [Item B] — you're #[N] on the list

We'll be in touch if any of those become available.

Mike & Ali
southsanctuarypdx.com/estate-sale

---

## Draft 3 — Spot opened up for next person on waitlist (manual, per person)

**Subject:** Your Spot Just Opened Up — South Sanctuary Estate Sale

📎 Attach: Mike's Venmo QR Code for Pmt.pdf

Hi [Name],

The person ahead of you on the list wasn't able to move forward, which means you're now first in line for the following items:

- [Item 1] — $[PRICE] (deposit: $[AMOUNT])
- [Item 2] — $[PRICE] (deposit: $[AMOUNT])
- **Total deposit: $[TOTAL]**

To reserve these, please send a deposit of $[TOTAL] via Venmo to @mciulis (QR code attached). The deposit goes toward your total at pickup. Once you send it, reply to this email with a few dates and times that work for pickup and we'll confirm one.

We're targeting a pickup window of May 15 to 22. If those dates don't work for you, just reply and we're happy to be flexible. Since we're working through the list, please send the deposit by [DAY, MONTH DATE at TIME PT]. If we don't hear back by then, we'll reach out to the next person. If pickup doesn't happen by May 22, the deposit will be forfeited.

Mike & Ali
southsanctuarypdx.com/estate-sale

---

## Draft 4 — Automated confirmation when person is #1 on at least one item

**Subject:** Good News — South Sanctuary Estate Sale

📎 Attach: Mike's Venmo QR Code for Pmt.pdf

Hi [Name],

Thanks for reaching out about our estate sale. Good news, you're first in line for the following items:

- [Item 1] — $[PRICE] (deposit: $[AMOUNT])
- [Item 2] — $[PRICE] (deposit: $[AMOUNT])
- **Total deposit: $[TOTAL]**

To reserve these, please send a deposit of $[TOTAL] via Venmo to @mciulis (QR code attached) by [DAY, MONTH DATE at TIME PT]. The deposit goes toward your total at pickup. Once you send it, reply to this email with a few dates between May 15 and 22 that work for pickup and we'll confirm one. If we don't receive the deposit by then, we'll offer the items to the next person. If pickup doesn't happen by May 22, the deposit will be forfeited.

[IF APPLICABLE — only include if they also have items they're not #1 on:]
You also expressed interest in the following items. Here's where you currently stand:
- [Item A] — $[PRICE] (you're #[N] on the list)
- [Item B] — $[PRICE] (you're #[N] on the list)

We'll be in touch if any of those become available.

Mike & Ali
southsanctuarypdx.com/estate-sale

---

## Draft 5 — Automated confirmation when person is not #1 on any item

**Subject:** We've Got You on the List — South Sanctuary Estate Sale

Hi [Name],

Thanks for reaching out about our estate sale. We've got you on the list for the following items:

- [Item 1] — $[PRICE] (you're #[N] on the list)
- [Item 2] — $[PRICE] (you're #[N] on the list)

Our pickup window is May 15 to 22. If anyone ahead of you isn't able to move forward, we'll be in touch right away with next steps.

Mike & Ali
southsanctuarypdx.com/estate-sale

---

*Drafts 4 & 5 are sent automatically via the notify-reservation API route. Code update needed to send the correct version based on waitlist position, and to pull product price for the deposit calculation.*
