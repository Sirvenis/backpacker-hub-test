(() => {
  const Rules = window.HiddenCaseRules;
  const SAVE_KEY = 'toolbox.blackwoodHiddenCase.v1';
  const BEST_KEY = SAVE_KEY + '.bestMs';
  const foundEl = document.querySelector('#foundCount');
  const hintEl = document.querySelector('#hintCount');
  const bestEl = document.querySelector('#bestTime');
  const msgEl = document.querySelector('#message');
  const listEl = document.querySelector('#objectList');
  const hintBtn = document.querySelector('#hintBtn');
  const newBtn = document.querySelector('#newCaseBtn');
  let state = Rules.createGame(Date.now());
  let sceneRef;

  function setMessage(text) { msgEl.textContent = text; }
  function save() { localStorage.setItem(SAVE_KEY, Rules.encodeSave(state)); }
  function bestMs() { return Number(localStorage.getItem(BEST_KEY) || '0') || 0; }
  function saveBest(ms) { if (ms > 0 && (!bestMs() || ms < bestMs())) localStorage.setItem(BEST_KEY, String(ms)); }
  function load() { state = Rules.decodeSave(localStorage.getItem(SAVE_KEY), Date.now()); }

  function syncUi() {
    foundEl.textContent = `${state.found.length}/${Rules.OBJECTS.length}`;
    hintEl.textContent = state.hints;
    bestEl.textContent = bestMs() ? Rules.formatTime(bestMs()) : '—';
    listEl.innerHTML = Rules.OBJECTS.map((object) => {
      const found = Rules.isFound(state, object.id);
      return `<li class="${found ? 'found' : ''}"><span>${object.name}</span><span class="tick">${found ? '✓' : '•'}</span></li>`;
    }).join('');
    hintBtn.disabled = state.hints <= 0 || state.found.length === Rules.OBJECTS.length;
  }

  function completeIfNeeded() {
    if (!state.completedAt) return;
    const elapsed = state.completedAt - state.startedAt;
    saveBest(elapsed);
    setMessage(`Case closed in ${Rules.formatTime(elapsed)}. The study gives up its secrets.`);
  }

  class HiddenCaseScene extends Phaser.Scene {
    constructor() { super('HiddenCaseScene'); }
    create() {
      sceneRef = this;
      this.fxLayer = this.add.container(0, 0);
      this.input.on('pointerdown', (pointer) => this.handlePointer(pointer));
      this.draw();
    }
    dims() {
      const width = this.scale.width;
      const height = this.scale.height;
      return { width, height, sx: width / 900, sy: height / 620 };
    }
    px(nx) { return nx * this.scale.width; }
    py(ny) { return ny * this.scale.height; }
    handlePointer(pointer) {
      const nx = pointer.x / this.scale.width;
      const ny = pointer.y / this.scale.height;
      const result = Rules.clickScene(state, nx, ny, Date.now());
      if (!result.ok) {
        setMessage('Nothing there. Try another detail in the study.');
        this.cameras.main.shake(70, 0.0025);
        return;
      }
      state = result.game;
      this.reveal(result.object);
      setMessage(`Found: ${result.object.name}.`);
      save();
      syncUi();
      if (result.completed) completeIfNeeded();
      this.draw();
    }
    reveal(object) {
      const ring = this.add.circle(this.px(object.x), this.py(object.y), 36, 0xfacc15, 0.15);
      ring.setStrokeStyle(4, 0xfacc15, 0.95);
      this.tweens.add({ targets: ring, scale: 1.8, alpha: 0, duration: 650, onComplete: () => ring.destroy() });
    }
    hint(object) {
      if (!object) return;
      const ring = this.add.circle(this.px(object.x), this.py(object.y), 42, 0xa78bfa, 0.08);
      ring.setStrokeStyle(4, 0xa78bfa, 0.95);
      this.tweens.add({ targets: ring, scale: 1.5, alpha: 0.18, yoyo: true, repeat: 3, duration: 360, onComplete: () => ring.destroy() });
    }
    drawRoom() {
      const { width, height } = this.dims();
      this.add.rectangle(0, 0, width, height, 0x170f19).setOrigin(0);
      this.add.rectangle(width * .5, height * .52, width * .98, height * .86, 0x271827).setOrigin(.5);
      this.add.rectangle(width * .5, height * .12, width * .86, height * .18, 0x3a241f).setOrigin(.5).setStrokeStyle(3, 0x7c4a28, .7);
      // book shelves
      for (let i = 0; i < 18; i += 1) {
        const x = width * .12 + i * width * .04;
        const h = height * (.08 + (i % 4) * .015);
        this.add.rectangle(x, height * .18, width * .026, h, [0x6b2f1a,0x1e3a5f,0x4c1d95,0x365314][i%4]).setStrokeStyle(1,0xfde68a,.12);
      }
      // fireplace
      this.add.rectangle(width * .81, height * .51, width * .19, height * .28, 0x2b1d19).setStrokeStyle(4, 0x7c4a28, .8);
      this.add.rectangle(width * .81, height * .56, width * .12, height * .13, 0x09090b);
      this.add.circle(width * .81, height * .59, width * .035, 0xf97316, .65);
      this.add.circle(width * .79, height * .595, width * .022, 0xfacc15, .75);
      // desk and chair
      this.add.rectangle(width * .50, height * .62, width * .31, height * .13, 0x51301d).setStrokeStyle(3, 0x9a5b2f, .7);
      this.add.rectangle(width * .50, height * .71, width * .25, height * .06, 0x2b1d19);
      this.add.circle(width * .28, height * .62, width * .07, 0x3a241f).setStrokeStyle(3,0x7c4a28,.7);
      // rug and cabinet
      this.add.ellipse(width * .44, height * .82, width * .50, height * .16, 0x5f1d2f, .85).setStrokeStyle(3,0xf59e0b,.28);
      this.add.rectangle(width * .72, height * .69, width * .16, height * .16, 0x3b2b1e).setStrokeStyle(3,0xb45309,.55);
      // window moon
      this.add.rectangle(width * .22, height * .36, width * .18, height * .18, 0x0f172a).setStrokeStyle(3,0x7c4a28,.8);
      this.add.circle(width * .25, height * .34, width * .025, 0xfef3c7, .85);
    }
    drawObjects() {
      const hidden = (id) => Rules.isFound(state, id);
      // brass key
      if (!hidden('brass-key')) { this.add.rectangle(this.px(.151), this.py(.744), 26, 6, 0xfacc15).setRotation(-.35); this.add.circle(this.px(.132), this.py(.748), 8, 0xfacc15).setStrokeStyle(2,0x7c2d12,.45); }
      // torn letter
      if (!hidden('torn-letter')) { this.add.rectangle(this.px(.512), this.py(.577), 45, 30, 0xf8ead0).setRotation(.12).setStrokeStyle(2,0x7c4a28,.45); this.add.line(this.px(.512), this.py(.577), -14, -5, 16, 6, 0x7c4a28, .45); }
      // candle snuffer
      if (!hidden('candle-snuffer')) { this.add.rectangle(this.px(.814), this.py(.452), 42, 7, 0x9ca3af).setRotation(.45); this.add.circle(this.px(.834), this.py(.468), 9, 0x9ca3af); }
      // muddy glove
      if (!hidden('muddy-glove')) { this.add.ellipse(this.px(.273), this.py(.846), 42, 23, 0x78350f).setRotation(.18); this.add.rectangle(this.px(.289), this.py(.834), 8, 24, 0x78350f).setRotation(.45); }
      // silver spoon
      if (!hidden('silver-spoon')) { this.add.rectangle(this.px(.724), this.py(.667), 36, 5, 0xcbd5e1).setRotation(.25); this.add.ellipse(this.px(.741), this.py(.672), 18, 10, 0xe5e7eb).setRotation(.25); }
      // pocket watch
      if (!hidden('pocket-watch')) { this.add.circle(this.px(.385), this.py(.424), 14, 0xfbbf24).setStrokeStyle(3,0x92400e,.8); this.add.line(this.px(.385), this.py(.424), 0, 0, 7, -5, 0x3b2414, .9); }
      // raven pin
      if (!hidden('raven-pin')) { this.add.text(this.px(.628), this.py(.294), '◆', { fontFamily:'serif', fontSize:'24px', color:'#111827' }).setOrigin(.5).setStroke('#a78bfa',2); }
      // ink bottle
      if (!hidden('ink-bottle')) { this.add.rectangle(this.px(.455), this.py(.616), 20, 28, 0x111827).setStrokeStyle(2,0x38bdf8,.35); this.add.rectangle(this.px(.455), this.py(.596), 13, 8, 0x334155); }
    }
    drawFoundOverlay() {
      Rules.OBJECTS.forEach((object) => {
        if (!Rules.isFound(state, object.id)) return;
        this.add.circle(this.px(object.x), this.py(object.y), 17, 0x22c55e, .16).setStrokeStyle(3,0x22c55e,.8);
        this.add.text(this.px(object.x), this.py(object.y), '✓', { fontFamily:'Arial', fontSize:'18px', color:'#bbf7d0', fontStyle:'bold' }).setOrigin(.5);
      });
    }
    draw() {
      this.children.removeAll();
      this.drawRoom();
      this.drawObjects();
      this.drawFoundOverlay();
      this.add.text(18, 16, 'Tap the study details to find the case objects', { fontFamily:'Arial', fontSize:'16px', color:'#fef3c7', fontStyle:'bold' });
    }
  }

  function newCase() {
    state = Rules.createGame(Date.now());
    save();
    syncUi();
    setMessage('New case opened. Search the study carefully.');
    if (sceneRef) sceneRef.draw();
  }

  function smokeFindFirst() {
    const object = Rules.OBJECTS.find((item) => !Rules.isFound(state, item.id));
    const result = Rules.markFound(state, object.id, Date.now());
    if (result.ok) {
      state = result.game;
      save();
      syncUi();
      if (sceneRef) sceneRef.draw();
    }
    return result;
  }

  load();
  syncUi();
  newBtn.addEventListener('click', newCase);
  hintBtn.addEventListener('click', () => {
    const result = Rules.useHint(state);
    if (!result.ok) { setMessage('No hints left — keep searching.'); return; }
    state = result.game;
    save();
    syncUi();
    setMessage(`Hint: ${result.clue}`);
    if (sceneRef) sceneRef.hint(result.object);
  });

  const parent = document.querySelector('#game');
  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: Math.min(760, Math.max(340, parent.clientWidth || 760)),
    height: 640,
    backgroundColor: '#100d14',
    scene: HiddenCaseScene,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
  };
  new Phaser.Game(config);
  window.HiddenCase = { getState: () => state, newCase, smokeFindFirst };
})();
