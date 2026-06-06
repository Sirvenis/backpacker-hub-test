const SIZE = 64;
const jumps = new Map([[3, 14], [9, 22], [18, 31], [28, 44], [41, 55], [15, 6], [26, 11], [39, 24], [52, 36], [61, 47]]);
const climbs = new Set([3, 9, 18, 28, 41]);
const slides = new Set([15, 26, 39, 52, 61]);
let state = { pos: 1, rolls: 0, won: false };
const el = id => document.getElementById(id);
function best() { return localStorage.getItem('toolbox.ladderDash.best') || '—'; }
function saveBest() { const b = Number(localStorage.getItem('toolbox.ladderDash.best') || 9999); if (state.rolls < b) localStorage.setItem('toolbox.ladderDash.best', String(state.rolls)); }
function renderBoard() {
  const board = el('board'); board.innerHTML = '';
  for (let r = 7; r >= 0; r--) {
    const row = [];
    for (let c = 0; c < 8; c++) row.push(r * 8 + c + 1);
    if ((7-r) % 2 === 1) row.reverse();
    for (const n of row) {
      const d = document.createElement('div');
      d.className = 'cell' + (climbs.has(n) ? ' climb' : '') + (slides.has(n) ? ' slide' : '') + (n === state.pos ? ' player' : '') + (n === SIZE ? ' goal' : '');
      d.textContent = n === state.pos ? '●' : n;
      if (jumps.has(n)) d.title = `${n} → ${jumps.get(n)}`;
      board.appendChild(d);
    }
  }
}
function render(msg) { el('pos').textContent = state.pos; el('rolls').textContent = state.rolls; el('best').textContent = best(); el('msg').textContent = msg || 'Ready.'; renderBoard(); }
function roll() {
  if (state.won) return render('You already won. Start a new round.');
  const dice = Math.floor(Math.random()*6)+1;
  state.rolls++;
  let next = state.pos + dice;
  if (next > SIZE) next = SIZE - (next - SIZE);
  let msg = `Rolled ${dice}. Moved to ${next}.`;
  if (jumps.has(next)) { const dest = jumps.get(next); msg += climbs.has(next) ? ` Lucky climb to ${dest}!` : ` Slippery slide to ${dest}!`; next = dest; }
  state.pos = next;
  if (state.pos === SIZE) { state.won = true; saveBest(); msg = `You reached 64 in ${state.rolls} rolls!`; }
  render(msg);
}
function reset() { state = { pos: 1, rolls: 0, won: false }; render('New round. Tap roll.'); }
el('rollBtn').addEventListener('click', roll);
el('newBtn').addEventListener('click', reset);
render('Tap roll to start.');
