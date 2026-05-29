// ── Rypple content script ────────────────────────────────────────────────────
// Detects the active AI platform, intercepts prompts before send,
// applies optimisations, tracks savings.

const PLATFORM = detectPlatform();
let settings = { mode: "light", apiKey: "", enabled: true };

// Energy constants from TRIM benchmark (Jegham method, mWh per output token)
const ENERGY_K = {
  "chatgpt":  1.50,   // gpt-4.1 proxy (varies by model — conservative)
  "claude":   2.10,   // claude-sonnet
  "gemini":   0.60,   // gemini-2.5-flash
};
// Grid CO₂ intensity per provider (g/kWh) — canonical: benchmark/config.py / METHODOLOGY.md §9
const CIF_BY_PLATFORM = { chatgpt: 386, claude: 230, gemini: 18 };

// Filler patterns (I-S1)
const FILLERS = /\b(please\s+|kindly\s+|could\s+you\s+|can\s+you\s+|would\s+you\s+|I\s+would\s+like\s+you\s+to\s+|I\s+want\s+you\s+to\s+|feel\s+free\s+to\s+|don't\s+hesitate\s+to\s+|as\s+you\s+know[,\s]+|it\s+is\s+important\s+to\s+note\s+that\s+|basically\s+|essentially\s+|in\s+order\s+to\s+)/gi;

// Verb swap map (I-S2)
const VERB_SWAPS = [
  [/\banalyze\b/gi, "list"], [/\banalyse\b/gi, "list"],
  [/\belaborate\b/gi, "list"], [/\bdiscuss\b/gi, "list"],
  [/\bexplore\b/gi, "list"], [/\bexamine\b/gi, "assess"],
  [/\bdescribe\b/gi, "state"], [/\bexplain\b/gi, "state"],
  [/\btell\s+me\s+about\b/gi, "state"],
  [/\bwalk\s+me\s+through\b/gi, "list"],
];

// Output directives (from TRIM benchmark — ranked by ROUGE-L improvement)
const DIRECTIVES = {
  light:  " Answer briefly.",                          // O-S2: +49% ROUGE
  full:   " Only provide the minimal answer.",         // O-S1: +99% ROUGE
  smart:  " Only provide the minimal answer.",         // O-S1 + AI input compression
};

// ── Platform detection ────────────────────────────────────────────────────────
function detectPlatform() {
  const host = location.hostname;
  if (host.includes("openai") || host.includes("chatgpt")) return "chatgpt";
  if (host.includes("claude")) return "claude";
  if (host.includes("gemini")) return "gemini";
  return "chatgpt";
}

// ── Load settings from background ────────────────────────────────────────────
function loadSettings() {
  chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (s) => {
    if (s) settings = s;
  });
}
loadSettings();
chrome.storage.onChanged.addListener(loadSettings);

// ── Optimisation pipeline ─────────────────────────────────────────────────────
function applyInputOptimisations(text) {
  let out = text;
  out = out.replace(FILLERS, "");
  for (const [pat, rep] of VERB_SWAPS) out = out.replace(pat, rep);
  out = out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return out;
}

function appendDirective(text, mode) {
  const directive = DIRECTIVES[mode] || DIRECTIVES.light;
  // Don't double-add
  if (text.includes("Answer briefly") || text.includes("minimal answer") ||
      text.includes("Do not show reasoning")) return text;
  return text.trimEnd() + directive;
}

function countTokensApprox(text) {
  // ~4 chars per token (GPT BPE approximation)
  return Math.ceil(text.length / 4);
}

function computeSavings(original, modified) {
  const tokIn_orig = countTokensApprox(original);
  const tokIn_mod  = countTokensApprox(modified);
  const inputSaved = Math.max(0, tokIn_orig - tokIn_mod);

  // Output savings ESTIMATE from TRIM benchmark (canonical, matched-pair):
  // O-S1 ("minimal answer") ~ −64% output, O-S2 ("answer briefly") ~ −56%.
  // NOTE: rough projection — uses the benchmark baseline-average output length,
  // not this prompt's actual response. Treat as an estimate, not a measurement.
  const outputReductionPct = modified.includes("minimal answer") ? 0.64 : 0.56;
  const avgOutputTokens = 265; // benchmark baseline average (I-S0), all clean rows
  const outputSaved = Math.round(avgOutputTokens * outputReductionPct);

  const totalSaved = inputSaved + outputSaved;
  const k = ENERGY_K[PLATFORM] || 1.50;
  const cif = CIF_BY_PLATFORM[PLATFORM] || 386;
  const wh_saved  = (outputSaved * k) / 1000;
  const co2_g     = (wh_saved / 1000) * cif;

  return { inputSaved, outputSaved, totalSaved, wh_saved, co2_g,
           tokIn_orig, tokIn_mod };
}

