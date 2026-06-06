const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const cells = 21;
const cell = canvas.width / cells;
let snake, dir, nextDir, food, score, timer, running, paused;
const el = id => document.getElementById(id);
function best(){ return Number(localStorage.getItem('toolbox.pocketSnake.best') || 0); }
function placeFood(){
  do { food = {x: Math.floor(Math.random()*cells), y: Math.floor(Math.random()*cells)}; }
  while (snake.some(p => p.x===food.x && p.y===food.y));
}
function start(){ snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]; dir={x:1,y:0}; nextDir=dir; score=0; running=true; paused=false; placeFood(); clearInterval(timer); timer=setInterval(tick, 130); render('Go!'); }
function setDir(name){ const map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}; const d=map[name]; if(!d) return; if (dir && d.x === -dir.x && d.y === -dir.y) return; nextDir=d; }
function tick(){
  if(!running || paused) return;
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  if(head.x<0||head.y<0||head.x>=cells||head.y>=cells||snake.some(p=>p.x===head.x&&p.y===head.y)) return gameOver();
  snake.unshift(head);
  if(head.x===food.x && head.y===food.y){ score += 10; placeFood(); }
  else snake.pop();
  draw(); updateStats();
}
function gameOver(){ running=false; clearInterval(timer); if(score>best()) localStorage.setItem('toolbox.pocketSnake.best', String(score)); render(`Game over. Score ${score}.`); }
function updateStats(){ el('score').textContent=score||0; el('best').textContent=best(); }
function draw(){
  ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='rgba(255,255,255,.08)';
  for(let i=0;i<=cells;i++){ ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*cell); ctx.lineTo(canvas.width,i*cell); ctx.stroke(); }
  ctx.fillStyle='#22c55e'; ctx.fillRect(food.x*cell+3,food.y*cell+3,cell-6,cell-6);
  snake.forEach((p,i)=>{ ctx.fillStyle=i?'#14b8a6':'#facc15'; ctx.fillRect(p.x*cell+2,p.y*cell+2,cell-4,cell-4); });
}
function render(msg){ updateStats(); el('msg').textContent=msg; draw(); }
el('startBtn').addEventListener('click', start);
el('pauseBtn').addEventListener('click', ()=>{ if(!running) return; paused=!paused; render(paused?'Paused.':'Go!'); });
document.addEventListener('keydown', e=>{ if(e.key==='ArrowUp') setDir('up'); if(e.key==='ArrowDown') setDir('down'); if(e.key==='ArrowLeft') setDir('left'); if(e.key==='ArrowRight') setDir('right'); });
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>setDir(b.dataset.dir)));
snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]; food={x:14,y:10}; score=0; running=false; paused=false; draw(); updateStats();
