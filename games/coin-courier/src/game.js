(() => {
  const WIDTH = 800;
  const HEIGHT = 480;
  const LANES = [140, 260, 380, 500, 620];
  const PLAYER_Y = 405;

  function createInitialState() {
    return { score: 0, lives: 3, speed: 160, best: Number(localStorage.getItem('coinCourierBest') || 0), over: false };
  }

  function updateBest(score) {
    const best = Math.max(score, Number(localStorage.getItem('coinCourierBest') || 0));
    localStorage.setItem('coinCourierBest', String(best));
    return best;
  }

  class GameScene extends Phaser.Scene {
    constructor() { super('game'); }

    create() {
      this.state = createInitialState();
      this.inputTargetX = WIDTH / 2;
      this.spawnTimer = 0;
      this.spawnEvery = 720;
      this.objects = [];
      this.drawBackground();
      this.player = this.add.circle(WIDTH / 2, PLAYER_Y, 22, 0x22c55e);
      this.playerRing = this.add.circle(WIDTH / 2, PLAYER_Y, 30, 0xffffff, 0.14).setStrokeStyle(3, 0xfacc15);
      this.hud = this.add.text(22, 18, '', { fontFamily: 'system-ui', fontSize: '24px', fontStyle: 'bold', color: '#ffffff' });
      this.help = this.add.text(WIDTH / 2, HEIGHT - 28, 'Collect gold coins. Avoid red sparks.', { fontFamily: 'system-ui', fontSize: '18px', color: '#dbeafe' }).setOrigin(.5);
      this.keys = this.input.keyboard.addKeys({ left: 'LEFT,A', right: 'RIGHT,D', space: 'SPACE' });
      this.input.on('pointerdown', (p) => { this.inputTargetX = p.x < WIDTH / 2 ? 170 : 630; });
      this.input.on('pointermove', (p) => { if (p.isDown) this.inputTargetX = Phaser.Math.Clamp(p.x, 80, WIDTH - 80); });
      document.getElementById('status').textContent = 'Phaser loaded. Game running.';
      this.renderHud();
    }

    drawBackground() {
      this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 0x0f172a);
      for (let i = 0; i < LANES.length; i++) {
        this.add.line(0, 0, LANES[i], 70, LANES[i], HEIGHT, 0x334155, .65).setLineWidth(2);
      }
      for (let y = 90; y < HEIGHT; y += 80) this.add.line(0, 0, 80, y, WIDTH-80, y, 0x1e293b, .7).setLineWidth(1);
    }

    update(_, delta) {
      if (this.state.over) {
        if (this.keys.space.isDown) this.scene.restart();
        return;
      }
      if (this.keys.left.isDown) this.inputTargetX -= 7;
      if (this.keys.right.isDown) this.inputTargetX += 7;
      this.inputTargetX = Phaser.Math.Clamp(this.inputTargetX, 70, WIDTH - 70);
      this.player.x = Phaser.Math.Linear(this.player.x, this.inputTargetX, .17);
      this.playerRing.x = this.player.x;
      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnEvery) { this.spawnTimer = 0; this.spawnObject(); }
      this.objects.forEach((obj) => obj.y += (this.state.speed + this.state.score * 2) * delta / 1000);
      this.checkCollisions();
      this.cleanupObjects();
    }

    spawnObject() {
      const x = LANES[Math.floor(Math.random() * LANES.length)];
      const isCoin = Math.random() > .34;
      const obj = isCoin
        ? this.add.circle(x, 44, 17, 0xfacc15).setStrokeStyle(4, 0xf59e0b)
        : this.add.star(x, 44, 7, 10, 23, 0xef4444).setStrokeStyle(3, 0xfee2e2);
      obj.kind = isCoin ? 'coin' : 'hazard';
      this.objects.push(obj);
    }

    checkCollisions() {
      const remaining = [];
      for (const obj of this.objects) {
        const d = Phaser.Math.Distance.Between(obj.x, obj.y, this.player.x, this.player.y);
        if (d < 42) {
          if (obj.kind === 'coin') { this.state.score += 1; this.flash(0xfacc15); }
          else { this.state.lives -= 1; this.flash(0xef4444); if (this.state.lives <= 0) this.endGame(); }
          obj.destroy();
        } else remaining.push(obj);
      }
      this.objects = remaining;
      this.renderHud();
    }

    cleanupObjects() {
      this.objects = this.objects.filter((obj) => { if (obj.y > HEIGHT + 50) { obj.destroy(); return false; } return true; });
    }

    flash(color) {
      const c = this.add.circle(this.player.x, this.player.y, 42, color, .28);
      this.tweens.add({ targets: c, alpha: 0, scale: 1.8, duration: 260, onComplete: () => c.destroy() });
    }

    endGame() {
      this.state.over = true;
      this.state.best = updateBest(this.state.score);
      this.add.rectangle(WIDTH/2, HEIGHT/2, 520, 190, 0x020617, .86).setStrokeStyle(3, 0xfacc15);
      this.add.text(WIDTH/2, HEIGHT/2 - 40, 'Run complete', { fontFamily: 'system-ui', fontSize: '42px', fontStyle: 'bold', color: '#facc15' }).setOrigin(.5);
      this.add.text(WIDTH/2, HEIGHT/2 + 24, `Score ${this.state.score} · Best ${this.state.best}\nPress Space or reload to try again`, { fontFamily: 'system-ui', fontSize: '22px', color: '#ffffff', align: 'center' }).setOrigin(.5);
    }

    renderHud() {
      this.hud.setText(`Score ${this.state.score}   Lives ${this.state.lives}   Best ${this.state.best}`);
    }
  }

  function startGame() {
    if (!window.Phaser) throw new Error('Phaser not loaded');
    return new Phaser.Game({ type: Phaser.AUTO, width: WIDTH, height: HEIGHT, parent: 'game', backgroundColor: '#0f172a', scene: GameScene, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH } });
  }

  if (typeof window !== 'undefined') {
    window.CoinCourier = { createInitialState, updateBest, startGame };
    window.addEventListener('DOMContentLoaded', startGame);
  }
  if (typeof module !== 'undefined') module.exports = { createInitialState };
})();
