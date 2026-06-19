import { characters } from './characters.js';
import { initStorage, getChatHistory, saveMessage, clearChatHistory } from './storage.js';

const API_URL = '/api/chat/message';

// Router Target App
const routerView = document.getElementById('app-router');

// Application State
let currentView = 'home';
let selectedCharacter = null;

// Notification System
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Router System Views Generator
const views = {
  home: () => `
    <div class="hero-section page-fade-in">
      <h1 class="title-glow">AnimeVerse AI</h1>
      <p style="color: var(--text-muted); margin-bottom: 2rem; max-width: 600px;">
        Masuki dimensi baru interaksi karakter anime premium berbasis DeepSeek Engine. Rasakan kepribadian yang nyata dan imersif.
      </p>
      <div style="display: flex; gap: 1rem;">
        <button class="btn-premium" id="nav-explore">Explore Characters</button>
        <button class="btn-premium" style="background: transparent; border: 1px solid var(--primary);" id="nav-profile">My Profile</button>
      </div>
      <div style="margin-top: 4rem; display: flex; gap: 3rem;" class="glass-panel" style="padding: 2rem;">
        <div><h3>15k+</h3><p style="color:var(--text-muted)">Online Users</p></div>
        <div><h3>6</h3><p style="color:var(--text-muted)">Premium AI Core</p></div>
        <div><h3>99.9%</h3><p style="color:var(--text-muted)">Uptime Accuracy</p></div>
      </div>
    </div>
  `,
  characters: () => `
    <div class="page-fade-in" style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <h2 style="margin-bottom: 2rem; border-left: 4px solid var(--secondary); padding-left: 1rem;">Choose Your Partner</h2>
      <div class="char-grid">
        ${characters.map(char => `
          <div class="glass-panel char-card" data-id="${char.id}">
            <img src="${char.image}" alt="${char.name}">
            <div class="char-info">
              <h3>${char.name}</h3>
              <p style="color: var(--secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${char.anime}</p>
              <div>${char.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="btn-premium" id="back-home" style="margin-top: 2rem;"><i class="fa-solid fa-arrow-left"></i> Home</button>
    </div>
  `,
  detail: () => `
    <div class="page-fade-in" style="padding: 4rem 2rem; max-width: 900px; margin: 0 auto;">
      <div class="glass-panel" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2.5rem; border-radius:24px;">
        <img src="${selectedCharacter.image}" style="width:100%; height:450px; object-fit:cover; border-radius:16px; box-shadow: 0 0 20px rgba(124,77,255,0.3)">
        <div style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h1 style="font-size:2.5rem; margin-bottom:0.2rem;">${selectedCharacter.name}</h1>
            <p style="color:var(--secondary); margin-bottom:1.5rem;">${selectedCharacter.anime}</p>
            
            <h4 style="color: var(--accent); margin-bottom:0.5rem;">Personality Attributes</h4>
            <p style="color:var(--text-muted); margin-bottom:1.5rem;">${selectedCharacter.personality}</p>
            
            <div style="margin-bottom:1rem;">
              <span class="tag"><i class="fa-solid fa-heart" style="color:var(--accent)"></i> Affinity Level: 1 (Stranger)</span>
              <span class="tag"><i class="fa-solid fa-face-smile" style="color:var(--secondary)"></i> Current Mood: Calm</span>
            </div>
          </div>
          
          <div style="display:flex; gap:1rem;">
            <button class="btn-premium" id="start-chat-btn" style="flex:1;">Launch Chat Room</button>
            <button class="btn-premium" id="back-to-chars" style="background:transparent; border:1px solid var(--text-muted); width:60px;"><i class="fa-solid fa-chevron-left"></i></button>
          </div>
        </div>
      </div>
    </div>
  `,
  chat: () => `
    <div class="chat-container page-fade-in">
      <div class="chat-sidebar glass-panel" style="border-radius: 0;">
        <div style="text-align:center; margin-bottom: 2rem;">
          <img src="${selectedCharacter.image}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid var(--secondary); margin-bottom:1rem;">
          <h3>${selectedCharacter.name}</h3>
          <span style="font-size:0.8rem; color:#00FF66;"><i class="fa-solid fa-circle" style="font-size:0.6rem;"></i> Connected</span>
        </div>
        <button class="btn-premium" id="clear-chat" style="background:var(--accent); font-size:0.8rem; padding: 0.5rem 1rem; margin-bottom: 1rem;"><i class="fa-solid fa-trash"></i> Wipe Memory</button>
        <button class="btn-premium" id="exit-chat" style="background:transparent; border:1px solid var(--text-muted); font-size:0.8rem; padding: 0.5rem 1rem;"><i class="fa-solid fa-right-from-bracket"></i> Exit Room</button>
      </div>
      <div style="display:flex; flex-direction:column; background: rgba(5,5,10,0.5);">
        <div class="chat-messages" id="chat-scroller">
          </div>
        <div class="chat-input-area glass-panel" style="border-radius:0;">
          <input type="text" class="chat-input" id="chat-input-field" placeholder="Ketik pesan rahasiamu di sini...">
          <button class="btn-premium" id="send-msg-btn" style="border-radius:50%; width:50px; height:50px; padding:0; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `
};

// Router Engine Logic
function navigate(viewName) {
  currentView = viewName;
  routerView.innerHTML = views[viewName]();
  bindEvents();
  if(viewName === 'chat') {
    renderChatHistory();
  }
}

// Render dynamic chat contents
function renderChatHistory() {
  const scroller = document.getElementById('chat-scroller');
  if(!scroller) return;
  
  const history = getChatHistory(selectedCharacter.id);
  scroller.innerHTML = history.map(msg => `
    <div class="msg-bubble ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}">
      ${msg.content}
    </div>
  `).join('');
  scroller.scrollTop = scroller.scrollHeight;
}

// Event Binder for SPA Elements
function bindEvents() {
  // Navigation Event Handling
  const btnExplore = document.getElementById('nav-explore');
  if(btnExplore) btnExplore.addEventListener('click', () => navigate('characters'));
  
  const btnBackHome = document.getElementById('back-home');
  if(btnBackHome) btnBackHome.addEventListener('click', () => navigate('home'));
  
  const btnBackToChars = document.getElementById('back-to-chars');
  if(btnBackToChars) btnBackToChars.addEventListener('click', () => navigate('characters'));

  const btnExitChat = document.getElementById('exit-chat');
  if(btnExitChat) btnExitChat.addEventListener('click', () => navigate('characters'));

  // Character Grid Cards
  document.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      const charId = card.getAttribute('data-id');
      selectedCharacter = characters.find(c => c.id === charId);
      navigate('detail');
    });
  });

  // Launch chat room
  const btnStartChat = document.getElementById('start-chat-btn');
  if(btnStartChat) {
    btnStartChat.addEventListener('click', () => navigate('chat'));
  }

  // Wipe chat memory
  const btnClearChat = document.getElementById('clear-chat');
  if(btnClearChat) {
    btnClearChat.addEventListener('click', () => {
      clearChatHistory(selectedCharacter.id);
      renderChatHistory();
      showToast("Memory reset successfully!");
    });
  }

  // Messaging Execution
  const btnSend = document.getElementById('send-msg-btn');
  const inputField = document.getElementById('chat-input-field');

  if(btnSend && inputField) {
    const sendMessageAction = async () => {
      const text = inputField.value.trim();
      if(!text) return;

      inputField.value = '';
      saveMessage(selectedCharacter.id, 'user', text);
      renderChatHistory();

      // Append Typing Animation
      const scroller = document.getElementById('chat-scroller');
      const typingDiv = document.createElement('div');
      typingDiv.className = 'msg-bubble msg-ai typing-indicator';
      typingDiv.innerHTML = `<span></span><span></span><span></span>`;
      scroller.appendChild(typingDiv);
      scroller.scrollTop = scroller.scrollHeight;

      try {
        const historyContext = getChatHistory(selectedCharacter.id).map(h => ({
          role: h.role,
          content: h.content
        })).slice(-10); // Mengambil 10 history context terakhir agar hemat token dan stabil

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyContext,
            systemPrompt: selectedCharacter.systemPrompt
          })
        });

        const data = await response.json();
        typingDiv.remove();

        if(data.success) {
          saveMessage(selectedCharacter.id, 'assistant', data.reply);
          renderChatHistory();
        } else {
          showToast("Error processing text via deepseek framework");
        }
      } catch (err) {
        typingDiv.remove();
        showToast("Backend Server Offline/Disconnected");
        console.error(err);
      }
    };

    btnSend.addEventListener('click', sendMessageAction);
    inputField.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') sendMessageAction();
    });
  }
}

// Initializing Application Core
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  navigate('home');
});
