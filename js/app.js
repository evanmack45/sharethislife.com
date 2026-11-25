(function () {
  "use strict";

  var config = window.STL_CONFIG;
  var store = window.STL_STORAGE;
  var chapters = window.STL_CHAPTERS || [];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function speechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function bindPayLinks() {
    $$("[data-pay-link]").forEach(function (el) {
      el.setAttribute("href", config.stripePaymentLink);
      if (config.stripeIsPlaceholder) {
        el.setAttribute("aria-describedby", "pay-placeholder-note");
        el.setAttribute("aria-disabled", "true");
        if (el.getAttribute("data-placeholder-bound") !== "1") {
          el.setAttribute("data-placeholder-bound", "1");
          el.addEventListener("click", function (event) {
            event.preventDefault();
          });
        }
      }
    });
    $$("[data-pay-placeholder-note]").forEach(function (el) {
      if (config.stripeIsPlaceholder) {
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
  }

  function personLabel(person) {
    if (!person) return "";
    if (person.name && person.relationship) {
      return person.name + ", " + person.relationship;
    }
    return person.name || person.relationship || "this interview";
  }

  /* —— Interview page —— */
  var rec = null;
  var recTarget = null;

  function stopDictation() {
    if (rec) {
      try { rec.stop(); } catch (e) {}
    }
    rec = null;
    recTarget = null;
    $$(".dictate-btn[aria-pressed='true']").forEach(function (btn) {
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = "Dictate";
    });
  }

  function startDictation(textarea, button) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopDictation();
    rec = new SR();
    rec.lang = document.documentElement.lang || "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    recTarget = textarea;
    button.setAttribute("aria-pressed", "true");
    button.textContent = "Stop";
    rec.onresult = function (event) {
      var bits = [];
      for (var i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          bits.push(event.results[i][0].transcript);
        }
      }
      if (!bits.length) return;
      var add = bits.join(" ").trim();
      var cur = textarea.value;
      textarea.value = cur ? cur.replace(/\s+$/, "") + " " + add : add;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    };
    rec.onerror = function () {
      stopDictation();
    };
    rec.onend = function () {
      if (recTarget === textarea) stopDictation();
    };
    try {
      rec.start();
    } catch (e) {
      stopDictation();
    }
  }

  function renderInterview() {
    var main = $("#interview-app");
    if (!main) return;

    var state = store.load();
    var unlocked = state.unlocked;
    var person = store.activePerson(state);
    var hash = (location.hash || "").replace("#", "");
    var chapterId = hash || (chapters[0] && chapters[0].id);
    var current = null;
    chapters.forEach(function (ch) {
      if (ch.id === chapterId) current = ch;
    });
    if (!current) current = chapters[0];

    if (!person) {
      main.innerHTML = startFormHtml();
      $("#new-person-form").addEventListener("submit", onCreatePerson);
      renderPeopleList($("#people-list"), state, null);
      return;
    }

    var visible = current.questions.filter(function (q) {
      return unlocked || q.free;
    });
    var locked = current.questions.filter(function (q) {
      return !unlocked && !q.free;
    });
    var totalVisible = store.visibleQuestions(unlocked).length;
    var answered = store.answeredCount(person, unlocked);

    main.innerHTML =
      interviewChrome(person, state, current, answered, totalVisible, unlocked) +
      '<section class="chapter-panel" aria-labelledby="chapter-title">' +
        '<h2 id="chapter-title" class="chapter-title">' + escapeHtml(current.title) + "</h2>" +
        '<p class="chapter-dek">' + escapeHtml(current.dek) + "</p>" +
        visible.map(function (q) { return questionCard(q, person, true); }).join("") +
        (locked.length ? lockedBlock(locked.length, current.title) : "") +
        chapterPager(current) +
      "</section>";

    bindInterviewEvents(person, current);
  }

  function startFormHtml() {
    return (
      '<section class="panel start-panel" aria-labelledby="start-title">' +
        '<h1 id="start-title">Who are you interviewing?</h1>' +
        '<p class="lede">A first name is enough. The relationship helps later, when you print the answers as a booklet.</p>' +
        '<form id="new-person-form">' +
          '<p>' +
            '<label for="person-name">Their name</label>' +
            '<input id="person-name" name="name" type="text" required autocomplete="name" maxlength="80" placeholder="for example, Margaret">' +
          "</p>" +
          '<p>' +
            '<label for="person-rel">Your relationship to them</label>' +
            '<input id="person-rel" name="relationship" type="text" required maxlength="80" placeholder="for example, my mom">' +
          "</p>" +
          '<p><button type="submit" class="btn btn-primary">Start the interview</button></p>' +
        "</form>" +
        '<div id="people-list"></div>' +
      "</section>"
    );
  }

  function interviewChrome(person, state, current, answered, total, unlocked) {
    return (
      '<div class="interview-top">' +
        '<div class="who">' +
          '<p class="who-kicker">Interviewing</p>' +
          '<h1 class="who-name">' + escapeHtml(person.name) + "</h1>" +
          '<p class="who-rel">' + escapeHtml(person.relationship) + "</p>" +
        "</div>" +
        '<p class="progress" aria-live="polite">' +
          answered + " of " + total + " questions answered" +
          (unlocked ? "" : " on the free list") +
        "</p>" +
        '<p class="save-note">Answers are saved on this device as you type.</p>' +
        '<p class="interview-actions">' +
          '<a href="book.html">Print the answers</a>' +
          '<a href="cards.html">Table cards</a>' +
        "</p>" +
        peopleSwitcher(state, person) +
        chapterNav(current, unlocked, person) +
      "</div>"
    );
  }

  function peopleSwitcher(state, person) {
    var options = state.people.map(function (p) {
      return '<option value="' + escapeAttr(p.id) + '"' +
        (p.id === person.id ? " selected" : "") + ">" +
        escapeHtml(personLabel(p)) + "</option>";
    }).join("");
    return (
      '<details class="manage">' +
        "<summary>Manage interviews</summary>" +
        '<div class="people-bar">' +
          '<label for="switch-person">Saved interviews</label>' +
          '<div class="people-bar-row">' +
            '<select id="switch-person">' + options + "</select>" +
            '<button type="button" class="btn btn-quiet" id="new-interview-btn">New interview</button>' +
            '<button type="button" class="btn btn-quiet" id="delete-interview-btn">Delete this one</button>' +
          "</div>" +
        "</div>" +
      "</details>"
    );
  }

  function chapterNav(current, unlocked, person) {
    var items = chapters.map(function (ch) {
      var vis = ch.questions.filter(function (q) { return unlocked || q.free; });
      var done = vis.filter(function (q) { return person.answers && person.answers[q.id]; }).length;
      var active = ch.id === current.id;
      return (
        '<a class="chap-link' + (active ? " is-active" : "") + '" href="#' + escapeAttr(ch.id) + '"' +
          (active ? ' aria-current="page"' : "") + ">" +
          '<span class="chap-name">' + escapeHtml(ch.title) + "</span>" +
          '<span class="chap-count">' + done + "/" + vis.length + "</span>" +
        "</a>"
      );
    }).join("");
    return '<nav class="chap-nav" aria-label="Chapters">' + items + "</nav>";
  }

  function questionCard(q, person, enabled) {
    var value = (person.answers && person.answers[q.id]) || "";
    var mic = speechSupported() && enabled
      ? '<button type="button" class="dictate-btn" data-for="' + escapeAttr(q.id) + '" aria-pressed="false" aria-label="Dictate answer">Dictate</button>'
      : "";
    return (
      '<article class="q-card" id="q-' + escapeAttr(q.id) + '">' +
        '<h3 class="q-text">' + escapeHtml(q.text) + "</h3>" +
        '<label class="visually-hidden" for="a-' + escapeAttr(q.id) + '">Answer</label>' +
        '<textarea id="a-' + escapeAttr(q.id) + '" data-qid="' + escapeAttr(q.id) + '"' +
          (enabled ? "" : " disabled") +
          ' rows="6" maxlength="20000">' + escapeHtml(value) + "</textarea>" +
        '<div class="q-actions">' + mic +
          '<span class="saved-flag" data-saved-for="' + escapeAttr(q.id) + '" hidden>Saved</span>' +
        "</div>" +
      "</article>"
    );
  }

  function lockedBlock(count, chapterTitle) {
    return (
      '<aside class="locked-block" aria-label="More questions in this chapter">' +
        '<p>There are ' + count + " more questions in " + escapeHtml(chapterTitle) +
        " in the full booklet.</p>" +
        '<p><a class="btn btn-primary" data-pay-link href="#STRIPE_LINK_PLACEHOLDER">Unlock all 100 questions — $7</a></p>' +
        '<!-- TODO: pay href comes from STRIPE_PAYMENT_LINK in js/config.js (one-line swap). -->' +
        '<p class="placeholder-note" data-pay-placeholder-note id="pay-placeholder-note" hidden>' +
          "The payment link isn't connected yet. This button is a placeholder." +
        "</p>" +
        '<p class="fine">If you already paid, open the thank-you link you were sent. It unlocks the booklet on this device.</p>' +
      "</aside>"
    );
  }

  function chapterPager(current) {
    var idx = -1;
    chapters.forEach(function (ch, i) { if (ch.id === current.id) idx = i; });
    var prev = idx > 0 ? chapters[idx - 1] : null;
    var next = idx < chapters.length - 1 ? chapters[idx + 1] : null;
    return (
      '<div class="pager">' +
        (prev ? '<a class="btn btn-quiet" href="#' + prev.id + '">Previous: ' + escapeHtml(prev.title) + "</a>" : "<span></span>") +
        (next ? '<a class="btn btn-quiet" href="#' + next.id + '">Next: ' + escapeHtml(next.title) + "</a>" : "<span></span>") +
      "</div>"
    );
  }

  function renderPeopleList(el, state, activeId) {
    if (!el || !state.people.length) return;
    el.innerHTML =
      "<h2>Saved interviews on this device</h2><ul class='people-ul'>" +
      state.people.map(function (p) {
        return '<li><a href="#" data-open-person="' + escapeAttr(p.id) + '">' +
          escapeHtml(personLabel(p)) + "</a></li>";
      }).join("") +
      "</ul>";
    $$("[data-open-person]", el).forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        store.setActive(a.getAttribute("data-open-person"));
        renderInterview();
      });
    });
  }

  function onCreatePerson(e) {
    e.preventDefault();
    var name = $("#person-name").value;
    var rel = $("#person-rel").value;
    store.addPerson(name, rel);
    location.hash = chapters[0] ? chapters[0].id : "";
    renderInterview();
    var first = $("textarea");
    if (first) first.focus();
  }

  function bindInterviewEvents(person, current) {
    bindPayLinks();

    $$("textarea[data-qid]").forEach(function (ta) {
      var timer = null;
      ta.addEventListener("input", function () {
        store.setAnswer(person.id, ta.getAttribute("data-qid"), ta.value);
        var flag = $('[data-saved-for="' + ta.getAttribute("data-qid") + '"]');
        if (flag) {
          flag.hidden = false;
          clearTimeout(timer);
          timer = setTimeout(function () { flag.hidden = true; }, 1200);
        }
        var progress = $(".progress");
        var state = store.load();
        var p = store.activePerson(state);
        if (progress && p) {
          progress.textContent =
            store.answeredCount(p, state.unlocked) +
            " of " + store.visibleQuestions(state.unlocked).length +
            " questions answered" +
            (state.unlocked ? "" : " on the free list");
        }
        var link = $('.chap-link[href="#' + current.id + '"] .chap-count');
        if (link) {
          var vis = current.questions.filter(function (q) { return state.unlocked || q.free; });
          var done = vis.filter(function (q) { return p.answers && p.answers[q.id]; }).length;
          link.textContent = done + "/" + vis.length;
        }
      });
    });

    $$(".dictate-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ta = $("#a-" + btn.getAttribute("data-for"));
        if (!ta) return;
        if (btn.getAttribute("aria-pressed") === "true") {
          stopDictation();
        } else {
          startDictation(ta, btn);
        }
      });
    });

    var sel = $("#switch-person");
    if (sel) {
      sel.addEventListener("change", function () {
        stopDictation();
        store.setActive(sel.value);
        renderInterview();
      });
    }
    var neu = $("#new-interview-btn");
    if (neu) {
      neu.addEventListener("click", function () {
        stopDictation();
        var state = store.load();
        state.activeId = null;
        store.save(state);
        renderInterview();
        var name = $("#person-name");
        if (name) name.focus();
      });
    }
    var del = $("#delete-interview-btn");
    if (del) {
      del.addEventListener("click", function () {
        var label = personLabel(person);
        if (!confirm("Delete the interview with " + label + "? The answers on this device will be removed.")) {
          return;
        }
        stopDictation();
        store.deletePerson(person.id);
        renderInterview();
      });
    }
  }

  /* —— Book print view —— */
  function renderBook() {
    var root = $("#book-app");
    if (!root) return;
    var state = store.load();
    var unlocked = state.unlocked;
    var person = store.activePerson(state);
    var onlyAnswered = $("#only-answered") && $("#only-answered").checked;

    if (!state.people.length) {
      root.innerHTML =
        '<div class="screen-only panel">' +
          "<h1>Print a keepsake book</h1>" +
          "<p>You don't have an interview on this device yet.</p>" +
          '<p><a class="btn btn-primary" href="interview.html">Start an interview</a></p>' +
        "</div>";
      return;
    }

    var items = store.visibleQuestions(unlocked);
    if (onlyAnswered && person) {
      items = items.filter(function (item) {
        return person.answers && person.answers[item.question.id];
      });
    }

    var peopleOpts = state.people.map(function (p) {
      return '<option value="' + escapeAttr(p.id) + '"' +
        (person && p.id === person.id ? " selected" : "") + ">" +
        escapeHtml(personLabel(p)) + "</option>";
    }).join("");

    root.innerHTML =
      '<div class="screen-only panel book-tools">' +
        "<h1>Print a keepsake book</h1>" +
        "<p>This layout is meant to be printed, or saved as a PDF from your browser's print dialog.</p>" +
        '<div class="tools-row">' +
          '<p><label for="book-person">Interview</label> ' +
          '<select id="book-person">' + peopleOpts + "</select></p>" +
          '<p><label><input type="checkbox" id="only-answered"' + (onlyAnswered ? " checked" : "") + "> Only include questions with answers</label></p>" +
        "</div>" +
        (unlocked
          ? "<p>The full 100-question booklet is unlocked on this device.</p>"
          : "<p>The free booklet includes the 20 free questions. " +
            '<a data-pay-link href="#STRIPE_LINK_PLACEHOLDER">Unlock all 100 questions — $7</a></p>' +
            '<!-- TODO: pay href comes from STRIPE_PAYMENT_LINK in js/config.js (one-line swap). -->' +
            '<p class="placeholder-note" data-pay-placeholder-note id="pay-placeholder-note" hidden>' +
            "The payment link isn't connected yet. This button is a placeholder.</p>") +
        '<p><button type="button" class="btn btn-primary" id="print-book-btn">Print or save as PDF</button></p>' +
      "</div>" +
      bookPages(person, items, unlocked);

    bindPayLinks();
    $("#book-person").addEventListener("change", function () {
      store.setActive($("#book-person").value);
      renderBook();
    });
    $("#only-answered").addEventListener("change", renderBook);
    $("#print-book-btn").addEventListener("click", function () { window.print(); });
  }

  function bookPages(person, items, unlocked) {
    var byChapter = [];
    var map = {};
    items.forEach(function (item) {
      if (!map[item.chapter.id]) {
        map[item.chapter.id] = { chapter: item.chapter, items: [] };
        byChapter.push(map[item.chapter.id]);
      }
      map[item.chapter.id].items.push(item);
    });
    var who = person ? escapeHtml(person.name) : "Untitled";
    var rel = person && person.relationship ? escapeHtml(person.relationship) : "";
    var titlePage =
      '<section class="book-title-page">' +
        '<p class="book-kicker">Share This Life</p>' +
        "<h1>A life in stories</h1>" +
        '<p class="book-subject">' + who + "</p>" +
        (rel ? '<p class="book-rel">' + rel + "</p>" : "") +
        '<p class="book-meta">' + (unlocked ? "One hundred questions." : "Twenty questions.") +
        " Written at the kitchen table, more or less.</p>" +
      "</section>";
    var body = byChapter.map(function (block) {
      return (
        '<section class="book-chapter">' +
          '<h2 class="book-chapter-title">' + escapeHtml(block.chapter.title) + "</h2>" +
          block.items.map(function (item) {
            var answer = (person && person.answers && person.answers[item.question.id]) || "";
            return (
              '<article class="book-q">' +
                "<h3>" + escapeHtml(item.question.text) + "</h3>" +
                '<p class="book-a">' +
                  (answer ? escapeHtml(answer).replace(/\n/g, "<br>") : '<span class="blank">Left unanswered.</span>') +
                "</p>" +
              "</article>"
            );
          }).join("") +
        "</section>"
      );
    }).join("");
    return '<div class="book-pages">' + titlePage + body +
      '<p class="book-end">Share This Life · sharethislife.com</p></div>';
  }

  /* —— Table cards —— */
  function renderCards() {
    var root = $("#cards-app");
    if (!root) return;
    var ids = window.STL_TABLE_CARDS || [];
    var cards = ids.map(function (id) {
      var item = store.questionById(id);
      return item ? item.question : null;
    }).filter(Boolean);

    root.innerHTML =
      '<div class="screen-only panel">' +
        "<h1>Holiday table question cards</h1>" +
        "<p>Sixteen questions, meant to be cut apart and passed around the table. They're free. Print them on regular paper, or on card stock if you have it.</p>" +
        '<p><button type="button" class="btn btn-primary" id="print-cards-btn">Print the cards</button></p>' +
      "</div>" +
      '<div class="card-sheet" aria-label="Printable question cards">' +
        cards.map(function (q, i) {
          return (
            '<article class="table-card">' +
              '<p class="card-kicker">A question for the table</p>' +
              "<h2>" + escapeHtml(q.text) + "</h2>" +
              '<p class="card-foot"><span>Share This Life</span><span>' + (i + 1) + " / " + cards.length + "</span></p>" +
            "</article>"
          );
        }).join("") +
      "</div>";
    $("#print-cards-btn").addEventListener("click", function () { window.print(); });
  }

  /* —— Thanks / unlock —— */
  function renderThanks() {
    var root = $("#thanks-app");
    if (!root) return;
    store.unlock();
    root.innerHTML =
      '<section class="panel">' +
        "<h1>The full booklet is unlocked on this device</h1>" +
        "<p>Thank you. You can go back to the interview and use all 100 questions, and you can print the answers as a book.</p>" +
        "<p>This unlock is saved in this browser only. If you switch phones or clear the browser's data, open this thank-you page again to turn it back on.</p>" +
        '<p class="btn-row">' +
          '<a class="btn btn-primary" href="../interview.html">Continue the interview</a>' +
          '<a class="btn btn-quiet" href="../book.html">Print the keepsake book</a>' +
        "</p>" +
      "</section>";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  window.addEventListener("hashchange", function () {
    if ($("#interview-app")) {
      stopDictation();
      renderInterview();
      window.scrollTo(0, 0);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    bindPayLinks();
    if ($("#interview-app")) renderInterview();
    if ($("#book-app")) renderBook();
    if ($("#cards-app")) renderCards();
    if ($("#thanks-app")) renderThanks();
  });
})();
