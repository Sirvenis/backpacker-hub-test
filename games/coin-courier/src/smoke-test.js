const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const required = [
  'index.html',
  'styles.css',
  'vendor/phaser/phaser.min.js',
  'src/game.js'
];
for (const file of required) {
  const p = path.join(root, file);
  assert.ok(fs.existsSync(p), `${file} exists`);
  assert.ok(fs.statSync(p).size > 100, `${file} is not empty`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(html.includes('vendor/phaser/phaser.min.js'), 'HTML uses vendored Phaser');
assert.ok(html.includes('src/game.js?v=1'), 'HTML loads game script');
const js = fs.readFileSync(path.join(root, 'src/game.js'), 'utf8');
assert.ok(js.includes('class GameScene extends Phaser.Scene'), 'GameScene exists');
assert.ok(js.includes('createInitialState'), 'testable state function exists');
assert.ok(js.includes('CoinCourier'), 'browser export exists');
console.log('PHASER_COIN_RUNNER_SMOKE_OK');
