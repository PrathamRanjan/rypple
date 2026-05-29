const $ = (id) => document.getElementById(id);

function reflectEnabled(on) {
  $("status-dot").style.opacity = on ? "1" : "0.2";
}

// Load session stats
chrome.runtime.sendMessage({ type: "GET_SESSION" }, (session) => {
  if (!session) return;
  $("tokens-saved").textContent = session.tokens_saved.toLocaleString();
  $("wh-saved").textContent = (session.wh_saved * 1000).toFixed(2);
  $("co2-saved").textContent = session.co2_g_saved.toFixed(3);
  $("calls").textContent = session.calls;
});

// Load saved settings
chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (settings) => {
  if (!settings) return;

  $("enabled").checked = settings.enabled;
  reflectEnabled(settings.enabled);
  $("api-key").value = settings.apiKey || "";

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === settings.mode);
  });

  if (settings.mode === "smart") {
    $("api-key-section").classList.remove("hidden");
  }
});

// Toggle enabled
$("enabled").addEventListener("change", (e) => {
  reflectEnabled(e.target.checked);
  save({ enabled: e.target.checked });
});

// Mode buttons
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const mode = btn.dataset.mode;
    $("api-key-section").classList.toggle("hidden", mode !== "smart");
    save({ mode });
  });
});

// API key input — save on blur
$("api-key").addEventListener("blur", (e) => {
  save({ apiKey: e.target.value.trim() });
});

function save(data) {
  chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", data });
}
