(() => {
  const SIZE = 8;
  const PIECES = [
    { id: 'single', color: 0x38bdf8, cells: [[0,0]] },
    { id: 'bar2h', color: 0x22c55e, cells: [[0,0],[1,0]] },
    { id: 'bar2v', color: 0x22c55e, cells: [[0,0],[0,1]] },
    { id: 'bar3h', color: 0xfacc15, cells: [[0,0],[1,0],[2,0]] },
    { id: 'bar3v', color: 0xfacc15, cells: [[0,0],[0,1],[0,2]] },
    { id: 'square2', color: 0xfb7185, cells: [[0,0],[1,0],[0,1],[1,1]] },
    { id: 'corner3', color: 0xa78bfa, cells: [[0,0],[0,1],[1,1]] },
    { id: 'corner4', color: 0xf97316, cells: [[0,0],[0,1],[0,2],[1,2]] },
    { id: 'tee4', color: 0x60a5fa, cells: [[0,0],[1,0],[2,0],[1,1]] },
    { id: 'zig4', color: 0x34d399, cells: [[1,0],[2,0],[0,1],[1,1]] }
  ];

  function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
  }

  function getPiece(id) {
    return PIECES.find((piece) => piece.id === id) || PIECES[0];
  }

  function createRandom(seed = Date.now()) {
    let state = Math.abs(Math.floor(seed)) || 1;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  }

  function drawPieces(rand) {
    return [0, 1, 2].map(() => PIECES[Math.floor(rand() * PIECES.length)].id);
  }

  function createGame(seed = Date.now()) {
    const rand = createRandom(seed);
    return {
      size: SIZE,
      grid: emptyGrid(),
      score: 0,
      clears: 0,
      moves: 0,
      gameOver: false,
      seed,
      pieces: drawPieces(rand),
      rand
    };
  }

  function canPlace(grid, pieceOrId, x, y) {
    const piece = typeof pieceOrId === 'string' ? getPiece(pieceOrId) : pieceOrId;
    if (!piece || x < 0 || y < 0) return false;
    return piece.cells.every(([dx, dy]) => {
      const px = x + dx;
      const py = y + dy;
      return px >= 0 && py >= 0 && px < SIZE && py < SIZE && grid[py][px] === 0;
    });
  }

  function fullLines(grid) {
    const rows = [];
    const cols = [];
    for (let y = 0; y < SIZE; y += 1) {
      if (grid[y].every(Boolean)) rows.push(y);
    }
    for (let x = 0; x < SIZE; x += 1) {
      let full = true;
      for (let y = 0; y < SIZE; y += 1) if (!grid[y][x]) full = false;
      if (full) cols.push(x);
    }
    return { rows, cols };
  }

  function clearLines(grid, rows, cols) {
    const next = cloneGrid(grid);
    rows.forEach((y) => { for (let x = 0; x < SIZE; x += 1) next[y][x] = 0; });
    cols.forEach((x) => { for (let y = 0; y < SIZE; y += 1) next[y][x] = 0; });
    return next;
  }

  function hasAnyMove(grid, pieces) {
    return pieces.some((id) => {
      const piece = getPiece(id);
      for (let y = 0; y < SIZE; y += 1) {
        for (let x = 0; x < SIZE; x += 1) {
          if (canPlace(grid, piece, x, y)) return true;
        }
      }
      return false;
    });
  }

  function placePiece(game, pieceIndex, x, y) {
    if (game.gameOver) return { ok: false, reason: 'game-over', game };
    const pieceId = game.pieces[pieceIndex];
    if (!pieceId) return { ok: false, reason: 'missing-piece', game };
    const piece = getPiece(pieceId);
    if (!canPlace(game.grid, piece, x, y)) return { ok: false, reason: 'blocked', game };

    const grid = cloneGrid(game.grid);
    piece.cells.forEach(([dx, dy]) => { grid[y + dy][x + dx] = piece.color; });
    const lines = fullLines(grid);
    const lineCount = lines.rows.length + lines.cols.length;
    const clearedGrid = lineCount ? clearLines(grid, lines.rows, lines.cols) : grid;
    const nextPieces = game.pieces.slice();
    nextPieces[pieceIndex] = null;
    const base = piece.cells.length;
    const lineBonus = lineCount ? (lineCount * lineCount * 12) : 0;
    const next = {
      ...game,
      grid: clearedGrid,
      score: game.score + base + lineBonus,
      clears: game.clears + lineCount,
      moves: game.moves + 1,
      pieces: nextPieces
    };
    if (next.pieces.every((p) => !p)) {
      next.pieces = drawPieces(next.rand);
    }
    next.gameOver = !hasAnyMove(next.grid, next.pieces.filter(Boolean));
    return { ok: true, reason: lineCount ? 'cleared' : 'placed', lines, points: base + lineBonus, game: next };
  }

  const api = { SIZE, PIECES, getPiece, emptyGrid, cloneGrid, createGame, canPlace, fullLines, clearLines, hasAnyMove, placePiece };
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof window !== 'undefined') window.BlockDockRules = api;
})();
