const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Event Listener untuk tombol Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // 1. Tampilkan pesan user
  appendMessage("user", message);
  userInput.value = "";
  userInput.disabled = true;
  sendBtn.disabled = true;

  // 2. Tampilkan indikator loading
  const loadingId = appendLoading();

  try {
    // 3. Kirim ke backend
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // 4. Hapus loading
    removeLoading(loadingId);

    if (data.error) {
      appendMessage("bot", "⚠️ Error: " + data.error);
    } else {
      // Parse markdown menggunakan marked.js
      const parsedReply = marked.parse(data.reply);
      appendMessage("bot", parsedReply, true);
    }
  } catch (error) {
    removeLoading(loadingId);
    appendMessage("bot", "❌ Gagal terhubung ke server.");
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// Fungsi Menambah Pesan ke Chat Box
function appendMessage(role, text, isHtml = false) {
  const div = document.createElement("div");
  div.classList.add("message", role);

  const icon = role === "user" ? "fa-user" : "fa-robot";

  const contentHtml = isHtml ? text : `<p>${text}</p>`;

  div.innerHTML = `
        <div class="avatar"><i class="fa-solid ${icon}"></i></div>
        <div class="content">${contentHtml}</div>
    `;

  chatBox.appendChild(div);
  scrollToBottom();
}

// Fungsi Indikator Loading (Titik-titik berkedip)
function appendLoading() {
  const id = "loading-" + Date.now();
  const div = document.createElement("div");
  div.classList.add("message", "bot");
  div.id = id;
  div.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="content">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Mengetik...
        </div>
    `;
  chatBox.appendChild(div);
  scrollToBottom();
  return id;
}

function removeLoading(id) {
  const element = document.getElementById(id);
  if (element) element.remove();
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}
