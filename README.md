# Share This Life

A $19 done-for-you story chapter made from a 10–20 minute family recording. Record (or already have) a conversation with a parent or grandparent, email it in, and within 48 hours get back a finished chapter in that person’s own words (PDF plus editable text), with one free revision.

The public site is static HTML, CSS, and JS. The thanks page (`/thanks-r8m3/`, unlinked, noindex) tells the buyer how to email the audio — or a Google Drive, Dropbox, or iCloud share link — to sharethislife@agentmail.to.

Twenty free questions and printable table cards are still on the site, as a secondary path. They don’t take the place of the chapter offer, and nothing typed there is sent to us.

A sample chapter is at `/sample/`, made from an 18-minute clip of a public-domain 1977 oral history recording of Alda Weringer (Internet Archive item [cbak_000036](https://archive.org/details/cbak_000036), Public Domain Mark 1.0).

## Orders and Stripe

Sales are paused until fulfillment is proven. `ORDERS_OPEN` in `js/config.js` is the one switch:

```
var ORDERS_OPEN = false;
```

While it is `false`, the offer box shows “Opening soon” and a waitlist mailto to sharethislife@agentmail.to. `STRIPE_PAYMENT_LINK` is left empty until Dash sets it at GO. Do not commit a live link before round 5 passes. Set `ORDERS_OPEN` to `true` only after round 5 passes and Dash has put the link in config; that restores the consent checkbox and the $19 pay button.

The consent checkbox has to be checked before that button works. After payment, Stripe redirects to `https://sharethislife.com/thanks-r8m3/`. This repo does not change Stripe.

## Hosting

GitHub Pages from `main`, custom domain `sharethislife.com`, HTTPS enforced. A noindex `/thanks-k7x2/` stub meta-refreshes to `/` so the old $7 payment-link redirect does not 404.

This domain is listed for sale: [Afternic listing](https://www.afternic.com/domain/sharethislife.com).
