# Share This Life — build log

Times are America/Chicago (CST, UTC-6).

## 2026-11-14

### Plan
Read `/workspace/dash/domains/scorecard-2026-11-14.md` (sharethislife.com: "Ask them before the holidays."). Built a first version as a plain static site (HTML/CSS/JS, no build step, no frameworks, no trackers, no external fonts or CDNs).

### Sale-page link
Checked `https://www.afternic.com/domain/sharethislife.com` with curl: HTTP 200, no redirect. The footer uses that URL. Did not fall back to solsticedomains.com.

### What shipped
- Home, interview, printable holiday table cards (16 cards, print CSS), printable keepsake book of answers, 404, robots.txt, favicon (SVG + ICO), apple-touch-icon, Open Graph image and tags, privacy note (answers never leave the device).
- Pick a relative (name + relationship). Seven chapters: childhood, family, love, work, hard times, lessons, wishes. 100 original questions, written for this site (not copied from Etsy or StoryWorth). Free tier: 20 questions, fully usable end to end, including printing those answers. Paid tier ($7): all 100 questions plus the book layout.
- Answers auto-save to `localStorage` under `sharethislife.v1`. No accounts.
- Dictation via the Web Speech API where the browser supports it; the Dictate button is omitted where it does not.
- Pay button is a placeholder. The one-line swap is `STRIPE_PAYMENT_LINK` in `js/config.js` line 11, currently `"#STRIPE_LINK_PLACEHOLDER"`. HTML comments marked TODO sit next to the buttons in `index.html` (line 65) and in `js/app.js`. Do not create Stripe products from this work.
- Post-payment path (planned): Stripe Payment Link redirect → `/thanks-k7x2/`, which sets `unlocked: true` in localStorage on that browser. **This is honor-system security.** Anyone who visits that URL can unlock the full booklet on their device. Acceptable for a $7 item. Noted here on purpose.
- Footer: "This domain is for sale" → the Afternic URL above.
- DNS was not changed. The domain is still on Afternic nameservers.

### Local test (Playwright, Chromium, `python3 -m http.server` on 127.0.0.1:8765)
- Filled two answers for "Margaret, my mom," reloaded, confirmed they persisted in localStorage and in the textareas.
- Opened the book view: the typed oatmeal/Grandpa answers were in the printed booklet. Table cards rendered 16 cards.
- Visiting `/thanks-k7x2/` set `unlocked` and changed progress from "2 of 20" to "2 of 100" without losing answers.
- Pay href resolved to `#STRIPE_LINK_PLACEHOLDER`; the visible placeholder note appeared.
- Screenshots (390×844 and 1280×800) saved under `shots/`: home, interview, book, cards, plus print-media, start form, thanks, and 404. After the first pass, tightened the interview chrome (chapter nav was clipping "Hard times" on a phone; the first question sat below the fold; the desktop sidebar hid Lessons/Wishes at 800px). Rechecked the shots; those issues were fixed.

### Hosting
No `CLOUDFLARE_API_TOKEN`. Hosting is GitHub Pages from the public repo `evanmack45/sharethislife.com`, `main` branch, site root. Order of operations for DNS safety: push and enable Pages with no custom domain; confirm `https://evanmack45.github.io/sharethislife.com/` loads; only then add the `CNAME` file and set `cname=sharethislife.com` via the Pages API. DNS itself is left for someone else.

### Unfinished
- Real Stripe Payment Link is not connected. The $7 button is a clearly marked placeholder.
- Custom domain will not resolve until DNS is pointed at GitHub Pages (A / AAAA / www CNAME). That work was intentionally not done here.
- Unlock after payment is honor-system only, as noted above.

### Hosting results (still 2026-11-14, America/Chicago)
- Public repo: https://github.com/evanmack45/sharethislife.com (main). No other repo or site was touched. DNS was not changed.
- Pages was enabled from `main` `/` with no custom domain first. Status became `built`. `https://evanmack45.github.io/sharethislife.com/` returned **HTTP 200** (no redirect). CSS, JS, favicon, interview, cards, book, `/thanks-k7x2/`, 404.html, robots.txt, and og.png all returned 200. Proof screenshot: `shots/github-io-home-1280.png` (kept on the box; `shots/` is gitignored). Curl was taken around 10:40 PM CST, before the CNAME was set.
- Then `CNAME` (contents: `sharethislife.com`) was committed and pushed, and the Pages API was updated with `cname=sharethislife.com`. GET `/repos/evanmack45/sharethislife.com/pages` afterward:

```json
{"url":"https://api.github.com/repos/evanmack45/sharethislife.com/pages","status":"built","cname":"sharethislife.com","custom_404":true,"html_url":"http://sharethislife.com/","build_type":"legacy","source":{"branch":"main","path":"/"},"public":true,"protected_domain_state":null,"pending_domain_unverified_at":null,"https_enforced":false}
```

- After that CNAME was set, `https://evanmack45.github.io/sharethislife.com/` still returned HTTP 200 (no redirect yet). The apex `sharethislife.com` still serves the Afternic lander (`window.location.href="/lander"`). Expected: DNS still points at Afternic nameservers.
- `https_enforced` is false until DNS and the Pages certificate are in place. Do not flip that on until DNS is done.
- Account-level Pages domain verification: there is no REST API for it. Official GitHub REST Pages endpoints are only `/repos/{owner}/{repo}/pages`, builds, deployments, and health. Probes of `user/pages/domains`, `pages/domains`, and `repos/.../pages/domains` returned 404. The TXT record `_github-pages-challenge-evanmack45.sharethislife.com` has to be created from GitHub profile Settings → Pages → Add a domain (the UI), not from `gh api`. No browser was used to try it.
- DNS records GitHub Pages will need, when someone else is ready to move nameservers (confirmed against GitHub docs, "Managing a custom domain" and "Securing your GitHub Pages site with HTTPS"):
  - Apex A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - Apex AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
  - CNAME `www` → `evanmack45.github.io`

- 2026-11-14 10:45 PM CT: swapped placeholder for live Stripe Payment Link https://buy.stripe.com/6oU4gr7ac79nb0LaXJ3oA03 (from Dash, $7, redirects to /thanks-k7x2/).
- 2026-11-14 10:44 PM CT: added sharethislife.com as a pending verified domain in GitHub account Pages settings (not yet verified). Sent Dash TXT _github-pages-challenge-evanmack45 = a9b019233bb1a60e4e28e2480fa3af plus A/AAAA/CNAME records. Next: on Dash's ping, click Verify, enforce HTTPS, run done checklist.
- 2026-11-14 10:52 PM CT: DNS live per Google DoH (A x4, www CNAME, TXT). Added noindex,nofollow to /thanks-k7x2/ and dropped its og:url. No sitemap exists.
- 2026-11-15 12:15 AM CT: clicked Verify in account settings; GitHub shows sharethislife.com Verified. Waiting on cert.
- 2026-11-15 1:15 AM CT: no cert after ~1h verified; re-PUT cname to nudge provisioning.
- 2026-11-15 3:12 AM CT: cert still missing after 3h verified; removed and re-added cname via API to retrigger.
- 2026-11-15 3:45 AM CT: cert approved; set https_enforced true. Next: checklist.
- 2026-11-15 4:05 AM CT: https enforced, desktop shot ok, interview persists, pay opens live $7 stripe. Phone shot (shots/live-phone.png) captured at 400px viewport and looks right-clipped; cannot tell site bug vs capture. Need true 390 shot.
- 2026-11-15 4:15 AM CT: DONE checklist passed. true 390 shots: shots/live-phone-390.png, live-phone-390-b.png; desktop shots/live-desktop.png. Routine deleted.

## 2026-11-18

### Staged the $19 chapter offer on branch `chapter-19` (not launched)
Ported the parked preview from `evanmack45/sharethislife-preview` into this repo as the main offer: a $19 voice-memo-to-story-chapter service, consent checkbox, privacy page, and `/thanks-r8m3/` (still noindex and unlinked). Kept the CNAME (`sharethislife.com`) and the Afternic “this domain is for sale” footer link.

Public pages are indexable again (`robots.txt` allows `/` and disallows only `/thanks-r8m3/`; noindex dropped from home, privacy, questions, and cards). Added the plan must-haves on the offer and privacy pages: delete-after-delivery (30 days), no training or reuse, buyers must be 18 or older, “drafted with AI and checked line by line,” and a “What to record” intake note.