// ── Log savings to background ─────────────────────────────────────────────────
function logSavings(savings) {
  chrome.runtime.sendMessage({
    type:         "LOG_SAVE",
    tokens_saved: savings.totalSaved,
    tokens_sent:  savings.tokIn_mod,
    wh_saved:     savings.wh_saved,
    co2_g_saved:  savings.co2_g,
  });
}

// ── Show inline toast ─────────────────────────────────────────────────────────
function showToast(savings) {
  const existing = document.getElementById("rypple-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "rypple-toast";
  toast.innerHTML = `
    <svg class="rypple-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.4" opacity="0.55"/>
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.2" opacity="0.25"/>
    </svg>
    <span class="rypple-text">
      <span class="rypple-title">Rypple</span>
      <span class="rypple-stats"><b>${savings.totalSaved}</b> tokens · ${(savings.wh_saved * 1000).toFixed(2)} mWh · ${savings.co2_g.toFixed(3)} g CO₂</span>
    </span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Set text in contenteditable or textarea ───────────────────────────────────
function setInputText(el, text) {
  if (el.tagName === "TEXTAREA") {
    // React-compatible textarea setter
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    if (setter) setter.call(el, text);
    else el.value = text;
  } else {
    // ContentEditable (Claude, Gemini, newer ChatGPT)
    el.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, text);
    return; // execCommand fires input event automatically
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

// ── Find the active prompt input ──────────────────────────────────────────────
function findInput() {
  // ChatGPT
  const gptTextarea = document.getElementById("prompt-textarea");
  if (gptTextarea) return gptTextarea;

  // Claude — ProseMirror div
  const prose = document.querySelector('div.ProseMirror[contenteditable="true"]');
  if (prose) return prose;

  // Gemini
  const gemini = document.querySelector('div[contenteditable="true"][aria-label]');
  if (gemini) return gemini;

  // Fallback: any visible contenteditable
  const editable = document.querySelector('div[contenteditable="true"]');
  if (editable) return editable;

  return null;
}

function getInputText(el) {
  if (el.tagName === "TEXTAREA") return el.value;
  return el.innerText || el.textContent || "";
}

// ── Main interception ─────────────────────────────────────────────────────────
async function optimiseAndSend(e) {
  if (!settings.enabled) return;

  const input = findInput();
  if (!input) return;

  const original = getInputText(input).trim();
  if (!original || original.length < 10) return;

  // Don't intercept if already processed
  if (input.dataset.ryppleProcessed === original) return;
  input.dataset.ryppleProcessed = original;

  let modified = original;

  if (settings.mode === "smart" && settings.apiKey && original.length > 200) {
    // Smart mode: AI compression via GPT-4.1-nano (only for long prompts)
    try {
      const resp = await new Promise((resolve) =>
        chrome.runtime.sendMessage({
          type: "SMART_COMPRESS",
          prompt: original,
          apiKey: settings.apiKey,
        }, resolve)
      );
      if (resp?.compressed && !resp.error) {
        modified = resp.compressed;
      }
    } catch (_) {
      // Fall through to regex on API failure
      modified = applyInputOptimisations(original);
    }
  } else {
    // Light / Full mode: regex only (instant, free)
    modified = applyInputOptimisations(original);
  }

  // Always append the output directive
  modified = appendDirective(modified, settings.mode === "full" || settings.mode === "smart" ? "full" : "light");

  if (modified === original) return;

  const savings = computeSavings(original, modified);
  setInputText(input, modified);
  logSavings(savings);
  showToast(savings);
}

// ── Intercept send (button click + Enter key) ─────────────────────────────────
document.addEventListener("click", async (e) => {
  const btn = e.target.closest('button[data-testid="send-button"], button[aria-label*="Send"], button[aria-label*="send"]');
  if (!btn) return;
  await optimiseAndSend(e);
}, true);

document.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter" || e.shiftKey) return;
  const input = findInput();
  if (!input || !input.contains(e.target) && e.target !== input) return;
  await optimiseAndSend(e);
}, true);
