# @rongcloud/embed-console-sdk

一个用于嵌入融云控制台组件的 JavaScript SDK，支持在网页中动态加载和管理融云控制台的 iframe 组件。

## 特性

- 🎯 **简单易用** - 简洁的 API 设计，快速集成
- 🔄 **实例管理** - 支持多实例创建和管理
- 🌐 **跨域通信** - 基于 postMessage 的安全通信

## 安装

```bash
npm install @rongcloud/embed-console-sdk
```

## 基本用法

### 1. 引入 SDK

```javascript
// ES6 模块
import RC from '@rongcloud/embed-console-sdk';

// UMD (通过 script 标签引入)
// <script src="path/to/embed.umd.js"></script>
// 全局变量 RC 可用
```

### 2. 初始化组件

```javascript
// 创建一个 RC 实例
const instance = await RC.init(
  'my-container',        // 容器元素 ID
  'my-app-code',         // 应用代码
  'https://console.rongcloud.cn/...' // 访问令牌 URL
);

console.log('RC 组件初始化完成');
```

### 3. HTML 容器

```html
<!-- 在 HTML 中准备容器元素 -->
<div id="my-container" style="width: 100%; height: 500px;"></div>
```

## API 参考

### RC 主对象

#### RC.init(containerId, code, accessToken)

创建并初始化一个新的 RC 实例。

**参数：**
- `containerId` (string): 容器元素的 ID
- `code` (string): 应用代码
- `accessToken` (string): 访问令牌 URL

**返回：** `Promise<RCInstance>`

```javascript
const instance = await RC.init('container', 'app-code', 'token-url');
```

#### RC.getAllInstances()

获取所有已创建的实例。

**返回：** `Record<string, RCInstance>`

```javascript
const instances = RC.getAllInstances();
console.log('当前实例数量:', Object.keys(instances).length);
```

#### RC.getInstance(instanceId)

根据实例 ID 获取特定实例。

**参数：**
- `instanceId` (string): 实例 ID

**返回：** `RCInstance | null`

```javascript
const instance = RC.getInstance('rc_1234567890_abcdef123');
```

#### RC.destroyAll()

销毁所有实例并清理资源。

```javascript
RC.destroyAll();
```

#### RC.getEventNames()

获取所有可用的事件名称。

**返回：** `string[]`

```javascript
const events = RC.getEventNames();
console.log('可用事件:', events); // ['expired', 'initError']
```

### RCInstance 实例方法

#### instance.on(eventType, handler)

监听事件。

**参数：**
- `eventType` (string): 事件类型
- `handler` (function): 事件处理函数

**返回：** `RCInstance` (支持链式调用)

```javascript
instance.on(RC.EVENTS.EXPIRED, (event) => {
  console.log('Token 已过期:', event);
  // 处理 token 过期逻辑
});
```

#### instance.once(eventType, handler)

监听事件（仅触发一次）。

```javascript
instance.once(RC.EVENTS.INIT_ERROR, (event) => {
  console.error('初始化失败:', event.message);
});
```

#### instance.off(eventType, handler)

移除事件监听器。

```javascript
const handler = (event) => console.log(event);
instance.on(RC.EVENTS.EXPIRED, handler);
instance.off(RC.EVENTS.EXPIRED, handler); // 移除特定处理器
instance.off(RC.EVENTS.EXPIRED); // 移除所有该事件的处理器
```

#### instance.destroy()

销毁实例并清理资源。

```javascript
instance.destroy();
```

#### instance.getInfo()

获取实例详细信息。

**返回：** `InstanceInfo`

```javascript
const info = instance.getInfo();
console.log('实例信息:', info);
// {
//   instanceId: "rc_1234567890_abcdef123",
//   containerId: "my-container",
//   code: "my-app-code",
//   isInitialized: true,
//   initTime: 1642588800000,
//   eventListenerCount: 2
// }
```

#### instance.isReady()

检查实例是否已初始化完成。

**返回：** `boolean`

```javascript
if (instance.isReady()) {
  console.log('实例已就绪');
}
```

#### instance.sendMessageToIframe(message)

向嵌入的 iframe 发送消息。

**参数：**
- `message` (any): 要发送的消息数据

```javascript
instance.sendMessageToIframe({
  type: 'custom-action',
  data: { key: 'value' }
});
```

## 事件系统

### 可用事件

```javascript
RC.EVENTS.EXPIRED     // 'expired' - Token 过期
RC.EVENTS.INIT_ERROR  // 'initError' - 初始化错误
```

### 事件对象结构

```javascript
{
  type: 'expired',           // 事件类型
  message: 'Token已过期',    // 事件消息
  code: 'TOKEN_EXPIRED',     // 错误代码（可选）
  timestamp: 1642588800000,  // 时间戳
  instanceId: 'rc_123...',   // 实例 ID
  data: { ... }              // 附加数据（可选）
}
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>RC 嵌入组件示例</title>
</head>
<body>
  <div id="rc-container" style="width: 100%; height: 600px; border: 1px solid #ddd;"></div>

  <script type="module">
    import RC from './embed.es.js';

    async function initRC() {
      try {
        // 初始化实例
        const instance = await RC.init(
          'rc-container',
          'my-app-code',
          'https://console.rongcloud.cn/embed?token=...'
        );

        // 监听事件
        instance
          .on(RC.EVENTS.EXPIRED, (event) => {
            alert('Token 已过期，请重新登录');
            console.log('过期事件:', event);
          })
          .on(RC.EVENTS.INIT_ERROR, (event) => {
            console.error('初始化错误:', event);
          });

        console.log('RC 组件加载完成');
        console.log('实例信息:', instance.getInfo());

      } catch (error) {
        console.error('RC 初始化失败:', error);
      }
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initRC);

    // 页面卸载时自动清理（可选，SDK 会自动处理）
    window.addEventListener('beforeunload', () => {
      RC.destroyAll();
    });
  </script>
</body>
</html>
```

## 错误处理

```javascript
try {
  const instance = await RC.init('container', 'code', 'token');
  
  // 监听初始化错误
  instance.on(RC.EVENTS.INIT_ERROR, (event) => {
    switch (event.code) {
      case 'CONTAINER_NOT_FOUND':
        console.error('找不到容器元素');
        break;
      case 'INVALID_CONTAINER_ID':
        console.error('无效的容器 ID');
        break;
      case 'INIT_FAILED':
        console.error('组件初始化失败');
        break;
      default:
        console.error('未知错误:', event.message);
    }
  });
  
} catch (error) {
  console.error('创建实例失败:', error);
}
```

## 注意事项

1. **容器要求**：确保容器元素在调用 `RC.init()` 之前已存在于 DOM 中
2. **多实例**：支持在同一页面创建多个实例，每个实例独立管理
3. **资源清理**：页面卸载时会自动清理所有实例，也可手动调用 `destroy()` 方法
4. **事件监听**：建议在实例创建后立即设置事件监听器
5. **错误处理**：始终监听 `INIT_ERROR` 事件处理初始化失败的情况

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

支持现代浏览器，需要 ES6+ 和 postMessage API 支持。

## 版本

当前版本：0.0.1

## 许可证

详见项目许可证文件。