Removed the $7 booklet offer and the in-browser 100-question interview tool (`book.html`, `interview.html`, `/thanks-k7x2/`, `js/questions.js`, `js/storage.js`) so the page sells one thing. Kept twenty free questions and printable table cards as a clearly secondary path.

Did not commit to `main`, did not point Pages at this branch, and did not change Stripe. The $19 payment link is live and active, but its after-payment redirect is still `https://evanmack45.github.io/sharethislife-preview/thanks-r8m3/`. On launch it should become `https://sharethislife.com/thanks-r8m3/`.

Local proof screenshots (offer and payment page, 1280 and 390) are on the box at `/workspace/stl19-offer-1280.jpg`, `/workspace/stl19-offer-390.jpg`, `/workspace/stl19-pay-1280.jpg`, and `/workspace/stl19-pay-390.jpg`. `shots/` stays gitignored.

### Launch (2026-11-18, America/Chicago)
Evan cleared launch of the $19 story-chapter offer (standing permission for bots to put domain sites live, plus the Nov 15 lead-bet decision). Rebased `chapter-19` onto `origin/main` (CNAME `sharethislife.com` kept). Added a tiny noindex `/thanks-k7x2/` stub that meta-refreshes to `/`, so the old $7 Stripe redirect does not 404. Fast-forwarded `main` to this commit and pushed. Did not change Pages settings. Stripe was not edited: the $19 payment link is https://buy.stripe.com/3cIfZ90LO2T77Oz1n93oA05; its after-payment redirect still points at the preview thanks URL until someone updates it in Stripe.

### Sample chapter (2026-11-18, America/Chicago)
Added `/sample/` from the Alda Weringer dry-run chapter (`/workspace/sharethislife/test-runs/01-alda-weringer/`). The page is labeled as an example, not a customer order; it links the Internet Archive item (https://archive.org/details/cbak_000036) and states Public Domain Mark 1.0; and it says the chapter was drafted with AI and checked line by line against the recording, the same as an order. Chapter text is faithful to `chapter.md`. Open name and date questions appear at the end as “Questions we would send the buyer.” The home offer box now links “Read a sample chapter” instead of “A sample chapter is coming.” Sample was not added to the nav, because the phone nav already wraps. The Afternic “This domain is for sale” footer is unchanged. Stripe was not edited.
- 2026-11-19 8:15 AM CT: checked Stripe (read only), $19 link redirect is https://sharethislife.com/thanks-r8m3/; updated stale config.js comment.

## 2026-11-19

### Paused sales (Opening soon)
Orders are paused until fulfillment is proven. The home offer box now shows an “Opening soon” state and a join-the-list mailto to sharethislife@agentmail.to (subject: “Tell me when Share This Life opens”). The $19 price is still shown as the planned price. A single switch in `js/config.js`, `ORDERS_OPEN` (currently `false`), restores the consent checkbox and pay button when set to `true`. `STRIPE_PAYMENT_LINK` stays in config but is not rendered in the HTML while orders are closed. Copy that said “Pay $19 and send” or “after you order” was rephrased so it does not promise a purchase is possible now. Sample page, for-sale footer, and Stripe itself were not changed.

## 2026-11-24

### Removed the live $19 Stripe URL from config (orders stay closed)
Foil's 2026-11-24 review flagged that `js/config.js` still published the live $19 Stripe Payment Link (`buy.stripe.com/3cIfZ90LO2T77Oz1n93oA05`) while `ORDERS_OPEN` is `false`. The hosted Stripe page showed as inactive, but anyone who reactivated the link in Stripe could take payment from a public source before round 5 passes.

Removed that URL from `js/config.js` and from the README example. `STRIPE_PAYMENT_LINK` is now an empty string, with the comment: set by Dash at GO; do not commit a live link before round 5 passes. `ORDERS_OPEN` stays `false`. No copy, footer, or sample changes. Stripe itself was not edited.

Local check (Python HTTP server, Playwright): home still shows “Opening soon” and the waitlist button; the pay button stays hidden (`data-orders-open-only`); `STL_CONFIG.stripePaymentLink` is `""`; `ordersOpen` is false; no page or console errors with the empty link.
