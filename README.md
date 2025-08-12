# @rongcloud/embed-console-sdk

一个用于嵌入融云控制台组件的 JavaScript SDK，支持在网页中动态加载和管理融云控制台的 iframe 组件。


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
<script src="https://cdn.ronghub.com/embed/console/embed.umd.js"></script>
// 全局变量 RC 可用
```

### 2. 初始化组件

```javascript
// 创建一个 RC 实例
const instance = await RC.init(
  'my-container',        // 容器元素 ID
  'https://console.rongcloud.cn/...' // 访问令牌
);
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
- `showMenu` (boolean): 是否显示菜单

**返回：** `Promise<RCInstance>`

```javascript
const instance = RC.init('container', 'access token', true);
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

监听事件

**参数：**
- `eventType` (string): 事件类型
- `handler` (function): 事件处理函数

**返回：** `RCInstance` 

```javascript
instance.on(RC.EVENTS.EXPIRED, (event) => {
  console.log('Token 已过期:', event);
  // 处理 token 过期逻辑
});
```

#### instance.destory()

销毁实例

```javascript
instance.destory();
```


## 浏览器兼容性

支持现代浏览器，需要 ES6+ 和 postMessage API 支持。

## 常见问题

### Safari 浏览器 无法使用

Safari 浏览器需要在设置 -> 隐私 ，关闭防止跨站跟踪

