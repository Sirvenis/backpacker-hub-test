(() => {
  const Rules = window.BlockDockRules;
  const SAVE_KEY = 'toolbox.blockDock.save.v1';
  const bestEl = document.querySelector('#best');
  const scoreEl = document.querySelector('#score');
  const clearsEl = document.querySelector('#clears');
  const msgEl = document.querySelector('#message');
  const newBtn = document.querySelector('#newGameBtn');
  let state = Rules.createGame(Date.now());
  let selectedPiece = 0;
  let sceneRef;

  function loadBest() {
    return Number(localStorage.getItem(SAVE_KEY + '.best') || '0') || 0;
  }
  function saveBest(score) {
    if (score > loadBest()) localStorage.setItem(SAVE_KEY + '.best', String(score));
  }
  function saveState() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ grid: state.grid, score: state.score, clears: state.clears, moves: state.moves, pieces: state.pieces, gameOver: state.gameOver }));
    saveBest(state.score);
  }
  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!raw || !Array.isArray(raw.grid) || !Array.isArray(raw.pieces)) return;
      state = { ...Rules.createGame(Date.now()), ...raw, rand: Rules.createGame(Date.now()).rand };
      if (!state.pieces.some(Boolean)) state.pieces = Rules.createGame(Date.now()).pieces;
    } catch { /* start fresh */ }
  }
  function setMessage(text) { msgEl.textContent = text; }
  function syncStats() {
    scoreEl.textContent = state.score;
    bestEl.textContent = Math.max(loadBest(), state.score);
    clearsEl.textContent = state.clears;
  }

  class BlockDockScene extends Phaser.Scene {
    constructor() { super('BlockDockScene'); }
    create() {
      sceneRef = this;
      this.cell = 48;
      this.boardX = 38;
      this.boardY = 36;
      this.boardLayer = this.add.container(0, 0);
      this.pieceLayer = this.add.container(0, 0);
      this.input.on('pointerdown', (pointer) => this.handlePointer(pointer));
      this.draw();
    }
    resizeValues() {
      const width = this.scale.width;
      this.cell = Math.floor(Math.min((width - 56) / 8, 54));
      this.boardX = Math.floor((width - this.cell * 8) / 2);
      this.boardY = 34;
    }
    handlePointer(pointer) {
      const x = Math.floor((pointer.x - this.boardX) / this.cell);
      const y = Math.floor((pointer.y - this.boardY) / this.cell);
      if (x < 0 || y < 0 || x >= 8 || y >= 8) return;
      const result = Rules.placePiece(state, selectedPiece, x, y);
      if (!result.ok) {
        setMessage(result.reason === 'blocked' ? 'That dock is blocked — try another spot.' : 'Choose a live piece.');
        this.cameras.main.shake(90, 0.004);
        return;
      }
      state = result.game;
      if (!state.pieces[selectedPiece]) {
        const next = state.pieces.findIndex(Boolean);
        selectedPiece = next >= 0 ? next : 0;
      }
      setMessage(result.reason === 'cleared' ? `Clear! +${result.points} points.` : `Docked! +${result.points} points.`);
      if (state.gameOver) setMessage('No more docks available. Start a new game?');
      saveState();
      syncStats();
      this.draw();
    }
    drawCell(x, y, color, alpha = 1) {
      const px = this.boardX + x * this.cell;
      const py = this.boardY + y * this.cell;
      const rect = this.add.rectangle(px + 1, py + 1, this.cell - 4, this.cell - 4, color, alpha).setOrigin(0);
      rect.setStrokeStyle(2, 0xffffff, 0.08);
      rect.setRadius?.(8);
      this.boardLayer.add(rect);
    }
    drawBoard() {
      for (let y = 0; y < 8; y += 1) {
        for (let x = 0; x < 8; x += 1) {
          this.drawCell(x, y, state.grid[y][x] || 0x1f2a44, state.grid[y][x] ? 1 : 0.78);
        }
      }
    }
    drawPieces() {
      const startY = this.boardY + this.cell * 8 + 34;
      const slotW = this.scale.width / 3;
      state.pieces.forEach((id, i) => {
        const cx = slotW * i + slotW / 2;
        const slot = this.add.rectangle(cx, startY + 44, Math.min(128, slotW - 18), 110, selectedPiece === i ? 0x334155 : 0x162033, 1);
        slot.setStrokeStyle(selectedPiece === i ? 3 : 1, selectedPiece === i ? 0x38bdf8 : 0xffffff, selectedPiece === i ? 0.9 : 0.12);
        slot.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer) => { pointer.event.stopPropagation(); selectedPiece = i; setMessage('Piece selected. Tap the board to dock it.'); this.draw(); });
        this.pieceLayer.add(slot);
        if (!id) {
          const txt = this.add.text(cx, startY + 36, 'USED', { fontFamily: 'Arial', fontSize: '15px', color: '#64748b', fontStyle: 'bold' }).setOrigin(.5);
          this.pieceLayer.add(txt);
          return;
        }
        const piece = Rules.getPiece(id);
        const unit = 22;
        const minX = Math.min(...piece.cells.map(c => c[0]));
        const maxX = Math.max(...piece.cells.map(c => c[0]));
        const minY = Math.min(...piece.cells.map(c => c[1]));
        const maxY = Math.max(...piece.cells.map(c => c[1]));
        const ox = cx - ((maxX - minX + 1) * unit) / 2;
        const oy = startY + 18;
        piece.cells.forEach(([dx, dy]) => {
          const block = this.add.rectangle(ox + dx * unit, oy + dy * unit, unit - 3, unit - 3, piece.color, 1).setOrigin(0);
          block.setStrokeStyle(2, 0xffffff, .20);
          this.pieceLayer.add(block);
        });
      });
    }
    draw() {
      this.resizeValues();
      this.boardLayer.removeAll(true);
      this.pieceLayer.removeAll(true);
      this.drawBoard();
      this.drawPieces();
      if (state.gameOver) {
        this.add.text(this.scale.width / 2, 18, 'GAME OVER', { fontFamily: 'Arial', fontSize: '20px', color: '#facc15', fontStyle: 'bold' }).setOrigin(.5);
      }
    }
  }

  function newGame() {
    state = Rules.createGame(Date.now());
    selectedPiece = 0;
    saveState();
    syncStats();
    setMessage('New dock ready. Pick a piece and start clearing rows.');
    if (sceneRef) sceneRef.draw();
  }

  loadState();
  syncStats();
  newBtn.addEventListener('click', newGame);
  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: Math.min(680, Math.max(340, document.querySelector('#game').clientWidth || 680)),
    height: 690,
    backgroundColor: '#0b1020',
    scene: BlockDockScene,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
  };
  new Phaser.Game(config);
  function smokePlace(x = 0, y = 0) {
    const result = Rules.placePiece(state, selectedPiece, x, y);
    if (result.ok) {
      state = result.game;
      saveState();
      syncStats();
      if (sceneRef) sceneRef.draw();
    }
    return result;
  }
  window.BlockDock = { getState: () => state, newGame, smokePlace };
})();
