/**
 * Pookie & I — multiplayer engine client.
 *
 * The single way the app talks to the server-authoritative game engine. It
 * holds the durable participant token, calls the `game` edge function, and
 * keeps one realtime subscription on the room row: every server write bumps
 * that row, the client re-reads an authoritative snapshot, and the UI renders
 * from the snapshot. No state is pushed from the browser.
 */
(function () {
  // Config is published by the app's inline script, which runs after this
  // file loads, so it is read at call time rather than at load time.
  function fnUrl() { return window.__PK_SUPABASE_URL + '/functions/v1/game'; }
  function anonKey() { return window.__PK_SUPABASE_KEY; }
  var TOKEN_KEY = 'pookie_participant_token';

  var listeners = [];
  var channel = null;
  var refreshQueued = false;
  var heartbeatTimer = null;

  var engine = {
    token: null,
    snapshot: null,
    /** Seconds of silence after which a participant counts as disconnected. */
    STALE_AFTER_MS: 30000,
  };

  function readToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  function writeToken(t) {
    engine.token = t;
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  }
  engine.token = readToken();

  /** One request shape for every operation; throws an Error with `.code`. */
  async function call(op, extra) {
    var body = Object.assign({ op: op }, extra || {});
    var ANON = anonKey();
    var headers = { 'Content-Type': 'application/json', apikey: ANON, Authorization: 'Bearer ' + ANON };
    // A signed-in player sends their real session so the server can attribute
    // history and leaderboard points to their account.
    try {
      if (window.sb && (op === 'link_user')) {
        var s = await window.sb.auth.getSession();
        if (s && s.data && s.data.session) headers.Authorization = 'Bearer ' + s.data.session.access_token;
      }
    } catch (e) {}

    var res, payload;
    try {
      res = await fetch(fnUrl(), { method: 'POST', headers: headers, body: JSON.stringify(body) });
      payload = await res.json();
    } catch (e) {
      var offline = new Error('You seem to be offline');
      offline.code = 'OFFLINE';
      throw offline;
    }
    if (!res.ok || payload.ok === false) {
      var err = new Error((payload && payload.message) || 'Something went wrong');
      err.code = (payload && payload.code) || 'SERVER_ERROR';
      throw err;
    }
    return payload;
  }

  function emit(snap) {
    engine.snapshot = snap;
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](snap); } catch (e) { console.error(e); }
    }
  }

  function adopt(payload) {
    if (payload && payload.participantToken) writeToken(payload.participantToken);
    if (payload && payload.room) emit(payload);
    return payload;
  }

  /** Coalesces bursts of change signals into one snapshot read. */
  function queueRefresh() {
    if (refreshQueued || !engine.token) return;
    refreshQueued = true;
    setTimeout(function () {
      refreshQueued = false;
      engine.refresh().catch(function () {});
    }, 60);
  }

  function subscribe(roomId) {
    if (!window.sb) return;
    if (channel) { try { window.sb.removeChannel(channel); } catch (e) {} }
    channel = window.sb.channel('pk-room-' + roomId)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: 'id=eq.' + roomId },
        queueRefresh)
      .subscribe();
  }

  // ── Public API ────────────────────────────────────────────────────
  engine.call = call;
  engine.on = function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; };
  engine.hasSession = function () { return !!engine.token; };

  engine.createRoom = async function (displayName) {
    var out = adopt(await call('create_room', { display_name: displayName }));
    subscribe(out.room.id);
    engine.startHeartbeat();
    return out;
  };

  engine.joinRoom = async function (code, displayName) {
    var out = adopt(await call('join_room', { room_code: code, display_name: displayName }));
    subscribe(out.room.id);
    engine.startHeartbeat();
    return out;
  };

  /** Rejoin after a refresh, tab restore or reconnect. */
  engine.resume = async function () {
    if (!engine.token) return null;
    var out;
    try {
      out = adopt(await call('reconnect_participant', { participant_token: engine.token }));
    } catch (e) {
      if (e.code === 'UNAUTHORIZED' || e.code === 'ROOM_EXPIRED' || e.code === 'NO_ROOM') writeToken(null);
      throw e;
    }
    subscribe(out.room.id);
    engine.startHeartbeat();
    return out;
  };

  engine.refresh = async function () {
    if (!engine.token) return null;
    return adopt(await call('get_state', { participant_token: engine.token }));
  };

  engine.startGame = function (gameType) {
    return call('start_game', { participant_token: engine.token, game_type: gameType }).then(adopt);
  };
  engine.rematch = function (gameType) {
    return call('start_rematch', { participant_token: engine.token, game_type: gameType }).then(adopt);
  };
  engine.action = function (type, payload) {
    var round = engine.snapshot && engine.snapshot.round;
    return call('submit_action', {
      participant_token: engine.token,
      action_id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
      action_type: type,
      payload: payload || {},
      round_id: round ? round.id : null,
      expected_version: round ? round.version : null,
    }).then(adopt);
  };
  engine.privateSubmit = function (payload) {
    return call('submit_private_submission', {
      participant_token: engine.token,
      action_id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
      payload: payload || {},
    }).then(adopt);
  };
  engine.sendMessage = function (text) {
    return call('send_message', { participant_token: engine.token, message: text });
  };
  engine.adjustScore = function (role, delta) {
    return call('adjust_score', { participant_token: engine.token, role: role, delta: delta }).then(adopt);
  };
  engine.resetScores = function () {
    return call('reset_scores', { participant_token: engine.token }).then(adopt);
  };
  engine.completeGame = function () {
    return call('complete_game', { participant_token: engine.token }).then(adopt);
  };
  engine.linkUser = function () {
    return call('link_user', { participant_token: engine.token }).then(adopt);
  };
  engine.leave = function () {
    var t = engine.token;
    writeToken(null);
    engine.stopHeartbeat();
    if (channel && window.sb) { try { window.sb.removeChannel(channel); } catch (e) {} channel = null; }
    return call('leave_room', { participant_token: t }).catch(function () {});
  };

  /** Liveness. The server timestamps it; both clients read the same truth. */
  engine.startHeartbeat = function () {
    engine.stopHeartbeat();
    var beat = function () {
      if (!engine.token || document.visibilityState === 'hidden') return;
      call('heartbeat', { participant_token: engine.token }).catch(function () {});
    };
    beat();
    heartbeatTimer = setInterval(beat, 10000);
  };
  engine.stopHeartbeat = function () {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  };

  /** Is the given role currently present, from the server's timestamps? */
  engine.isPresent = function (role) {
    var snap = engine.snapshot;
    if (!snap) return false;
    var p = (snap.participants || []).filter(function (x) { return x.role === role; })[0];
    if (!p || p.status === 'LEFT') return false;
    return (Date.now() - new Date(p.last_seen_at).getTime()) < engine.STALE_AFTER_MS;
  };
  engine.participant = function (role) {
    var snap = engine.snapshot;
    if (!snap) return null;
    return (snap.participants || []).filter(function (x) { return x.role === role; })[0] || null;
  };

  // Presence goes stale on a timer, so re-render periodically even when the
  // server is quiet — this only re-reads local snapshot data.
  setInterval(function () {
    if (engine.snapshot) emit(engine.snapshot);
  }, 8000);

  // Coming back from a locked phone or a dead network: re-read the truth.
  window.addEventListener('online', queueRefresh);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && engine.token) {
      engine.startHeartbeat();
      queueRefresh();
      if (engine.snapshot && engine.snapshot.room) subscribe(engine.snapshot.room.id);
    }
  });

  window.PKEngine = engine;
})();
