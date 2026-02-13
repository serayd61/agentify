/**
 * Agentify.ch - Chat Widget Embed Script
 * 
 * Usage:
 * <script src="https://cdn.agentify.ch/widget.js" data-agent-id="YOUR_AGENT_ID"></script>
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_BASE_URL = 'https://agentify.ch';
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://agentify-lime.vercel.app';

  // Get script element and config
  const script = document.currentScript;
  const agentId = script?.getAttribute('data-agent-id');
  const position = script?.getAttribute('data-position') || 'bottom-right';
  const primaryColor = script?.getAttribute('data-color') || '#DC2626';

  if (!agentId) {
    console.error('[Agentify] Missing data-agent-id attribute');
    return;
  }

  // Styles
  const styles = `
    .agentify-widget-container {
      position: fixed;
      ${position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
      bottom: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .agentify-toggle-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .agentify-toggle-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    }

    .agentify-toggle-btn svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .agentify-chat-window {
      position: absolute;
      bottom: 76px;
      ${position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
      width: 380px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      display: none;
      flex-direction: column;
      animation: agentify-slide-up 0.3s ease-out;
    }

    .agentify-chat-window.open {
      display: flex;
    }

    @keyframes agentify-slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .agentify-header {
      background: ${primaryColor};
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .agentify-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .agentify-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .agentify-header-text h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .agentify-header-text p {
      margin: 0;
      font-size: 12px;
      opacity: 0.7;
    }

    .agentify-close-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .agentify-close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .agentify-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f9fafb;
      min-height: 300px;
      max-height: 400px;
    }

    .agentify-message {
      margin-bottom: 12px;
      display: flex;
    }

    .agentify-message.user {
      justify-content: flex-end;
    }

    .agentify-message-content {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
    }

    .agentify-message.assistant .agentify-message-content {
      background: white;
      border: 1px solid #e5e7eb;
      border-top-left-radius: 4px;
    }

    .agentify-message.user .agentify-message-content {
      background: ${primaryColor};
      color: white;
      border-top-right-radius: 4px;
    }

    .agentify-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      border-top-left-radius: 4px;
      width: fit-content;
    }

    .agentify-typing span {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: agentify-bounce 1s infinite;
    }

    .agentify-typing span:nth-child(2) {
      animation-delay: 0.15s;
    }

    .agentify-typing span:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes agentify-bounce {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-4px);
      }
    }

    .agentify-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }

    .agentify-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .agentify-input:focus {
      border-color: ${primaryColor};
    }

    .agentify-send-btn {
      padding: 10px 16px;
      background: ${primaryColor};
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .agentify-send-btn:hover {
      opacity: 0.9;
    }

    .agentify-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .agentify-powered {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: #9ca3af;
    }

    .agentify-powered a {
      color: #6b7280;
      text-decoration: none;
    }

    @media (max-width: 480px) {
      .agentify-chat-window {
        position: fixed;
        inset: 0;
        width: 100%;
        max-height: 100%;
        border-radius: 0;
        bottom: 0;
      }

      .agentify-toggle-btn {
        display: none;
      }

      .agentify-chat-window.open + .agentify-toggle-btn {
        display: none;
      }
    }
  `;

  // Icons
  const chatIcon = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
  const closeIcon = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  const sendIcon = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // Widget state
  let isOpen = false;
  let messages = [];
  let agentConfig = null;
  let isTyping = false;
  let conversationId = null;

  // Create widget
  function createWidget() {
    // Add styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Create container
    const container = document.createElement('div');
    container.className = 'agentify-widget-container';
    container.innerHTML = `
      <div class="agentify-chat-window">
        <div class="agentify-header">
          <div class="agentify-header-info">
            <div class="agentify-avatar">🤖</div>
            <div class="agentify-header-text">
              <h3>Assistent</h3>
              <p>Online</p>
            </div>
          </div>
          <button class="agentify-close-btn">${closeIcon}</button>
        </div>
        <div class="agentify-messages"></div>
        <div class="agentify-input-area">
          <input type="text" class="agentify-input" placeholder="Nachricht eingeben...">
          <button class="agentify-send-btn">${sendIcon}</button>
        </div>
        <div class="agentify-powered">
          Powered by <a href="https://agentify.ch" target="_blank">Agentify.ch</a>
        </div>
      </div>
      <button class="agentify-toggle-btn">${chatIcon}</button>
    `;

    document.body.appendChild(container);

    // Get elements
    const chatWindow = container.querySelector('.agentify-chat-window');
    const toggleBtn = container.querySelector('.agentify-toggle-btn');
    const closeBtn = container.querySelector('.agentify-close-btn');
    const messagesEl = container.querySelector('.agentify-messages');
    const inputEl = container.querySelector('.agentify-input');
    const sendBtn = container.querySelector('.agentify-send-btn');
    const avatarEl = container.querySelector('.agentify-avatar');
    const nameEl = container.querySelector('.agentify-header-text h3');

    // Event handlers
    toggleBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      chatWindow.classList.toggle('open', isOpen);
      toggleBtn.innerHTML = isOpen ? closeIcon : chatIcon;
      if (isOpen && messages.length === 0) {
        loadAgent();
      }
    });

    closeBtn.addEventListener('click', () => {
      isOpen = false;
      chatWindow.classList.remove('open');
      toggleBtn.innerHTML = chatIcon;
    });

    sendBtn.addEventListener('click', () => sendMessage());
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Load agent config
    async function loadAgent() {
      try {
        // In production, this would fetch from the API
        agentConfig = {
          name: 'Assistent',
          icon: '🤖',
          greeting: 'Grüezi! Wie kann ich Ihnen helfen?'
        };

        avatarEl.textContent = agentConfig.icon;
        nameEl.textContent = agentConfig.name;

        addMessage('assistant', agentConfig.greeting);
      } catch (error) {
        console.error('[Agentify] Failed to load agent:', error);
      }
    }

    // Add message to UI
    function addMessage(role, content) {
      messages.push({ role, content, timestamp: new Date() });
      const msgEl = document.createElement('div');
      msgEl.className = `agentify-message ${role}`;
      msgEl.innerHTML = `<div class="agentify-message-content">${content}</div>`;
      messagesEl.appendChild(msgEl);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Show typing indicator
    function showTyping() {
      isTyping = true;
      const typingEl = document.createElement('div');
      typingEl.className = 'agentify-typing';
      typingEl.id = 'agentify-typing';
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(typingEl);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Hide typing indicator
    function hideTyping() {
      isTyping = false;
      const typingEl = document.getElementById('agentify-typing');
      if (typingEl) typingEl.remove();
    }

    // Send message to API
    async function sendMessage() {
      const text = inputEl.value.trim();
      if (!text || isTyping) return;

      inputEl.value = '';
      addMessage('user', text);
      showTyping();

      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: agentId,
            message: text,
            conversationId: conversationId,
            metadata: {
              language: 'de',
              source: 'widget',
            },
          }),
        });

        const data = await response.json();
        hideTyping();

        if (data.success) {
          // Update conversation ID for subsequent messages
          conversationId = data.conversationId;
          addMessage('assistant', data.response);
          
          // Handle suggested actions if present
          if (data.suggestedActions && data.suggestedActions.length > 0) {
            showSuggestedActions(data.suggestedActions);
          }
        } else {
          addMessage('assistant', 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.');
        }
      } catch (_error) {
        hideTyping();
        addMessage('assistant', 'Entschuldigung, der Service ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut.');
      }
    }

    // Show suggested action buttons
    function showSuggestedActions(actions) {
      const actionsEl = document.createElement('div');
      actionsEl.className = 'agentify-suggested-actions';
      actionsEl.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; padding: 0 16px 16px;';
      
      const actionLabels = {
        'termin_buchen': 'Termin buchen',
        'mehr_info': 'Mehr Infos',
        'mwst': 'MWST-Fragen',
        'buchhaltung': 'Buchhaltung',
        'steuern': 'Steuern',
        'termin': 'Termin',
        'erstberatung': 'Erstberatung',
        'steuerberatung': 'Steuerberatung',
        'mwst_beratung': 'MWST-Beratung',
        'kontakt': 'Kontakt',
        'preise': 'Preise',
      };

      actions.forEach(action => {
        const btn = document.createElement('button');
        btn.textContent = actionLabels[action] || action;
        btn.style.cssText = `
          padding: 6px 12px;
          border: 1px solid ${primaryColor};
          background: white;
          color: ${primaryColor};
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        `;
        btn.addEventListener('mouseover', () => {
          btn.style.background = primaryColor;
          btn.style.color = 'white';
        });
        btn.addEventListener('mouseout', () => {
          btn.style.background = 'white';
          btn.style.color = primaryColor;
        });
        btn.addEventListener('click', () => {
          inputEl.value = actionLabels[action] || action;
          sendMessage();
          actionsEl.remove();
        });
        actionsEl.appendChild(btn);
      });

      messagesEl.appendChild(actionsEl);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();


