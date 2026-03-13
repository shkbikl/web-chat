// OpenClaw Web Chat 配置

const DEFAULT_CONFIG = {
  // API Proxy 地址（留空自动检测）
  gatewayUrl: 'http://43.110.16.63:11035',
  
  // API Key（Gateway Token）
  apiKey: '2a19c190980425c278753df29c5c4e4b',
  
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

// 暴露到全局作用域
window.saveConfig = saveConfig;

// 全局配置对象
window.CONFIG = loadConfig();
