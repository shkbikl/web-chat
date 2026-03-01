// OpenClaw Web Chat 配置

const DEFAULT_CONFIG = {
  // Gateway WebSocket 地址
  gatewayUrl: 'ws://' + window.location.hostname + ':15823',
  
  // API Key（Gateway Token）
  apiKey: '1ab581483035706a8289c7e5f2e8b00b',
  
  // App 名称
  appName: 'OpenClaw Chat',
  
  // 默认会话 ID
  defaultSession: 'default',
  
  // 启用 Markdown
  enableMarkdown: true,
  
  // 消息保留天数
  messageRetentionDays: 30,
};

// 从 localStorage 加载配置
function loadConfig() {
  const saved = localStorage.getItem('openclaw-config');
  if (saved) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('加载配置失败:', e);
    }
  }
  return DEFAULT_CONFIG;
}

// 保存配置到 localStorage
function saveConfig(config) {
  localStorage.setItem('openclaw-config', JSON.stringify(config));
}

// 获取完整的 API URL（将 ws/wss 转换为 http/https）
function getApiUrl() {
  let url = window.CONFIG.gatewayUrl;
  // 将 ws:// 转换为 http://
  url = url.replace('ws://', 'http://');
  // 将 wss:// 转换为 https://
  url = url.replace('wss://', 'https://');
  // 确保不以 / 结尾
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url + '/v1/chat/completions';
}

// 暴露到全局作用域
window.saveConfig = saveConfig;
window.loadConfig = loadConfig;
window.getApiUrl = getApiUrl;

// 全局配置对象
window.CONFIG = loadConfig();
