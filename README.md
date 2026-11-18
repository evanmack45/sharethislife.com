# Share This Life

A $19 done-for-you story chapter made from a 10–20 minute family recording. Record (or already have) a conversation with a parent or grandparent, email it in, and within 48 hours get back a finished chapter in that person’s own words (PDF plus editable text), with one free revision.

The public site is static HTML, CSS, and JS. The thanks page (`/thanks-r8m3/`, unlinked, noindex) tells the buyer how to email the audio — or a Google Drive, Dropbox, or iCloud share link — to sharethislife@agentmail.to.

Twenty free questions and printable table cards are still on the site, as a secondary path. They don’t take the place of the chapter offer, and nothing typed there is sent to us.

## Stripe

The pay button is wired from one constant in `js/config.js`:

```
var STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cIfZ90LO2T77Oz1n93oA05";
```

The on-page consent checkbox has to be checked before the button works.

After payment, Stripe should redirect to `https://sharethislife.com/thanks-r8m3/`. (The payment link is still pointed at the preview thanks URL until someone updates it in Stripe. This repo does not change Stripe.)

## Hosting

GitHub Pages from `main`, custom domain `sharethislife.com`, HTTPS enforced. A noindex `/thanks-k7x2/` stub meta-refreshes to `/` so the old $7 payment-link redirect does not 404.

This domain is listed for sale: [Afternic listing](https://www.afternic.com/domain/sharethislife.com).
