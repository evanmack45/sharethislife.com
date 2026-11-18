/* Share This Life — site config.
 *
 * STRIPE_PAYMENT_LINK is the live $19 Stripe Payment Link.
 * After payment, the thanks page on this site is /thanks-r8m3/.
 * The Stripe link's redirect may still point at the preview host
 * until it is updated in Stripe (do not change Stripe from this repo).
 * Swap this one line if the link changes.
 */
(function (root) {
  "use strict";

  // Live Stripe Payment Link ($19). Thanks page on this site: /thanks-r8m3/
  var STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cIfZ90LO2T77Oz1n93oA05";

  var SUBMIT_EMAIL = "sharethislife@agentmail.to";
  var MAILTO_SUBJECT = "Share This Life chapter recording";
  var MAILTO_BODY =
    "Speaker's first name: \n" +
    "Relationship (for example, my mom): \n" +
    "A share link, if the file is too big to attach: \n";

  root.STL_CONFIG = {
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
    thanksPath: "thanks-r8m3/",
    priceLabel: "$19",
    siteName: "Share This Life"
  };
})(window);
