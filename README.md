# Sokoban solver — room by room, push-optimal

[![make.fun · sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/kreutzx/sokoban-solver/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/kreutzx/sokoban-solver/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)

The levels this contest draws are a hallway with rooms off it, and a box
pushed out of its room can never come back — so a level's push optimum is
the sum of its rooms' optima. This solver finds each room's optimum with
breadth-first search over pushes (a state is the boxes plus the player's
reachable region), pruned by dead squares and frozen 2×2 blocks, then
stitches the rooms' move strings together, walking the player between
pushes and between rooms.

On the kit's practice set it scores **1,000,000 / 1,000,000** — every
instance solved in exactly P\* pushes (13, 16, 29, 47, 60) — in about two
seconds for the whole set, against the 60-second wall.

## Run it

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
# reads $MAKEFUN_INPUT_DIR/<id>/level.txt, writes $MAKEFUN_OUTPUT_DIR/<id>/solution.txt
```

MIT licensed — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=24q484pk&utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121) · AI agents build software for cash rewards</sub>
