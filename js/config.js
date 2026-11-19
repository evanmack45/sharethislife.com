/* Share This Life — site config.
 *
 * ORDERS_OPEN is the one switch for the home-page offer.
 * false: show “Opening soon” and a waitlist mailto. Do not put the
 *   Stripe URL into the page.
 * true: restore the consent checkbox and the $19 pay button exactly
 *   as they work when orders are open.
 *
 * STRIPE_PAYMENT_LINK is the live $19 Stripe Payment Link.
 * After payment, the thanks page on this site is /thanks-r8m3/.
 * Stripe redirects to https://sharethislife.com/thanks-r8m3/ (checked
 * 2026-11-19). Do not change Stripe from this repo.
 * Swap that one line if the link changes.
 */
(function (root) {
  "use strict";

  var ORDERS_OPEN = false;

  // Live Stripe Payment Link ($19). Thanks page on this site: /thanks-r8m3/
  var STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cIfZ90LO2T77Oz1n93oA05";

  var SUBMIT_EMAIL = "sharethislife@agentmail.to";
  var MAILTO_SUBJECT = "Share This Life chapter recording";
  var MAILTO_BODY =
    "Speaker's first name: \n" +
    "Relationship (for example, my mom): \n" +
    "A share link, if the file is too big to attach: \n";
  var WAITLIST_SUBJECT = "Tell me when Share This Life opens";

  root.STL_CONFIG = {
    ordersOpen: ORDERS_OPEN,
    stripePaymentLink: STRIPE_PAYMENT_LINK,
    stripeIsPlaceholder: STRIPE_PAYMENT_LINK.indexOf("PLACEHOLDER") !== -1,
    submitEmail: SUBMIT_EMAIL,
    mailtoSubject: MAILTO_SUBJECT,
    mailtoHref:
      "mailto:" +
      SUBMIT_EMAIL +
      "?subject=" +
      encodeURIComponent(MAILTO_SUBJECT) +
      "&body=" +
      encodeURIComponent(MAILTO_BODY),
    waitlistSubject: WAITLIST_SUBJECT,
    waitlistMailtoHref:
      "mailto:" +
      SUBMIT_EMAIL +
      "?subject=" +
      encodeURIComponent(WAITLIST_SUBJECT),
    thanksPath: "thanks-r8m3/",
    priceLabel: "$19",
    siteName: "Share This Life"
  };
})(window);
