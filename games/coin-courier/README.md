# Coin Courier — Phaser Benchmark

A small Phaser.js browser game used to test whether Phaser should be the default engine for Toolbox website games.

## What it tests

- Vendored Phaser runtime, no CDN dependency.
- Static hosting compatibility.
- Mobile-friendly canvas scaling.
- Keyboard and touch input.
- Simple arcade loop: collect coins, avoid hazards, lives, best score.

## Run locally

```bash
cd /home/andrew/projects/active/toolbox-game-engine-lab/phaser/coin-runner
export PATH=/home/andrew/.hermes/node/bin:$PATH
npm test
python3 -m http.server 8144 --bind 127.0.0.1
```

Open:

http://127.0.0.1:8144/

## Early verdict

Phaser is a good fit for fast, polished Toolbox browser games. It is heavier than plain JavaScript but much more capable for arcade/puzzle/platform games.
