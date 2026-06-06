const assert = require('assert');
const Rules = require('./rules.js');

let game = Rules.createGame(123);
assert.strictEqual(game.grid.length, 8);
assert.strictEqual(game.pieces.length, 3);
assert.strictEqual(Rules.canPlace(game.grid, 'square2', 0, 0), true);
assert.strictEqual(Rules.canPlace(game.grid, 'square2', 7, 7), false);

let result = Rules.placePiece(game, 0, 0, 0);
assert.strictEqual(result.ok, true);
assert.ok(result.game.score > 0);
assert.strictEqual(result.game.moves, 1);

let grid = Rules.emptyGrid();
for (let x = 1; x < 8; x += 1) grid[0][x] = 0xffffff;
let lineGame = { ...Rules.createGame(9), grid, pieces: ['single', null, null] };
result = Rules.placePiece(lineGame, 0, 0, 0);
assert.strictEqual(result.ok, true);
assert.strictEqual(result.game.clears, 1);
assert.strictEqual(result.game.grid[0].every(v => v === 0), true);
assert.ok(result.game.score >= 13);

let full = Rules.emptyGrid().map(row => row.map(() => 0xffffff));
full[7][7] = 0;
assert.strictEqual(Rules.hasAnyMove(full, ['single']), true);
assert.strictEqual(Rules.hasAnyMove(full, ['square2']), false);

console.log('BLOCK_DOCK_RULES_OK');
