"use client";

import { useEffect, useRef } from "react";

type Simulation = {
  width: number;
  height: number;
  pressure: Float32Array;
  velocity: Float32Array;
  gradientX: Float32Array;
  gradientY: Float32Array;
  image: ImageData | null;
  source: Uint8ClampedArray;
  pointerX: number;
  pointerY: number;
  pointerDown: boolean;
};

const sim: Simulation = {
  width: 0,
  height: 0,
  pressure: new Float32Array(0),
  velocity: new Float32Array(0),
  gradientX: new Float32Array(0),
  gradientY: new Float32Array(0),
  image: null,
  source: new Uint8ClampedArray(0),
  pointerX: -9999,
  pointerY: -9999,
  pointerDown: false,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function index(x: number, y: number) {
  return y * sim.width + x;
}

export function CanvasRippleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const buffer = document.createElement("canvas");
    const bufferCtx = buffer.getContext("2d", { alpha: false });
    if (!bufferCtx) return;

    let frame = 0;
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const buildSource = () => {
      const data = new Uint8ClampedArray(sim.width * sim.height * 4);
      const cx = sim.width * 0.72;
      const cy = sim.height * 0.62;

      for (let y = 0; y < sim.height; y += 1) {
        for (let x = 0; x < sim.width; x += 1) {
          const u = x / Math.max(1, sim.width - 1);
          const v = y / Math.max(1, sim.height - 1);
          const dx = (x - cx) / sim.width;
          const dy = (y - cy) / sim.height;
          const ring = Math.sin(Math.hypot(u - 0.34, v - 0.38) * 42);
          const tile = Math.min(
            Math.abs((u * 12) % 1 - 0.5),
            Math.abs((v * 8) % 1 - 0.5),
          );
          const grid = tile < 0.018 ? 85 : 0;
          const warm = Math.max(0, 1 - Math.hypot(dx, dy) * 5);
          const shade = 0.84 + 0.12 * Math.sin((u + v) * 18);
          const i = index(x, y) * 4;

          const base = clamp(
            (8 + 34 * v + grid * 0.55 + 96 * warm + 12 * ring) * shade,
            0,
            255,
          );
          data[i] = base;
          data[i + 1] = base;
          data[i + 2] = base;
          data[i + 3] = 255;
        }
      }

      sim.source = data;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.floor(rect.width * dpr));
      canvas.height = Math.max(2, Math.floor(rect.height * dpr));
      sim.width = Math.max(180, Math.floor(canvas.width / 3));
      sim.height = Math.max(120, Math.floor(canvas.height / 3));
      buffer.width = sim.width;
      buffer.height = sim.height;

      const total = sim.width * sim.height;
      sim.pressure = new Float32Array(total);
      sim.velocity = new Float32Array(total);
      sim.gradientX = new Float32Array(total);
      sim.gradientY = new Float32Array(total);
      sim.image = ctx.createImageData(sim.width, sim.height);
      buildSource();
      disturb(sim.width * 0.5, sim.height * 0.5, 18, 2.2);
    };

    const disturb = (x: number, y: number, radius: number, amount: number) => {
      const minX = clamp(Math.floor(x - radius), 1, sim.width - 2);
      const maxX = clamp(Math.ceil(x + radius), 1, sim.width - 2);
      const minY = clamp(Math.floor(y - radius), 1, sim.height - 2);
      const maxY = clamp(Math.ceil(y + radius), 1, sim.height - 2);

      for (let py = minY; py <= maxY; py += 1) {
        for (let px = minX; px <= maxX; px += 1) {
          const dist = Math.hypot(px - x, py - y);
          if (dist <= radius) {
            sim.pressure[index(px, py)] += amount * (1 - dist / radius);
          }
        }
      }
    };

    const update = () => {
      const w = sim.width;
      const h = sim.height;
      const pressure = sim.pressure;
      const velocity = sim.velocity;
      const nextPressure = new Float32Array(pressure);
      const nextVelocity = new Float32Array(velocity);

      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          const i = index(x, y);
          const p = pressure[i];
          let v = velocity[i];
          const right = pressure[i + 1];
          const left = pressure[i - 1];
          const up = pressure[i - w];
          const down = pressure[i + w];

          v += (-2 * p + right + left) * 0.25;
          v += (-2 * p + up + down) * 0.25;

          let np = p + v;
          v -= 0.005 * np;
          v *= 0.998;
          np *= 0.999;

          nextPressure[i] = np;
          nextVelocity[i] = v;
          sim.gradientX[i] = (right - left) * 0.5;
          sim.gradientY[i] = (up - down) * 0.5;
        }
      }

      sim.pressure = nextPressure;
      sim.velocity = nextVelocity;
      if (sim.pointerDown) disturb(sim.pointerX, sim.pointerY, 13, 1.15);
    };

    const render = () => {
      if (!sim.image) return;
      const out = sim.image.data;
      const source = sim.source;
      const w = sim.width;
      const h = sim.height;

      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const i = index(x, y);
          const sx = clamp(Math.round(x + sim.gradientX[i] * 24), 0, w - 1);
          const sy = clamp(Math.round(y + sim.gradientY[i] * 24), 0, h - 1);
          const si = index(sx, sy) * 4;
          const oi = i * 4;
          const normal = Math.max(
            0,
            sim.gradientX[i] * 0.28 + 0.2 * 0.94 - sim.gradientY[i] * 0.28,
          );
          const glint = Math.pow(normal, 60) * 255;

          out[oi] = clamp(source[si] + glint, 0, 255);
          out[oi + 1] = clamp(source[si + 1] + glint, 0, 255);
          out[oi + 2] = clamp(source[si + 2] + glint, 0, 255);
          out[oi + 3] = 255;
        }
      }

      bufferCtx.putImageData(sim.image, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
    };

    const setPointer = (event: PointerEvent, down: boolean) => {
      const rect = canvas.getBoundingClientRect();
      sim.pointerX = ((event.clientX - rect.left) / rect.width) * sim.width;
      sim.pointerY = ((event.clientY - rect.top) / rect.height) * sim.height;
      sim.pointerDown = down;
    };

    const pointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      setPointer(event, true);
      disturb(sim.pointerX, sim.pointerY, 16, 2.5);
    };
    const pointerMove = (event: PointerEvent) =>
      setPointer(event, event.buttons > 0);
    const pointerUp = (event: PointerEvent) => setPointer(event, false);

    const animate = () => {
      if (!reducedMotion || frame < 4) {
        update();
        render();
      }
      frame += 1;
      requestAnimationFrame(animate);
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      reducedMotion = motionQuery.matches;
    };

    resize();
    animate();

    // Auto-disturb at random positions every 2.2 s
    const autoInterval = window.setInterval(() => {
      const x = sim.width * (0.15 + Math.random() * 0.7);
      const y = sim.height * (0.15 + Math.random() * 0.7);
      disturb(x, y, 14 + Math.random() * 8, 1.4 + Math.random() * 1.2);
    }, 2200);

    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", updateMotion);
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointerleave", () => {
      sim.pointerDown = false;
    });

    return () => {
      window.clearInterval(autoInterval);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", updateMotion);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full min-h-[24rem] w-full rounded-xl border border-white/10 bg-black"
    />
  );
}
