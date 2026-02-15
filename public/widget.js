/**
 * Agentify.ch Chat Widget
 * Usage: <script src="https://agentify.ch/widget.js" data-agent="YOUR_API_KEY"></script>
 */
(function() {
  const script = document.currentScript;
  const apiKey = script?.getAttribute('data-agent');
  if (!apiKey) return console.error('Agentify: data-agent attribute required');

  const API_URL = script?.getAttribute('data-api') || 'https://agentify.ch/api/chat';
  const POSITION = script?.getAttribute('data-position') || 'bottom-right';
  const COLOR = script?.getAttribute('data-color') || '#dc2626';

  let isOpen = false;
  let conversationId = null;
  let messages = [];

  // Create widget container
  const container = document.createElement('div');
  container.id = 'agentify-widget';
  container.innerHTML = `
    <style>
      #agentify-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      #agentify-bubble { position: fixed; ${POSITION === 'bottom-left' ? 'left: 20px' : 'right: 20px'}; bottom: 20px; width: 56px; height: 56px; border-radius: 50%; background: ${COLOR}; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 99999; transition: transform 0.2s; }
      #agentify-bubble:hover { transform: scale(1.05); }
      #agentify-bubble svg { width: 24px; height: 24px; fill: white; }
      #agentify-chat { position: fixed; ${POSITION === 'bottom-left' ? 'left: 20px' : 'right: 20px'}; bottom: 88px; width: 370px; max-width: calc(100vw - 40px); height: 520px; max-height: calc(100vh - 120px); background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); z-index: 99999; display: none; flex-direction: column; overflow: hidden; border: 1px solid #e5e7eb; }
      #agentify-chat.open { display: flex; }
      .agentify-header { padding: 16px; background: ${COLOR}; color: white; display: flex; align-items: center; gap: 10px; }
      .agentify-header-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
      .agentify-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
      .agentify-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; }
      .agentify-msg-bot { background: #f3f4f6; color: #374151; align-self: flex-start; border-bottom-left-radius: 4px; }
      .agentify-msg-user { background: ${COLOR}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
      .agentify-input { padding: 12px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; }
      .agentify-input input { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; }
      .agentify-input input:focus { border-color: ${COLOR}; }
      .agentify-input button { background: ${COLOR}; color: white; border: none; border-radius: 10px; padding: 10px 14px; cursor: pointer; font-size: 14px; }
      .agentify-typing { display: flex; gap: 4px; padding: 10px 14px; }
      .agentify-typing span { width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: agentify-bounce 1.4s infinite both; }
      .agentify-typing span:nth-child(2) { animation-delay: 0.16s; }
      .agentify-typing span:nth-child(3) { animation-delay: 0.32s; }
      @keyframes agentify-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    </style>
    <div id="agentify-bubble">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
    </div>
    <div id="agentify-chat">
      <div class="agentify-header">
        <div class="agentify-header-dot"></div>
        <div>
          <div style="font-weight:600;font-size:14px">KI-Assistent</div>
          <div style="font-size:12px;opacity:0.8">Online</div>
        </div>
      </div>
      <div class="agentify-messages" id="agentify-messages"></div>
      <div class="agentify-input">
        <input type="text" id="agentify-input" placeholder="Nachricht eingeben..." />
        <button id="agentify-send">Senden</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Elements
  const bubble = document.getElementById('agentify-bubble');
  const chat = document.getElementById('agentify-chat');
  const msgContainer = document.getElementById('agentify-messages');
  const input = document.getElementById('agentify-input');
  const sendBtn = document.getElementById('agentify-send');

  // Toggle
  bubble.onclick = () => {
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0) {
      addMessage('bot', 'Grüezi! Wie kann ich Ihnen helfen?');
    }
  };

  // Send
  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage('user', text);
    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: apiKey, message: text, conversationId }),
      });
      const data = await res.json();
      hideTyping();
      if (data.success) {
        conversationId = data.conversationId;
        addMessage('bot', data.response);
      } else {
        addMessage('bot', 'Entschuldigung, ein Fehler ist aufgetreten.');
      }
    } catch {
      hideTyping();
      addMessage('bot', 'Verbindungsfehler. Bitte versuchen Sie es erneut.');
    }
  }

  sendBtn.onclick = send;
  input.onkeydown = (e) => { if (e.key === 'Enter') send(); };

  function addMessage(role, text) {
    messages.push({ role, text });
    const div = document.createElement('div');
    div.className = `agentify-msg agentify-msg-${role === 'user' ? 'user' : 'bot'}`;
    div.textContent = text;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.id = 'agentify-typing';
    div.className = 'agentify-msg agentify-msg-bot agentify-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('agentify-typing')?.remove();
  }
})();
