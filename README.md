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

#### RC.init(containerId, accessToken)

创建并初始化一个新的 RC 实例。

**参数：**
- `containerId` (string): 容器元素的 ID
- `accessToken` (string): 访问令牌 URL

**返回：** `Promise<RCInstance>`

```javascript
const instance = await RC.init('container', 'token-url');
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

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

支持现代浏览器，需要 ES6+ 和 postMessage API 支持。

