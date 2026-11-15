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
