// OpenClaw Web Chat - 主应用逻辑

// 状态
let ws = null;
let messages = [];
let isConnected = false;
let isLoading = false;

// DOM 元素
let messagesEl, emptyStateEl, loadingEl, messageInput, sendBtn, statusText, settingsModal;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 获取 DOM 元素
  messagesEl = document.getElementById('messages');
  emptyStateEl = document.getElementById('empty-state');
  loadingEl = document.getElementById('loading');
  messageInput = document.getElementById('message-input');
  sendBtn = document.getElementById('send-btn');
  statusText = document.getElementById('status-text');
  settingsModal = document.getElementById('settings-modal');
  
  loadMessages();
  connect();
  updateSettingsUI();
  
  // 检查深色模式
  if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark');
  }
  
  updateSendButton();
});

// 连接 WebSocket
function connect() {
  updateStatus('连接中...', false);
  
  try {
    const url = `${window.CONFIG.gatewayUrl}?api_key=${window.CONFIG.apiKey}&session=${window.CONFIG.defaultSession}`;
    ws = new WebSocket(url);
    
    ws.onopen = () => {
      isConnected = true;
      updateStatus('已连接', true);
      console.log('✅ WebSocket 已连接');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (e) {
        console.error('解析消息失败:', e);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      isConnected = false;
      updateStatus('连接错误', false);
    };
    
    ws.onclose = () => {
      isConnected = false;
      updateStatus('已断开', false);
      console.log('🔌 WebSocket 已断开，5 秒后重连...');
      setTimeout(connect, 5000);
    };
  } catch (e) {
    console.error('连接失败:', e);
    updateStatus('连接失败', false);
    setTimeout(connect, 5000);
  }
}

// 处理接收到的消息
function handleIncomingMessage(data) {
  isLoading = false;
  hideLoading();
  
  const message = {
    id: data.id || Date.now().toString(),
    role: data.role || 'assistant',
    content: data.content || '',
    timestamp: data.timestamp || new Date().toISOString(),
  };
  
  messages.push(message);
  saveMessages();
  renderMessage(message);
  scrollToBottom();
}

// 发送消息
function sendMessage(event) {
  if (event) event.preventDefault();
  
  const content = messageInput.value.trim();
  if (!content || !isConnected || isLoading) return;
  
  // 添加用户消息
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: content,
    timestamp: new Date().toISOString(),
  };
  
  messages.push(userMessage);
  saveMessages();
  renderMessage(userMessage);
  
  // 清空输入框
  messageInput.value = '';
  messageInput.style.height = 'auto';
  updateSendButton();
  scrollToBottom();
  
  // 显示加载状态
  isLoading = true;
  showLoading();
  
  // 发送到 WebSocket
  try {
    ws.send(JSON.stringify({
      type: 'message',
      content: content,
      timestamp: new Date().toISOString(),
      session: window.CONFIG.defaultSession,
    }));
  } catch (e) {
    console.error('发送失败:', e);
    isLoading = false;
    hideLoading();
    
    // 添加错误消息
    const errorMessage = {
      id: 'error_' + Date.now(),
      role: 'system',
      content: '发送失败：' + e.message,
      timestamp: new Date().toISOString(),
    };
    messages.push(errorMessage);
    renderMessage(errorMessage);
  }
}

