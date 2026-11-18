/* Share This Life — preview: consent gate, pay link, mailto. */
(function () {
  "use strict";

  var config = window.STL_CONFIG || {};

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function showPlaceholderNotes() {
    $$("[data-pay-placeholder-note]").forEach(function (el) {
      if (config.stripeIsPlaceholder) {
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

    if (config.stripeIsPlaceholder) {
      pay.setAttribute("aria-describedby", "pay-placeholder-note");
    }

    if (consent) {
      consent.addEventListener("change", syncPay);
    }

    pay.addEventListener("click", function (e) {
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
  }

  showPlaceholderNotes();
  bindPay();
  bindMailto();
})();
