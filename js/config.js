/* Share This Life — site config.
 *
 * TODO: replace STRIPE_PAYMENT_LINK with the real Stripe Payment Link.
 * That is a one-line swap. Do not create Stripe products from this repo.
 * After payment, Stripe should redirect to /thanks-k7x2/
 */
(function (root) {
  "use strict";

  // TODO: replace with the real Stripe Payment Link (one-line swap)
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
