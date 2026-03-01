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

// 全局配置对象
window.CONFIG = loadConfig();
