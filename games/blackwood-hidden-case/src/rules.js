(() => {
  const OBJECTS = [
    { id: 'brass-key', name: 'Brass key', x: 0.151, y: 0.744, r: 0.035, clue: 'Small and gold near the rug.' },
    { id: 'torn-letter', name: 'Torn letter', x: 0.512, y: 0.577, r: 0.042, clue: 'A pale secret on the desk.' },
    { id: 'candle-snuffer', name: 'Candle snuffer', x: 0.814, y: 0.452, r: 0.040, clue: 'Beside the fireplace light.' },
    { id: 'muddy-glove', name: 'Muddy glove', x: 0.273, y: 0.846, r: 0.045, clue: 'Dropped low by the chair.' },
    { id: 'silver-spoon', name: 'Silver spoon', x: 0.724, y: 0.667, r: 0.035, clue: 'A dinner clue on the cabinet.' },
    { id: 'pocket-watch', name: 'Pocket watch', x: 0.385, y: 0.424, r: 0.037, clue: 'Time waits on the shelves.' },
    { id: 'raven-pin', name: 'Raven pin', x: 0.628, y: 0.294, r: 0.034, clue: 'A dark bird above the desk.' },
    { id: 'ink-bottle', name: 'Ink bottle', x: 0.455, y: 0.616, r: 0.036, clue: 'Black ink beside the letter.' }
  ];

  function createGame(now = Date.now()) {
    return { startedAt: now, found: [], hints: 3, completedAt: null, lastHint: null };
  }

  function isFound(game, id) {
    return game.found.includes(id);
  }

  function findObjectAt(game, nx, ny) {
    return OBJECTS.find((object) => {
      if (isFound(game, object.id)) return false;
      const dx = nx - object.x;
      const dy = ny - object.y;
      return Math.sqrt(dx * dx + dy * dy) <= object.r;
    }) || null;
  }

  function markFound(game, id, now = Date.now()) {
    const object = OBJECTS.find((item) => item.id === id);
    if (!object) return { ok: false, reason: 'unknown', game };
    if (isFound(game, id)) return { ok: false, reason: 'already-found', game };
    const next = { ...game, found: [...game.found, id] };
    if (next.found.length === OBJECTS.length) next.completedAt = now;
    return { ok: true, object, completed: !!next.completedAt, game: next };
  }

  function clickScene(game, nx, ny, now = Date.now()) {
    const object = findObjectAt(game, nx, ny);
    if (!object) return { ok: false, reason: 'miss', game };
    return markFound(game, object.id, now);
  }

  function useHint(game) {
    if (game.hints <= 0) return { ok: false, reason: 'no-hints', game };
    const remaining = OBJECTS.find((object) => !isFound(game, object.id));
    if (!remaining) return { ok: false, reason: 'complete', game };
    return { ok: true, object: remaining, clue: remaining.clue, game: { ...game, hints: game.hints - 1, lastHint: remaining.id } };
  }

  function formatTime(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return '—';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function encodeSave(game) {
    return JSON.stringify({ startedAt: game.startedAt, found: game.found, hints: game.hints, completedAt: game.completedAt });
  }

  function decodeSave(payload, now = Date.now()) {
    try {
      const raw = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (!raw || !Array.isArray(raw.found)) return createGame(now);
      const validIds = new Set(OBJECTS.map((object) => object.id));
      const found = [...new Set(raw.found.filter((id) => validIds.has(id)))];
      return {
        startedAt: Number.isFinite(raw.startedAt) ? raw.startedAt : now,
        found,
        hints: Math.max(0, Math.min(3, Number(raw.hints) || 0)),
        completedAt: Number.isFinite(raw.completedAt) ? raw.completedAt : null,
        lastHint: null
      };
    } catch {
      return createGame(now);
    }
  }

  const api = { OBJECTS, createGame, isFound, findObjectAt, markFound, clickScene, useHint, formatTime, encodeSave, decodeSave };
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof window !== 'undefined') window.HiddenCaseRules = api;
})();
