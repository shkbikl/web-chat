# OpenClaw Chat - Android APP

基于 Capacitor 构建的原生 Android 应用，封装了 OpenClaw Web Chat 界面。

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 同步到 Android
npm run sync

# 打开 Android Studio
npm run open
```

### GitHub 构建

推送代码到 GitHub 后，自动触发构建 APK：

```bash
git add .
git commit -m "Update"
git push
```

在 GitHub Actions 中下载 `openclaw-chat-debug.apk`

## 项目结构

```
web-chat/
├── www/                 # Web 资源（打包到 APP）
│   ├── index.html      # 主页面
│   ├── app.js          # 应用逻辑
│   ├── config.js       # 配置
│   └── uploads/        # 上传文件
├── android/            # Android 原生项目（自动生成）
├── capacitor.config.json  # Capacitor 配置
└── package.json        # 依赖管理
```

## 配置

### 修改服务器地址

编辑 `www/config.js`：

```javascript
const CONFIG = {
  gatewayUrl: 'http://your-server-ip:15823',
  uploadUrl: 'http://your-server-ip:3100'
};
```

### 修改 APP 信息

编辑 `capacitor.config.json`：

```json
{
  "appId": "com.openclaw.chat",
  "appName": "OpenClaw Chat",
  "webDir": "www"
}
```

## 构建版本

- Capacitor 8.1.0
- Android Gradle Plugin 8.x
- Node.js 20+
- Java 17

## 注意

- `android/` 目录由 Capacitor 自动生成，不要手动修改
- Web 资源修改后需要运行 `npx cap sync android`
- 上传的文档文件不会提交到 Git