/**
 * Pookie & I — Phase 3 game bridge.
 *
 * Runs the first five migrated games through the server engine without
 * touching their look. The existing builders keep rendering from the local
 * `state[gameId]` object; this file is the only thing that fills that object
 * (from the authoritative snapshot) and the only thing that turns a tap into
 * a server action. Nothing here invents game state.
 *
 * Migrated: Deep Questions (prompt), Finish My Sentence (simultaneous),
 * Rate Us (simultaneous), Two Truths & a Lie (stateful), 20 Questions
 * (stateful). Every other game still uses the legacy path untouched.
 */
(function () {
  var MIGRATED = { questions: 1, finishsentence: 1, rateus: 1, truths: 1, twenty: 1 };

  /** prompt indices seen this session, so the card counter keeps working */
  var hist = { sessionId: null, list: [] };
  var lastSig = null;
  var busy = false;

  function E() { return window.PKEngine; }
  function inRoom() { return !!(window.PKEngine && window.PKEngine.hasSession()); }
  function activeId() { try { return activeGame; } catch (e) { return null; } }
  function toast(m) { try { showToast(m); } catch (e) {} }

  function err(e) {
    if (!e) return;
    if (e.code === 'STALE') { E().refresh().catch(function () {}); return; }
    toast(e.message || 'That did not go through');
    E().refresh().catch(function () {});
  }

  function run(p) {
    if (busy) return;
    busy = true;
    Promise.resolve(p).catch(err).then(function () { busy = false; });
  }

  // ── snapshot → legacy state shape ───────────────────────────────────
  function trackPrompt(snap) {
    var sid = snap.session.id;
    if (hist.sessionId !== sid) { hist.sessionId = sid; hist.list = []; }
    var idx = snap.round.state.promptIndex;
    if (typeof idx === 'number' && idx >= 0 && hist.list[hist.list.length - 1] !== idx) {
      hist.list.push(idx);
      return true;
    }
    return false;
  }

  function mapPromptCard(s, snap) {
    var grew = trackPrompt(snap);
    s.drawn = hist.list.slice();
    if (grew || s.histIdx == null || s.histIdx >= s.drawn.length) s.histIdx = s.drawn.length - 1;
  }

  function mapState(snap) {
    var sess = snap.session, round = snap.round;
    if (!sess || !round) return null;
    var id = sess.gameType;
    if (!MIGRATED[id]) return null;
    var s = state[id];
    if (!s) return null;
    var rs = round.state || {};
    var mine = snap.mySubmission || null;
    var role = snap.me.role;

    if (id === 'questions') {
      mapPromptCard(s, snap);
    } else if (id === 'rateus' || id === 'finishsentence') {
      mapPromptCard(s, snap);
      var revealed = rs.phase === 'REVEAL';
      var sub = rs.submitted || {};
      s.phase = revealed ? 'revealed' : (id === 'rateus' ? 'rating' : 'writing');
      var vP1 = revealed ? ((rs.reveal || {}).P1 || {}).value : (role === 'P1' ? (mine || {}).value : null);
      var vP2 = revealed ? ((rs.reveal || {}).P2 || {}).value : (role === 'P2' ? (mine || {}).value : null);
      if (id === 'rateus') {
        s.p1Rating = Number(vP1) || (!revealed && sub.P1 ? 0.5 : 0);
        s.p2Rating = Number(vP2) || (!revealed && sub.P2 ? 0.5 : 0);
      } else {
        s.p1Answer = vP1 == null ? '' : String(vP1);
        s.p2Answer = vP2 == null ? '' : String(vP2);
        s.p1Ready = !!sub.P1;
        s.p2Ready = !!sub.P2;
      }
    } else if (id === 'truths') {
      s.writerRole = String(rs.teller || 'P1').toLowerCase();
      s.phase = rs.phase === 'SETUP' ? 'writing' : rs.phase === 'GUESSING' ? 'guessing' : 'result';
      s.statements = rs.statements || ['', '', ''];
      s.lieIndex = rs.lieIndex != null ? rs.lieIndex
        : (mine && mine.lieIndex != null ? mine.lieIndex : -1);
      if (rs.phase === 'REVEAL') s.guess = rs.guess;
      else if (rs.phase !== 'GUESSING') s.guess = -1;
      else if (s.guess == null) s.guess = -1;
      s.p1Score = snap.scores.P1;
      s.p2Score = snap.scores.P2;
    } else if (id === 'twenty') {
      s.thinkerRole = String(rs.thinker || 'P1').toLowerCase();
      s.phase = rs.phase === 'SETUP' ? 'setup' : rs.phase === 'COMPLETE' ? 'result' : 'playing';
      var log = (rs.history || []).map(function (h) {
        return { q: h.q, a: h.a === 'sometimes' ? 'sortof' : h.a };
      });
      if (rs.pendingQuestion) log.push({ q: rs.pendingQuestion, a: '' });
      s.qLog = log;
      s.qCount = rs.questionsAsked || 0;
      s.subject = (role === rs.thinker && mine && mine.secret) ? mine.secret : (rs.secret || '');
      s.guessCorrect = rs.outcome === 'CORRECT';
      s.serverPhase = rs.phase;
      s.finalGuess = rs.finalGuess || '';
    }
    return id;
  }

  // ── extra controls the legacy markup never had (20 Questions' real flow) ──
  function augmentTwenty(snap) {
    var rs = (snap.round && snap.round.state) || {};
    var role = snap.me.role;
    var top = document.querySelector('#main .draw-top');
    if (!top) return;

    if (rs.phase === 'ASKING' && role === rs.guesser) {
      var row = document.createElement('div');
      row.style.cssText = 'border-top:1px solid var(--border);padding:1rem;';
      row.innerHTML = '<div class="qa-input-row">' +
        '<input class="qa-input" id="pk-final-guess" placeholder="Ready? Type your final guess..." aria-label="Your final guess" />' +
        '<button class="btn-secondary" id="pk-final-guess-btn" style="font-size:13px;flex:none;">Guess</button>' +
        '</div>';
      top.appendChild(row);
    } else if (rs.phase === 'FINAL_GUESS' && role === rs.guesser) {
      var only = document.createElement('div');
      only.style.cssText = 'border-top:1px solid var(--border);padding:1rem;';
      only.innerHTML = '<p style="font-size:13px;color:var(--muted);margin-bottom:8px;">That\'s 20 questions — make your final guess.</p>' +
        '<div class="qa-input-row"><input class="qa-input" id="pk-final-guess" placeholder="My final guess is..." aria-label="Your final guess" />' +
        '<button class="btn-primary" id="pk-final-guess-btn" style="font-size:13px;flex:none;">Guess</button></div>';
      top.appendChild(only);
    } else if (rs.phase === 'JUDGING') {
      var judge = document.createElement('div');
      judge.style.cssText = 'border-top:1px solid var(--border);padding:1rem;';
      judge.innerHTML = '<p style="font-size:13px;color:var(--muted);margin-bottom:8px;">Their guess: "' +
        escapeHtml(rs.finalGuess || '') + '"</p>' +
        (role === rs.thinker
          ? '<div style="display:flex;gap:6px;"><button class="btn-primary" id="pk-judge-yes" style="font-size:13px;">They got it</button>' +
            '<button class="btn-secondary" id="pk-judge-no" style="font-size:13px;">Not quite</button></div>'
          : '<div style="font-size:13px;color:var(--muted);">Waiting for them to say if you\'re right...</div>');
      top.appendChild(judge);
    } else if (rs.phase === 'AWAITING_ANSWER' && role === rs.guesser) {
      var wait = document.createElement('div');
      wait.style.cssText = 'border-top:1px solid var(--border);padding:1rem;font-size:13px;color:var(--muted);';
      wait.textContent = 'Waiting for their answer...';
      top.appendChild(wait);
    }
  }

  function augment() {
    var snap = E() && E().snapshot;
    if (!snap || !snap.session) return;
    if (snap.session.gameType !== activeId()) return;
    if (snap.session.gameType === 'twenty') augmentTwenty(snap);
  }

  // ── render loop ─────────────────────────────────────────────────────
  function onSnapshot(snap) {
    if (!snap || !snap.session) return;
    var id = mapState(snap);
    if (!id) return;

    // Both players follow whichever migrated game the server says is live.
    if (id !== activeId()) { switchGame(id); lastSig = null; }

    // Reveal is a server transition; one client asks for it, once.
    if (snap.me.role === 'P1' && (snap.allowedActions || []).indexOf('REVEAL') >= 0) {
      run(E().action('REVEAL'));
    }

    var sig = JSON.stringify([snap.round.state, snap.scores, snap.mySubmission, snap.me.role]);
    if (sig !== lastSig) { lastSig = sig; buildMain(); }
  }

  // ── actions ─────────────────────────────────────────────────────────
  function val(id) { var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; }

  function startOrNext(gameId) {
    var snap = E().snapshot;
    if (!snap || !snap.session || snap.session.gameType !== gameId) return E().startGame(gameId);
    return E().action('NEXT');
  }

  var HANDLERS = {
    // Deep Questions — prompt pattern
    'draw-btn': function (g) { return startOrNext(g); },
    'reset-btn': function (g) { return E().rematch(g); },

    // Rate Us
    'ru-submit': function () {
      var el = document.getElementById('ru-slider');
      return E().privateSubmit({ value: Number(el ? el.value : 5) });
    },
    'ru-draw-btn': function (g) { return startOrNext(g); },
    'ru-reset': function (g) { return E().rematch(g); },

    // Finish My Sentence
    'fs-ready-btn': function () {
      var text = val('fs-answer');
      if (!text) { toast('Write something first'); return null; }
      return E().privateSubmit({ value: text });
    },
    'fs-draw-btn': function (g) { return startOrNext(g); },
    'fs-reset': function (g) { return E().rematch(g); },

    // Two Truths & a Lie
    'tt-send-btn': function () {
      var statements = [0, 1, 2].map(function (i) { return val('tt-stmt-' + i); });
      if (statements.some(function (t) { return !t; })) { toast('Fill in all three statements'); return null; }
      var picked = document.querySelector('input[name="tt-lie"]:checked');
      if (!picked) { toast('Mark which one is the lie'); return null; }
      return E().privateSubmit({ statements: statements, lieIndex: Number(picked.value) });
    },
    'tt-confirm-guess': function () {
      var s = state.truths;
      if (!s || s.guess == null || s.guess < 0) { toast('Pick a statement first'); return null; }
      return E().action('GUESS', { index: s.guess });
    },
    'tt-next-round': function () { return E().action('NEXT'); },
    'tt-reset': function (g) { return E().rematch(g); },

    // 20 Questions
    'twenty-ready-btn': function () {
      var secret = val('twenty-subject-input');
      if (!secret) { toast('Type your secret first'); return null; }
      return E().privateSubmit({ secret: secret });
    },
    'qa-ask': function () {
      var q = val('q-input');
      if (!q) { toast('Type a question first'); return null; }
      return E().action('ASK', { question: q });
    },
    'qa-yes': function () { return E().action('ANSWER', { answer: 'yes' }); },
    'qa-no': function () { return E().action('ANSWER', { answer: 'no' }); },
    'qa-sort': function () { return E().action('ANSWER', { answer: 'sometimes' }); },
    'pk-final-guess-btn': function () {
      var g = val('pk-final-guess');
      if (!g) { toast('Type your guess first'); return null; }
      return E().action('FINAL_GUESS', { guess: g });
    },
    'pk-judge-yes': function () { return E().action('JUDGE', { correct: true }); },
    'pk-judge-no': function () { return E().action('JUDGE', { correct: false }); },
    'twenty-swap-btn': function () { return E().action('NEXT'); },
    'qa-reset': function (g) { return E().rematch(g); },
  };

  document.addEventListener('click', function (ev) {
    var id = activeId();
    if (!MIGRATED[id] || !inRoom()) return;
    var btn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!btn || !HANDLERS[btn.id]) return;
    ev.preventDefault();
    ev.stopPropagation();
    var out = HANDLERS[btn.id](id);
    if (out) run(out);
  }, true);

  // ── wiring into the existing app ────────────────────────────────────
  function wire() {
    if (!window.PKEngine || typeof window.buildMain !== 'function') return setTimeout(wire, 200);

    var origBuild = window.buildMain;
    window.buildMain = function () { var r = origBuild.apply(this, arguments); augment(); return r; };

    var origSwitch = window.switchGame;
    window.switchGame = function (id) {
      var r = origSwitch.apply(this, arguments);
      if (MIGRATED[id] && inRoom()) {
        var snap = E().snapshot;
        if (!snap || !snap.session || snap.session.gameType !== id) run(E().startGame(id));
        else { lastSig = null; mapState(snap); origBuild(); }
      }
      return r;
    };

    // Migrated games are server-owned: never write them into the legacy row.
    var origPush = window.pushState;
    if (typeof origPush === 'function') {
      window.pushState = function () {
        if (MIGRATED[activeId()]) return;
        return origPush.apply(this, arguments);
      };
    }

    window.PKEngine.on(onSnapshot);
  }
  wire();
})();
