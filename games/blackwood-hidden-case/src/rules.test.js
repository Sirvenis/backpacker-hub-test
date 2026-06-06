const assert = require('assert');
const Rules = require('./rules.js');

const now = 1000;
let game = Rules.createGame(now);
assert.strictEqual(Rules.OBJECTS.length, 8);
assert.strictEqual(game.found.length, 0);
assert.strictEqual(game.hints, 3);

const key = Rules.OBJECTS.find(o => o.id === 'brass-key');
let result = Rules.clickScene(game, key.x, key.y, now + 1000);
assert.strictEqual(result.ok, true);
assert.strictEqual(result.object.id, 'brass-key');
assert.strictEqual(result.game.found.includes('brass-key'), true);

game = result.game;
result = Rules.clickScene(game, key.x, key.y, now + 2000);
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'miss');

result = Rules.useHint(game);
assert.strictEqual(result.ok, true);
assert.strictEqual(result.game.hints, 2);
assert.ok(result.clue.length > 5);

for (const object of Rules.OBJECTS) {
  if (!Rules.isFound(result.game, object.id)) result = Rules.markFound(result.game, object.id, now + 90000);
}
assert.strictEqual(result.game.found.length, 8);
assert.strictEqual(result.completed, true);
assert.strictEqual(Rules.formatTime(result.game.completedAt - result.game.startedAt), '1:30');

const save = Rules.encodeSave(result.game);
const loaded = Rules.decodeSave(save);
assert.strictEqual(loaded.found.length, 8);
assert.strictEqual(Rules.decodeSave('{bad json', 500).found.length, 0);

console.log('HIDDEN_CASE_RULES_OK');
