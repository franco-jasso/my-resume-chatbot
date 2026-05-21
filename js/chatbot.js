(function () {
  const overlay = document.getElementById("chatOverlay");
  const fab = document.getElementById("chatFab");
  const closeBtn = document.getElementById("chatClose");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");
  const sendBtn = document.getElementById("chatSend");
  const hint = document.getElementById("chatHint");

  const history = [];

  function openChat() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    input.focus();
  }

  function closeChat() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-chat]").forEach((el) => {
    el.addEventListener("click", openChat);
  });
  fab.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeChat();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeChat();
  });

  function appendMessage(text, role) {
    const div = document.createElement("div");
    div.className = `chat-msg chat-msg--${role}`;
    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function setLoading(on) {
    sendBtn.disabled = on;
    input.disabled = on;
    sendBtn.textContent = on ? "…" : "Send";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    history.push({ role: "user", content: text });
    input.value = "";
    setLoading(true);
    hint.textContent = "";

    const typing = appendMessage("Typing…", "typing");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-10) }),
      });

      const data = await res.json().catch(() => ({}));
      typing.remove();

      if (!res.ok) {
        const err =
          data.error ||
          "Could not reach the assistant. Make sure the server is running and the API key is configured.";
        appendMessage(err, "error");
        hint.textContent = res.status === 503 ? "Set GENAI_API_KEY in the .env file" : "";
        return;
      }

      const reply = data.reply || "No response.";
      appendMessage(reply, "bot");
      history.push({ role: "assistant", content: reply });
    } catch {
      typing.remove();
      appendMessage(
        "Network error. Start the server with: npm start",
        "error"
      );
    } finally {
      setLoading(false);
      input.focus();
    }
  });
})();
