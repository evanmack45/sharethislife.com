/* Share This Life — site config.
 *
 * STRIPE_PAYMENT_LINK is the live $7 Stripe Payment Link (set Nov 14 2026).
 * After payment, Stripe should redirect to /thanks-k7x2/
 */
(function (root) {
  "use strict";

  // Live Stripe Payment Link ($7), redirects to /thanks-k7x2/
  var STRIPE_PAYMENT_LINK = "https://buy.stripe.com/6oU4gr7ac79nb0LaXJ3oA03";

  root.STL_CONFIG = {
    storageKey: "sharethislife.v1",
    stripePaymentLink: STRIPE_PAYMENT_LINK,
    stripeIsPlaceholder: STRIPE_PAYMENT_LINK.indexOf("PLACEHOLDER") !== -1,
    thanksPath: "thanks-k7x2/",
    priceLabel: "$7",
    siteName: "Share This Life",
    siteUrl: "https://sharethislife.com/"
  };
})(window);
