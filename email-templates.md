# South Sanctuary Moving Sale — Email Templates

Placeholders to fill before sending:
- `[Name]` — recipient first name
- `[Item]` / `[Item 1]`, `[Item 2]` etc. — item name(s)
- `[PRICE]` — sale price per item
- `[AMOUNT]` — deposit per item (25% of sale price, rounded to nearest $10, min $10)
- `[TOTAL]` — sum of all deposits for that person
- `[DAY, MONTH DATE at TIME PT]` — specific deadline. First Look & Next in Line use fixed dates baked into the template (Tue May 19 noon PT for First Look, Thu May 21 noon PT for Next in Line). Auto-Confirm (Top Pick) uses a rolling 48-hr deposit window + 72-hr pickup-after-deposit window. Auto-Confirm (Waitlisted) has no deposit deadline.
- `[N]` — waitlist position number
- Venmo: @mciulis — attach Mike's Venmo QR Code PDF

---

## Announcement — General announcement to all (send once, manually)

**Subject:** Next Steps for Your Items — South Sanctuary Moving Sale

Hi [Name],

Thanks again for expressing interest in our [moving sale](https://southsanctuarypdx.com/moving-sale). Our pickup window is Friday May 22 and Saturday May 23.

A quick heads-up: a few waitlist positions shifted as we finalized the list.

You'll hear from us shortly with details on your specific items. If those dates don't work for you, just reply and we're happy to be flexible.

Mike & Ali
southsanctuarypdx.com/moving-sale

---

## First Look — Deposit request for #1 on waitlist (manual, per person)

**Subject:** You're first in line — South Sanctuary Moving Sale

📎 Attach: Mike's Venmo QR Code for Pmt.pdf

Hi [Name],

Great news — you're first in line for the items you expressed interest in:

- [Item 1] — $[PRICE] (deposit: $[AMOUNT])
- [Item 2] — $[PRICE] (deposit: $[AMOUNT])
- **Total deposit: $[TOTAL]**

To reserve these, please send your deposit via Venmo to @mciulis (QR code attached). The deposit goes toward your total at pickup. Once you send it, reply with a few times that work for pickup on Friday, May 22 or Saturday, May 23 and we'll confirm one. If those dates don't work for you, just reply and we're happy to be flexible.

Please send the deposit by **Tuesday, May 19 at noon PT**. If we don't hear back by then, we'll offer the items to the next person on the list. If pickup doesn't happen within the agreed timeframe, the deposit will be forfeited.

[IF APPLICABLE — only include if they have items they're not #1 on:]
You also expressed interest in the following items. Here's where you currently stand:
- [Item A] — you're #[N] on the list
- [Item B] — you're #[N] on the list

We'll be in touch if any of those become available.

If there are other items you're interested in and want to see in person, we're hosting a moving sale open house on Sunday, May 24 from 1-4pm.

Mike & Ali
southsanctuarypdx.com/moving-sale

---

## Next in Line — Spot opened up for next person on waitlist (manual, per person)

**Subject:** Your spot just opened up — South Sanctuary Moving Sale

📎 Attach: Mike's Venmo QR Code for Pmt.pdf

Hi [Name],

The person ahead of you on the list wasn't able to move forward, which means you're now first in line for the following items:

- [Item 1] — $[PRICE] (deposit: $[AMOUNT])
- [Item 2] — $[PRICE] (deposit: $[AMOUNT])
- **Total deposit: $[TOTAL]**

To reserve these, please send your deposit via Venmo to @mciulis (QR code attached). The deposit goes toward your total at pickup. Once you send it, reply with a few times that work for pickup on Friday, May 22 or Saturday, May 23 and we'll confirm one. If those dates don't work for you, just reply and we're happy to be flexible.

Since we're working through the list, please send the deposit by **Thursday, May 21 at noon PT**. If we don't hear back by then, we'll reach out to the next person. If pickup doesn't happen within the agreed timeframe, the deposit will be forfeited.

If there are other items you're interested in and want to see in person, we're hosting a moving sale open house on Sunday, May 24 from 1-4pm.

Mike & Ali
southsanctuarypdx.com/moving-sale

---

## Auto-Confirm (Top Pick) — Automated confirmation when person is #1 on the item they reserved

**Subject:** You're first in line — South Sanctuary Moving Sale

📎 Attach: Mike's Venmo QR Code for Pmt.pdf

Hi [Name],

Thanks for reaching out about our moving sale. Good news — you're first in line for [Item] — $[PRICE] (deposit: $[AMOUNT]).

To hold it, please send your deposit via Venmo to @mciulis (QR code attached) within 48 hours. The deposit goes toward your total at pickup. Once you send it, reply with a few times that work for pickup and we'll confirm one — pickup needs to happen within 72 hours of your deposit unless otherwise arranged. If we don't receive the deposit within 48 hours, we'll offer the item to the next person.

If there are other items you're interested in and want to see in person, we're hosting a moving sale open house on Sunday, May 24 from 1-4pm.

Mike & Ali
southsanctuarypdx.com/moving-sale

---

## Auto-Confirm (Waitlisted) — Automated confirmation when person is not #1 on the item they reserved

**Subject:** You're on the list — South Sanctuary Moving Sale

Hi [Name],

Thanks for reaching out about our moving sale. We've got you on the list for [Item] — you're currently #[N] in line.

We're working through the list now — if anyone ahead of you isn't able to move forward, we'll be in touch right away with next steps.

We're also hosting a moving sale open house on Sunday, May 24 from 1-4pm — feel free to stop by to see this item or anything else that catches your eye. Items that haven't been claimed by then will be available.

Mike & Ali
southsanctuarypdx.com/moving-sale

---

*Auto-Confirm (Top Pick) and Auto-Confirm (Waitlisted) are sent automatically via the notify-reservation API route. Code update needed to send the correct version based on waitlist position, and to pull product price for the deposit calculation.*
