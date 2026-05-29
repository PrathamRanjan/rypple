// Session stats accumulate in memory; persist to storage on change
let session = { tokens_saved: 0, tokens_sent: 0, wh_saved: 0, co2_g_saved: 0, calls: 0 };

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_SETTINGS") {
    chrome.storage.local.get(["mode", "apiKey", "enabled"], (data) => {
      sendResponse({
        mode:    data.mode    ?? "light",
        apiKey:  data.apiKey  ?? "",
        enabled: data.enabled ?? true,
      });
    });
    return true;
  }

  if (msg.type === "SAVE_SETTINGS") {
    chrome.storage.local.set(msg.data, () => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === "LOG_SAVE") {
    session.tokens_saved  += msg.tokens_saved  || 0;
    session.tokens_sent   += msg.tokens_sent   || 0;
    session.wh_saved      += msg.wh_saved      || 0;
    session.co2_g_saved   += msg.co2_g_saved   || 0;
    session.calls         += 1;
    chrome.action.setBadgeText({ text: session.tokens_saved > 0 ? `${session.tokens_saved}` : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
    if (chrome.action.setBadgeTextColor) chrome.action.setBadgeTextColor({ color: "#000000" });
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "GET_SESSION") {
    sendResponse(session);
    return true;
  }

  if (msg.type === "SMART_COMPRESS") {
    // Call GPT-4.1-nano to compress long prompts (only in "smart" mode)
    smartCompress(msg.prompt, msg.apiKey)
      .then(compressed => sendResponse({ compressed }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

async function smartCompress(prompt, apiKey) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [{
        role: "user",
        content: `Compress this prompt to its bare essential meaning. Remove all filler, pleasantries, and redundancy. Keep every specific requirement and piece of context. Output only the compressed prompt with no explanation:\n\n${prompt}`,
      }],
      max_tokens: 300,
      temperature: 0,
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
  const data = await resp.json();
  return data.choices[0].message.content.trim();
}