// 渲染消息
function renderMessage(message) {
  if (emptyStateEl) emptyStateEl.classList.add('hidden');
  if (messagesEl) messagesEl.classList.remove('hidden');
  
  const div = document.createElement('div');
  div.className = `message ${message.role}`;
  
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const time = new Date(message.timestamp);
  const timeStr = time.getHours().toString().padStart(2, '0') + ':' + 
                  time.getMinutes().toString().padStart(2, '0');
  
  const avatar = isUser ? '👤' : (isSystem ? '⚠️' : '🤖');
  
  div.innerHTML = `
    <div class="avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-body">${parseMessageContent(message.content)}</div>
      <div class="message-time">${timeStr}</div>
    </div>
  `;
  
  if (messagesEl) messagesEl.appendChild(div);
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 解析消息内容（支持 <qqimg> 图片标签）
function parseMessageContent(content) {
  if (!content) return '';

  // 先用 <qqimg> 标签分割内容
  const parts = content.split(/(<qqimg>.*?<\/qqimg>)/g);

  return parts.map(part => {
    // 如果是 <qqimg> 标签，转换为图片
    if (part.startsWith('<qqimg>') && part.endsWith('</qqimg>')) {
      const url = part.replace('<qqimg>', '').replace('</qqimg>', '').trim();

      // 如果是本地绝对路径（/home/admin/...），转换为相对路径
      if (url.startsWith('/home/admin/.openclaw/workspace/uploads/')) {
        const filename = url.replace('/home/admin/.openclaw/workspace/uploads/', '');
        const src = 'uploads/' + filename;
        return `<img src="${src}" alt="图片" class="message-image" onclick="window.open('${src}', '_blank')" />`;
      }

      // 判断是本地路径还是网络URL
      const isLocal = url.startsWith('/') || url.startsWith('./');
      const src = isLocal ? url : url;
      return `<img src="${src}" alt="图片" class="message-image" onclick="window.open('${src}', '_blank')" />`;
    }

    // 否则进行HTML转义
    return escapeHtml(part);
  }).join('');
}

// 自动调整输入框高度
function autoResize(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  updateSendButton();
}

// 更新发送按钮状态
function updateSendButton() {
  if (!sendBtn) return;
  const hasContent = messageInput && messageInput.value.trim().length > 0;
  sendBtn.disabled = !hasContent || !isConnected || isLoading;
}

// 处理回车键
function handleEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage(event);
  }
}

// 滚动到底部
function scrollToBottom() {
  const container = document.getElementById('chat-container');
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }
}

// 显示/隐藏加载状态
function showLoading() {
  if (loadingEl) loadingEl.style.display = 'inline-flex';
  scrollToBottom();
}

function hideLoading() {
  if (loadingEl) loadingEl.style.display = 'none';
}

// 更新连接状态
function updateStatus(text, connected) {
  if (!statusText) return;
  statusText.textContent = text;
  statusText.className = 'status ' + (connected ? 'connected' : 'disconnected');
}

// 加载/保存消息
function loadMessages() {
  const saved = localStorage.getItem('openclaw-messages');
  if (saved) {
    try {
      messages = JSON.parse(saved);
      messages.forEach(msg => renderMessage(msg));
      if (messages.length > 0 && emptyStateEl) {
        emptyStateEl.classList.add('hidden');
        messagesEl.classList.remove('hidden');
      }
    } catch (e) {
      console.error('加载消息失败:', e);
    }
  }
}

function saveMessages() {
  localStorage.setItem('openclaw-messages', JSON.stringify(messages));
}

// 清空聊天
function clearChat() {
  if (confirm('确定要清空对话吗？')) {
    messages = [];
    saveMessages();
    if (messagesEl) messagesEl.innerHTML = '';
    if (emptyStateEl) emptyStateEl.classList.remove('hidden');
    if (messagesEl) messagesEl.classList.add('hidden');
  }
}

// 深色模式
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('dark-mode', document.body.classList.contains('dark'));
}

// 设置 - 显示
function showSettings() {
  console.log('显示设置');
  updateSettingsUI();
  if (settingsModal) settingsModal.classList.add('active');
}

// 设置 - 隐藏
function hideSettings() {
  if (settingsModal) settingsModal.classList.remove('active');
}

// 更新设置 UI
function updateSettingsUI() {
  const gatewayInput = document.getElementById('setting-gateway');
  const apiKeyInput = document.getElementById('setting-apikey');
  if (gatewayInput) gatewayInput.value = window.CONFIG.gatewayUrl;
  if (apiKeyInput) apiKeyInput.value = window.CONFIG.apiKey;
}

// 保存设置
function saveSettings() {
  const gateway = document.getElementById('setting-gateway').value.trim();
  const apiKey = document.getElementById('setting-apikey').value.trim();
  
  if (!gateway || !apiKey) {
    alert('请填写完整的配置信息');
    return;
  }
  
  window.CONFIG.gatewayUrl = gateway;
  window.CONFIG.apiKey = apiKey;
  saveConfig(window.CONFIG);
  
  hideSettings();
  
  // 重新连接
  if (ws) {
    ws.close();
  }
  connect();
  
  alert('设置已保存，正在重新连接...');
}

// 全局函数（使 HTML onclick 可以访问）
window.sendMessage = sendMessage;
window.autoResize = autoResize;
window.handleEnter = handleEnter;
window.clearChat = clearChat;
window.toggleDarkMode = toggleDarkMode;
window.showSettings = showSettings;
window.hideSettings = hideSettings;
window.saveSettings = saveSettings;
