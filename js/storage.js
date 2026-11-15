(function (root) {
  "use strict";

  var KEY = (root.STL_CONFIG && root.STL_CONFIG.storageKey) || "sharethislife.v1";

  function emptyState() {
    return { unlocked: false, people: [], activeId: null };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return emptyState();
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return emptyState();
      if (!Array.isArray(data.people)) data.people = [];
      if (typeof data.unlocked !== "boolean") data.unlocked = false;
      if (!data.activeId) data.activeId = data.people[0] ? data.people[0].id : null;
      return data;
    } catch (err) {
      return emptyState();
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  function uid() {
    return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getPerson(state, id) {
    var found = null;
    state.people.forEach(function (p) {
      if (p.id === id) found = p;
    });
    return found;
  }

  function activePerson(state) {
    return getPerson(state, state.activeId);
  }

  function addPerson(name, relationship) {
    var state = load();
    var person = {
      id: uid(),
      name: String(name || "").trim(),
      relationship: String(relationship || "").trim(),
      createdAt: Date.now(),
      answers: {}
    };
    state.people.push(person);
    state.activeId = person.id;
    save(state);
    return person;
  }

  function updatePerson(id, fields) {
    var state = load();
    var person = getPerson(state, id);
    if (!person) return null;
    if (fields.name != null) person.name = String(fields.name).trim();
    if (fields.relationship != null) person.relationship = String(fields.relationship).trim();
    save(state);
    return person;
  }

  function setActive(id) {
    var state = load();
    if (getPerson(state, id)) {
      state.activeId = id;
      save(state);
    }
    return state;
  }

  function setAnswer(personId, questionId, text) {
    var state = load();
    var person = getPerson(state, personId);
    if (!person) return null;
    if (!person.answers) person.answers = {};
    var value = String(text || "");
    if (value === "") {
      delete person.answers[questionId];
    } else {
      person.answers[questionId] = value;
    }
    save(state);
    return person;
  }

  function deletePerson(id) {
    var state = load();
    state.people = state.people.filter(function (p) { return p.id !== id; });
    if (state.activeId === id) {
      state.activeId = state.people[0] ? state.people[0].id : null;
    }
    save(state);
    return state;
  }

  function unlock() {
    var state = load();
    state.unlocked = true;
    save(state);
    return state;
  }

  function isUnlocked() {
    return load().unlocked === true;
  }

  function allQuestions() {
    var list = [];
    (root.STL_CHAPTERS || []).forEach(function (ch) {
      ch.questions.forEach(function (q) {
        list.push({ chapter: ch, question: q });
      });
    });
    return list;
  }

  function questionById(id) {
    var found = null;
    allQuestions().forEach(function (item) {
      if (item.question.id === id) found = item;
    });
    return found;
  }

  function visibleQuestions(unlocked) {
    return allQuestions().filter(function (item) {
      return unlocked || item.question.free;
    });
  }

  function answeredCount(person, unlocked) {
    if (!person || !person.answers) return 0;
    var n = 0;
    visibleQuestions(unlocked).forEach(function (item) {
      if (person.answers[item.question.id]) n += 1;
    });
    return n;
  }

  root.STL_STORAGE = {
    load: load,
    save: save,
    addPerson: addPerson,
    updatePerson: updatePerson,
    setActive: setActive,
    setAnswer: setAnswer,
    deletePerson: deletePerson,
    unlock: unlock,
    isUnlocked: isUnlocked,
    getPerson: getPerson,
    activePerson: activePerson,
    allQuestions: allQuestions,
    questionById: questionById,
    visibleQuestions: visibleQuestions,
    answeredCount: answeredCount
  };
})(window);
