const letters = 'EEEEEEEEAAAARRRIIIOOOTTNNSSLLCCUUDDPPMMHGBFYWKVXZQJ';
const values = { A:1,E:1,I:1,O:1,U:1,L:2,N:2,S:2,T:2,R:2,D:3,G:3,B:4,C:4,M:4,P:4,F:5,H:5,V:5,W:5,Y:5,K:6,J:8,X:8,Q:10,Z:10 };
let tray = [];
let score = Number(localStorage.getItem('toolbox.wordSprout.score') || 0);
let history = [];
const el = id => document.getElementById(id);
function drawTray(){ tray = Array.from({length:9}, () => letters[Math.floor(Math.random()*letters.length)]); render('Fresh tray. Make a 3+ letter word.'); }
function canMake(word){ const pool = [...tray]; for (const ch of word) { const i = pool.indexOf(ch); if (i < 0) return false; pool.splice(i,1); } return true; }
function scoreWord(word){ const base = [...word].reduce((sum,ch)=>sum+(values[ch]||0),0); const lengthBonus = word.length >= 7 ? 10 : word.length >= 5 ? 5 : 0; const rareBonus = /[QZXJ]/.test(word) ? 6 : 0; return base + lengthBonus + rareBonus; }
function submit(){
  const word = el('word').value.toUpperCase().replace(/[^A-Z]/g,'');
  if (word.length < 3) return render('Use at least 3 letters.');
  if (!canMake(word)) return render(`The tray cannot make ${word}.`);
  const points = scoreWord(word); score += points;
  const best = Math.max(points, Number(localStorage.getItem('toolbox.wordSprout.best') || 0));
  localStorage.setItem('toolbox.wordSprout.best', String(best));
  localStorage.setItem('toolbox.wordSprout.score', String(score));
  history.unshift({word, points}); history = history.slice(0, 6);
  el('word').value=''; drawTray(); render(`${word} scored ${points}. New tray ready.`);
}
function render(msg){
  el('score').textContent = score; el('best').textContent = localStorage.getItem('toolbox.wordSprout.best') || 0; el('msg').textContent = msg;
  el('tray').innerHTML = tray.map(ch => `<span class="tile">${ch}</span>`).join('');
  el('history').innerHTML = history.map(h => `<div class="score-row"><strong>${h.word}</strong><span>${h.points} pts</span></div>`).join('');
}
el('scoreBtn').addEventListener('click', submit);
el('newBtn').addEventListener('click', drawTray);
el('word').addEventListener('keydown', e => { if(e.key==='Enter') submit(); });
drawTray();
