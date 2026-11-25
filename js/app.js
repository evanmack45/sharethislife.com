/* Share This Life — orders-open switch, consent gate, pay link, mailto. */
(function () {
  "use strict";

  var config = window.STL_CONFIG || {};

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function ordersAreOpen() {
    return config.ordersOpen === true;
  }

  function syncOrdersState() {
    var open = ordersAreOpen();
    $$("[data-orders-open-only]").forEach(function (el) {
      el.hidden = !open;
    });
    $$("[data-orders-closed-only]").forEach(function (el) {
      el.hidden = open;
    });
  }

  function showPlaceholderNotes() {
    $$("[data-pay-placeholder-note]").forEach(function (el) {
      if (ordersAreOpen() && config.stripeIsPlaceholder) {
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
  }

  function syncPay() {
    var consent = $("#consent");
    var pay = $("[data-pay-link]");
    if (!pay) return;

    if (!ordersAreOpen()) {
      pay.setAttribute("aria-disabled", "true");
      pay.setAttribute("tabindex", "-1");
      pay.setAttribute("href", "#order");
      return;
    }

    var checked = !!(consent && consent.checked);
    if (checked) {
      pay.setAttribute("href", config.stripePaymentLink || "#");
      pay.removeAttribute("aria-disabled");
      pay.removeAttribute("tabindex");
    } else {
      pay.setAttribute("aria-disabled", "true");
      pay.setAttribute("tabindex", "-1");
      pay.setAttribute("href", "#order");
    }
  }

  function bindPay() {
    var consent = $("#consent");
    var pay = $("[data-pay-link]");
    if (!pay) return;

    if (ordersAreOpen() && config.stripeIsPlaceholder) {
      pay.setAttribute("aria-describedby", "pay-placeholder-note");
    }

    if (consent) {
      consent.addEventListener("change", syncPay);
    }

    pay.addEventListener("click", function (e) {
      if (!ordersAreOpen()) {
        e.preventDefault();
        return;
      }
      var checked = !!(consent && consent.checked);
      if (!checked) {
        e.preventDefault();
        if (consent) consent.focus();
        return;
      }
      if (config.stripeIsPlaceholder) {
        e.preventDefault();
        var note = $("#pay-placeholder-note");
        if (note) {
          note.hidden = false;
          note.focus && note.focus();
        }
      }
    });

    syncPay();
  }

  function bindMailto() {
    $$("[data-mailto]").forEach(function (el) {
      if (config.mailtoHref) {
        el.setAttribute("href", config.mailtoHref);
      }
    });
    $$("[data-waitlist-mailto]").forEach(function (el) {
      if (config.waitlistMailtoHref) {
        el.setAttribute("href", config.waitlistMailtoHref);
      }
    });
  }

  syncOrdersState();
  showPlaceholderNotes();
  bindPay();
  bindMailto();
})();
