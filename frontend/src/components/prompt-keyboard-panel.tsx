"use client";

import { useEffect, useRef, useState } from "react";

import KeyboardWithPreviewDemo from "@/components/keyboard-with-preview-demo";

const MAX_LENGTH = 96;
const PLACEHOLDER = "Type a prompt...";

function nextValue(current: string, key: string) {
  if (key === "Backspace" || key === "delete") return current.slice(0, -1);
  if (key === "Escape" || key === "esc") return "";
  if (key === "Enter" || key === "return") {
    return current.trim() ? `${current.trim()} -> optimize` : current;
  }
  if (key === " " || key === "space") return `${current} `;
  if (key.length === 1 && current.length < MAX_LENGTH) {
    return `${current}${key}`;
  }
  return current;
}

function keyFromVirtualButton(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return null;
  const button = target.closest("button");
  if (!button) return null;

  const raw = button.textContent?.trim() ?? "";
  if (!raw) return "space";
  const normalized = raw.toLowerCase();
  if (normalized.includes("delete")) return "delete";
  if (normalized.includes("return")) return "return";
  if (normalized.includes("space")) return "space";
  if (normalized.includes("esc")) return "esc";
  if (raw.length === 1) return raw;
  return null;
}

export function PromptKeyboardPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        event.key.length === 1 ||
        ["Backspace", "Escape", "Enter", " "].includes(event.key)
      ) {
        setText((current) => nextValue(current, event.key));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={0}
      onPointerDown={() => ref.current?.focus()}
      onMouseDownCapture={(event) => {
        const key = keyFromVirtualButton(event.target);
        if (key) setText((current) => nextValue(current, key));
      }}
      className="relative h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.10),transparent_36%),#020202] sm:h-[540px] lg:h-[600px]"
    >
      <div className="absolute left-5 right-5 top-5 z-10 rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur sm:left-8 sm:right-8 sm:top-8">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/34">
          Live prompt
        </p>
        <p className="min-h-7 text-lg leading-7 text-white sm:text-xl">
          {text || <span className="text-white/34">{PLACEHOLDER}</span>}
          <span className="ml-1 inline-block h-5 w-px translate-y-1 bg-white/70" />
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.44))]" />
      <div className="absolute left-1/2 top-[58%] w-[960px] -translate-x-1/2 -translate-y-1/2 scale-[0.44] sm:scale-[0.62] lg:scale-[0.72]">
        <KeyboardWithPreviewDemo />
      </div>
    </div>
  );
}
