// Sokoban: room-by-room push-optimal solver (Node 22, no deps).
// A level is a hallway with rooms off it; a box pushed out of its room
// never returns, so the level optimum is the sum of its rooms' optima.
// Each room falls to breadth-first search over pushes (state: the boxes
// plus the player's reachable region), pruned by dead squares (no push
// from them reaches a goal) and frozen 2x2 blocks. Moves: LURD, a lower
import { readFileSync as rf, writeFileSync as wf, mkdirSync as md, readdirSync as rd } from "node:fs";
import { join } from "node:path";
const D = [[0, -1, "u", "U"], [0, 1, "d", "D"], [-1, 0, "l", "L"], [1, 0, "r", "R"]];
const CAP = 250000;
function parse(text) {
  const rows = text.split("\n").filter((r) => r.length);
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const wall = new Uint8Array(w * h).fill(1), goals = [], boxes = [];
  let player = -1;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x], i = y * w + x;
      if (ch === "#") continue;
      wall[i] = 0;
      if (ch === "." || ch === "*" || ch === "+") goals.push(i);
      if (ch === "$" || ch === "*") boxes.push(i);
      if (ch === "@" || ch === "+") player = i;
    }
  });
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i / w) | 0;
    if (!x || !y || x === w - 1 || y === h - 1) wall[i] = 1;
  }
  return { w, h, wall, goals, boxes: boxes.sort((a, b) => a - b), player };
}
function live({ w, wall, goals }) {
  const lv = new Uint8Array(wall.length), q = [...goals];
  for (const g of goals) lv[g] = 1;
  while (q.length) {
    const x = q.shift();
    for (const [dx, dy] of D) {
      const d = dy * w + dx, y = x - d;
      if (!wall[y] && !wall[y - d] && !lv[y]) { lv[y] = 1; q.push(y); }
    }
  }
  return lv;
}
function reach({ w, wall }, occ, from, seen, stamp, stack) {
  let low = from, n = 0;
  stack[n++] = from; seen[from] = stamp;
  while (n) {
    const p = stack[--n];
    if (p < low) low = p;
    for (const q of [p - w, p + w, p - 1, p + 1]) {
      if (!wall[q] && !occ[q] && seen[q] !== stamp) { seen[q] = stamp; stack[n++] = q; }
    }
  }
  return low;
}
function frozen({ w, wall }, occ, goal, t) {
  for (const a of [t, t - 1, t - w, t - w - 1]) {
    const b = a + 1, c = a + w, d = c + 1;
    if (!(wall[a] || occ[a]) || !(wall[b] || occ[b]) || !(wall[c] || occ[c]) || !(wall[d] || occ[d])) continue;
    if ((occ[a] && !goal[a]) || (occ[b] && !goal[b]) || (occ[c] && !goal[c]) || (occ[d] && !goal[d])) return true;
  }
  return false;
}
function walk({ w, wall }, occ, from, to) {
  if (from === to) return "";
  const prev = new Int32Array(wall.length).fill(-1), how = [], q = [from];
  prev[from] = from;
  for (let i = 0; i < q.length; i++) {
    const p = q[i];
    if (p === to) break;
    for (const [dx, dy, letter] of D) {
      const s = p + dy * w + dx;
      if (wall[s] || occ[s] || prev[s] !== -1) continue;
      prev[s] = p; how[s] = letter; q.push(s);
    }
  }
  let s = "";
  for (let p = to; p !== from; p = prev[p]) s = how[p] + s;
  return s;
}
function solve(L) {
  const { w, wall, goals } = L, size = wall.length;
  const goal = new Uint8Array(size), lv = live(L), occ = new Uint8Array(size);
  const seen = new Int32Array(size), mark = new Int32Array(size), stack = new Int32Array(size);
  for (const g of goals) goal[g] = 1;
  let stamp = 0;
  const done = (bs) => bs.every((b) => goal[b]);
  if (L.boxes.some((b) => !lv[b])) return null;
  const keyOf = (bs, low) => { let k = low; for (const b of bs) k = k * size + b; return k; };
  const sB = [L.boxes], sP = [L.player], par = [-1], idx = new Map();
  for (const b of L.boxes) occ[b] = 1;
  idx.set(keyOf(L.boxes, reach(L, occ, L.player, seen, ++stamp, stack)), 0);
  for (const b of L.boxes) occ[b] = 0;
  let found = done(L.boxes) ? 0 : -1;
  for (let head = 0; found < 0 && head < sB.length; head++) {
    const bs = sB[head];
    for (const b of bs) occ[b] = 1;
    reach(L, occ, sP[head], seen, ++stamp, stack);
    const here = stamp;
    for (let bi = 0; bi < bs.length && found < 0; bi++) {
      const b = bs[bi];
      for (const [dx, dy] of D) {
        const d = dy * w + dx, t = b + d;
        if (seen[b - d] !== here || wall[t] || occ[t] || !lv[t]) continue;
        occ[b] = 0; occ[t] = 1;
        const fz = frozen(L, occ, goal, t);
        let key = -1, next = null;
        if (!fz) {
          next = bs.slice(); next[bi] = t; next.sort((x, y) => x - y);
          key = keyOf(next, reach(L, occ, b, mark, ++stamp, stack));
        }
        occ[t] = 0; occ[b] = 1;
        if (fz || idx.has(key)) continue;
        if (sB.length >= CAP) { for (const x of bs) occ[x] = 0; return null; }
        idx.set(key, sB.length); sB.push(next); sP.push(b); par.push(head);
        if (done(next)) { found = sB.length - 1; break; }
      }
    }
    for (const x of bs) occ[x] = 0;
  }
  if (found < 0) return null;
  const path = [];
  for (let s = found; s > 0; s = par[s]) path.push(s);
  path.reverse();
  let moves = "", player = L.player, bs = L.boxes;
  for (const s of path) {
    const nb = sB[s];
    const from = bs.find((b) => !nb.includes(b)), to = nb.find((b) => !bs.includes(b));
    const d = to - from, dir = D.find(([dx, dy]) => dy * w + dx === d);
    for (const b of bs) occ[b] = 1;
    moves += walk(L, occ, player, from - d);
    for (const b of bs) occ[b] = 0;
    moves += dir[3];
    player = from; bs = nb;
  }
  return { pushes: path.length, moves };
}
function roomsOf(L) {
  const { w, wall, goals, boxes, player } = L, lv = live(L), row = (player / w) | 0;
  const cut = new Uint8Array(wall.length);
  for (let i = row * w; i < (row + 1) * w; i++) if (!wall[i] && !lv[i]) cut[i] = 1;
  if (boxes.some((b) => cut[b])) return null;
  const part = new Int32Array(wall.length).fill(-1), rooms = [];
  for (let s = 0; s < wall.length; s++) {
    if (wall[s] || cut[s] || part[s] >= 0) continue;
    const sq = [s];
    part[s] = rooms.length;
    for (let i = 0; i < sq.length; i++) {
      for (const [dx, dy] of D) {
        const q = sq[i] + dy * w + dx;
        if (!wall[q] && !cut[q] && part[q] < 0) { part[q] = rooms.length; sq.push(q); }
      }
    }
    rooms.push({ boxes: [], goals: [], done: false });
  }
  for (const b of boxes) rooms[part[b]].boxes.push(b);
  for (const g of goals) if (part[g] >= 0) rooms[part[g]].goals.push(g);
  if (goals.some((g) => part[g] < 0) || rooms.some((r) => r.boxes.length !== r.goals.length)) return null;
  return rooms.filter((r) => r.boxes.length);
}
function endOf(w, from, moves) {
  let p = from;
  for (const ch of moves.toLowerCase()) p += ch === "u" ? -w : ch === "d" ? w : ch === "l" ? -1 : 1;
  return p;
}
function solveAll(L) {
  const rooms = roomsOf(L);
  if (!rooms) return solve(L);
  let player = L.player, pushes = 0, moves = "";
  for (const room of rooms) {
    const wall = L.wall.slice();
    for (const o of rooms) {
      if (o === room) continue;
      for (const b of o.done ? o.goals : o.boxes) wall[b] = 1;
    }
    const sub = { w: L.w, h: L.h, wall, goals: room.goals.slice().sort((a, b) => a - b), boxes: room.boxes.slice().sort((a, b) => a - b), player };
    const s = solve(sub);
    if (!s) return null;
    pushes += s.pushes; moves += s.moves;
    player = endOf(L.w, player, s.moves);
    room.done = true;
  }
  return { pushes, moves };
}
const IN = process.env.MAKEFUN_INPUT_DIR ?? "/input", OUT = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
for (const d of rd(IN, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
  const sol = solveAll(parse(rf(join(IN, d, "level.txt"), "utf8")));
  md(join(OUT, d), { recursive: true });
  wf(join(OUT, d, "solution.txt"), sol ? sol.moves : "");
}
