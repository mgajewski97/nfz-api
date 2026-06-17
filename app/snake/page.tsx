"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const COLS = 20;
const ROWS = 20;
const CELL = 24;
const CANVAS_W = COLS * CELL;
const CANVAS_H = ROWS * CELL;
const TICK_MS = 120;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

function rand(max: number) {
  return Math.floor(Math.random() * max);
}

function spawnFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = { x: rand(COLS), y: rand(ROWS) };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const DIR_DELTA: Record<Dir, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [...INITIAL_SNAKE],
    dir: "RIGHT" as Dir,
    nextDir: "RIGHT" as Dir,
    food: spawnFood(INITIAL_SNAKE),
    score: 0,
    best: 0,
    running: false,
    dead: false,
  });
  const [display, setDisplay] = useState({ score: 0, best: 0, dead: false, started: false });
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(CANVAS_W, y * CELL);
      ctx.stroke();
    }

    // food
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    const r = CELL / 2 - 3;
    const grad = ctx.createRadialGradient(fx - 2, fy - 2, 1, fx, fy, r);
    grad.addColorStop(0, "#fde68a");
    grad.addColorStop(1, "#ef4444");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(fx, fy, r, 0, Math.PI * 2);
    ctx.fill();

    // snake
    snake.forEach((seg, i) => {
      const t = i / snake.length;
      const g = ctx.createLinearGradient(
        seg.x * CELL,
        seg.y * CELL,
        seg.x * CELL + CELL,
        seg.y * CELL + CELL
      );
      g.addColorStop(0, i === 0 ? "#34d399" : `hsl(${150 - t * 30}, 80%, ${50 - t * 15}%)`);
      g.addColorStop(1, i === 0 ? "#10b981" : `hsl(${150 - t * 30}, 70%, ${40 - t * 10}%)`);
      ctx.fillStyle = g;
      const pad = i === 0 ? 1 : 2;
      const radius = i === 0 ? 6 : 4;
      const rx = seg.x * CELL + pad;
      const ry = seg.y * CELL + pad;
      const rw = CELL - pad * 2;
      const rh = CELL - pad * 2;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, radius);
      ctx.fill();

      // eyes on head
      if (i === 0) {
        ctx.fillStyle = "#0f172a";
        const { dir } = stateRef.current;
        const ex1 = dir === "LEFT" || dir === "RIGHT"
          ? seg.x * CELL + (dir === "RIGHT" ? CELL - 7 : 5)
          : seg.x * CELL + 6;
        const ey1 = dir === "UP" || dir === "DOWN"
          ? seg.y * CELL + (dir === "DOWN" ? CELL - 7 : 5)
          : seg.y * CELL + 6;
        const ex2 = dir === "LEFT" || dir === "RIGHT" ? ex1 : seg.x * CELL + CELL - 8;
        const ey2 = dir === "UP" || dir === "DOWN" ? ey1 : seg.y * CELL + CELL - 8;
        ctx.beginPath();
        ctx.arc(ex1, ey1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2, ey2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  const tick = useCallback((ts: number) => {
    const s = stateRef.current;
    if (!s.running) return;

    if (ts - lastTickRef.current >= TICK_MS) {
      lastTickRef.current = ts;
      s.dir = s.nextDir;
      const delta = DIR_DELTA[s.dir];
      const head = { x: s.snake[0].x + delta.x, y: s.snake[0].y + delta.y };

      // wall collision
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        s.running = false;
        s.dead = true;
        if (s.score > s.best) s.best = s.score;
        setDisplay({ score: s.score, best: s.best, dead: true, started: true });
        draw();
        return;
      }

      // self collision
      if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        s.running = false;
        s.dead = true;
        if (s.score > s.best) s.best = s.score;
        setDisplay({ score: s.score, best: s.best, dead: true, started: true });
        draw();
        return;
      }

      s.snake.unshift(head);

      if (head.x === s.food.x && head.y === s.food.y) {
        s.score += 10;
        s.food = spawnFood(s.snake);
        setDisplay((d) => ({ ...d, score: s.score }));
      } else {
        s.snake.pop();
      }
    }

    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [draw]);

  const start = useCallback(() => {
    const s = stateRef.current;
    const initSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    s.snake = initSnake;
    s.dir = "RIGHT";
    s.nextDir = "RIGHT";
    s.food = spawnFood(initSnake);
    s.score = 0;
    s.running = true;
    s.dead = false;
    lastTickRef.current = 0;
    setDisplay((d) => ({ score: 0, best: d.best, dead: false, started: true }));
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const map: Record<string, Dir> = {
        ArrowUp: "UP", w: "UP", W: "UP",
        ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
        ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
        ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT",
      };
      const newDir = map[e.key];
      if (newDir) {
        e.preventDefault();
        if (!s.running && !s.dead) { start(); return; }
        if (s.dead) { start(); return; }
        if (newDir !== OPPOSITE[s.dir]) s.nextDir = newDir;
      }
      if ((e.key === " " || e.key === "Enter") && !s.running) {
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-emerald-400 tracking-tight mb-1">Snake</h1>
        <p className="text-slate-500 text-sm">Strzałki / WASD · Spacja aby zacząć</p>
      </div>

      <div className="flex gap-8 text-center">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Wynik</p>
          <p className="text-3xl font-mono font-bold text-white">{display.score}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Rekord</p>
          <p className="text-3xl font-mono font-bold text-emerald-400">{display.best}</p>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-emerald-900/30 border border-slate-800">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />

        {!display.started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white mb-2">Gotowy?</p>
            <p className="text-slate-400 text-sm mb-6">Naciśnij spację lub dowolny kierunek</p>
            <button
              onClick={start}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
            >
              Graj
            </button>
          </div>
        )}

        {display.dead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <p className="text-3xl font-bold text-red-400 mb-1">Koniec gry</p>
            <p className="text-slate-300 text-lg mb-1">Wynik: <span className="font-bold text-white">{display.score}</span></p>
            {display.score === display.best && display.score > 0 && (
              <p className="text-emerald-400 text-sm mb-4">Nowy rekord!</p>
            )}
            <button
              onClick={start}
              className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
            >
              Zagraj ponownie
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {(["UP", "DOWN", "LEFT", "RIGHT"] as Dir[]).map((dir) => {
          const labels: Record<Dir, string> = { UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→" };
          return (
            <button
              key={dir}
              onPointerDown={(e) => {
                e.preventDefault();
                const s = stateRef.current;
                if (!s.running && !s.dead) { start(); }
                else if (s.dead) { start(); }
                else if (dir !== OPPOSITE[s.dir]) s.nextDir = dir;
              }}
              className="w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white text-xl rounded-lg flex items-center justify-center select-none transition-colors"
            >
              {labels[dir]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
