let h = location.hostname.indexOf(".net") !== -1 ? "https://console.rongcloud.net" : "https://console.rongcloud.cn";
["localhost", "127.0.0.1"].indexOf(location.hostname) !== -1 && (h = location.origin);
const c = {
  BASE_DOMAIN: h,
  // 基础服务域名
  BASE_PATH: "",
  // 基础路径（如果需要子路径可以配置，如 '/api/v1'）
  ALLOWED_ORIGINS: [
    h
    // 允许的消息来源域名列表
  ],
  // URL 构建配置
  URL_CONFIG: {
    CODE_PARAM: "code",
    // 代码参数名
    TOKEN_PARAM: "accessToken",
    // Token 参数名
    PARAM_SEPARATOR: "&"
    // 多参数分隔符
  },
  // 构建完整URL的方法
  buildIframeUrl: function(s, e) {
    const t = c.BASE_DOMAIN + "/agile/embed?", i = new URLSearchParams();
    return i.append(this.URL_CONFIG.TOKEN_PARAM, e), i.append(this.URL_CONFIG.CODE_PARAM, s), t + i.toString();
  }
}, n = {
  EXPIRED: "expired",
  // Token 过期事件
  CODE_ERROR: "codeError",
  // Code 错误事件
  AUTH_ERROR: "authError",
  // 认证错误事件
  NETWORK_ERROR: "networkError",
  // 网络错误事件
  INIT_ERROR: "initError",
  // 初始化错误事件
  READY: "ready",
  // 组件就绪事件
  DESTROY: "destroy"
  // 组件销毁事件
};
class m {
  instanceId;
  containerId;
  code;
  accessToken;
  container = null;
  eventListeners = {};
  isInitialized = !1;
  initTime = null;
  iframe = null;
  messageHandler = null;
  constructor(e, t, i) {
    this.containerId = e, this.code = t, this.accessToken = i, this.instanceId = this.generateInstanceId(), console.log(`RC 实例创建 [${this.instanceId}]:`, { containerId: e, code: t });
  }
  /**
   * 生成唯一实例 ID
   */
  generateInstanceId() {
    return "rc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
  /**
   * 创建事件对象
   */
  createEvent(e, t, i = null, r = null) {
    return {
      type: e,
      message: t,
      code: i,
      timestamp: Date.now(),
      instanceId: this.instanceId,
      data: r
    };
  }
  /**
   * 触发事件
   */
  emitEvent(e, t, i = null, r = null) {
    const o = this.eventListeners[e];
    if (!o || o.length === 0)
      return;
    const R = this.createEvent(e, t, i, r);
    o.forEach((d, E) => {
      try {
        d.handler(R), d.once && o.splice(E, 1);
      } catch (I) {
        console.error(`RC[${this.instanceId}] 事件处理器执行错误 [${e}]:`, I);
      }
    });
  }
  /**
   * 创建组件容器
   */
  createContainer(e) {
    const t = document.getElementById(e);
    return t ? (t.innerHTML = "", t.style.position = "relative", t.style.overflow = "hidden", t.setAttribute("data-rc-instance", this.instanceId), t) : (this.emitEvent(n.INIT_ERROR, `找不到容器元素: ${e}`, "CONTAINER_NOT_FOUND"), null);
  }
  /**
   * 初始化组件
   */
  async initializeComponent() {
    try {
      this.isInitialized = !0, this.initTime = Date.now();
      const e = document.createElement("iframe");
      e.src = c.buildIframeUrl(this.code, this.accessToken), e.style.width = "100%", e.style.height = "100%", e.style.border = "none", this.iframe = e, this.setupMessageListener(), this.container.appendChild(e), this.emitEvent(n.READY, "RC 组件初始化完成", null, {
        containerId: this.containerId,
        code: this.code,
        instanceId: this.instanceId,
        timestamp: this.initTime
      }), console.log(`RC[${this.instanceId}] 组件初始化成功`);
    } catch (e) {
      throw this.emitEvent(n.INIT_ERROR, `组件初始化失败: ${e.message}`, "INIT_FAILED"), e;
    }
  }
  /**
   * 启动初始化流程
   */
  async start() {
    try {
      if (!this.containerId || typeof this.containerId != "string")
        throw this.emitEvent(n.INIT_ERROR, "containerId 必须是非空字符串", "INVALID_CONTAINER_ID"), new Error("Invalid containerId");
      if (this.container = this.createContainer(this.containerId), !this.container)
        throw new Error("Container creation failed");
      return await this.initializeComponent(), this;
    } catch (e) {
      throw this.emitEvent(n.INIT_ERROR, `初始化异常: ${e.message}`, "INIT_EXCEPTION"), console.error(`RC[${this.instanceId}] 初始化失败:`, e), e;
    }
  }
  /**
   * 监听事件
   */
  on(e, t) {
    if (typeof t != "function")
      throw new Error("事件处理器必须是函数");
    return this.eventListeners[e] || (this.eventListeners[e] = []), this.eventListeners[e].push({ handler: t, once: !1 }), this;
  }
  /**
   * 移除事件监听器
   */
  off(e, t) {
    return this.eventListeners[e] ? (t ? (this.eventListeners[e] = this.eventListeners[e].filter(
      (i) => i.handler !== t
    ), this.eventListeners[e].length === 0 && delete this.eventListeners[e]) : delete this.eventListeners[e], this) : this;
  }
  /**
   * 一次性事件监听
   */
  once(e, t) {
    if (typeof t != "function")
      throw new Error("事件处理器必须是函数");
    return this.eventListeners[e] || (this.eventListeners[e] = []), this.eventListeners[e].push({ handler: t, once: !0 }), this;
  }
  /**
   * 销毁实例
   */
  destroy() {
    this.messageHandler && (window.removeEventListener("message", this.messageHandler), this.messageHandler = null), this.container && (this.container.innerHTML = "", this.container.removeAttribute("data-rc-instance"), this.emitEvent(n.DESTROY, "RC 组件已销毁", null, {
      containerId: this.containerId,
      instanceId: this.instanceId,
      duration: this.initTime ? Date.now() - this.initTime : 0
    })), this.eventListeners = {}, this.isInitialized = !1, this.iframe = null, window.RC_INSTANCES && window.RC_INSTANCES[this.instanceId] && delete window.RC_INSTANCES[this.instanceId], console.log(`RC[${this.instanceId}] 实例已销毁`);
  }
  /**
   * 获取实例信息
   */
  getInfo() {
    return {
      instanceId: this.instanceId,
      containerId: this.containerId,
      code: this.code,
      isInitialized: this.isInitialized,
      initTime: this.initTime,
      eventListenerCount: Object.keys(this.eventListeners).length
    };
  }
  /**
   * 检查是否已初始化
   */
  isReady() {
    return this.isInitialized;
  }
  /**
   * 测试事件功能
   */
  testEvents() {
    console.log(`=== RC[${this.instanceId}] 事件测试 ===`), this.emitEvent(n.READY, "这是一个测试就绪事件"), setTimeout(() => {
      this.emitEvent(n.NETWORK_ERROR, "这是一个测试网络错误", "TEST_NETWORK_ERROR");
    }, 1e3);
  }
  /**
   * 模拟错误
   */
  simulateError() {
    const e = [
      { type: n.EXPIRED, message: "模拟 Token 过期", code: "SIM_TOKEN_EXPIRED" },
      { type: n.CODE_ERROR, message: "模拟代码错误", code: "SIM_CODE_ERROR" },
      { type: n.AUTH_ERROR, message: "模拟认证失败", code: "SIM_AUTH_ERROR" },
      { type: n.NETWORK_ERROR, message: "模拟网络异常", code: "SIM_NETWORK_ERROR" }
    ], t = e[Math.floor(Math.random() * e.length)];
    this.emitEvent(t.type, t.message, t.code);
  }
  /**
   * 设置 postMessage 监听器
   */
  setupMessageListener() {
    const e = (t) => {
      if (!this.isValidOrigin(t.origin)) {
        console.warn(`RC[${this.instanceId}] 收到来自非法源的消息:`, t.origin);
        return;
      }
      t.source === this.iframe?.contentWindow && this.handleIframeMessage(t.data);
    };
    window.addEventListener("message", e), this.messageHandler = e;
  }
  /**
   * 验证消息来源是否合法
   */
  isValidOrigin(e) {
    return c.ALLOWED_ORIGINS.indexOf(e) !== -1;
  }
  /**
   * 处理来自iframe的消息
   */
  handleIframeMessage(e) {
    try {
      const t = typeof e == "string" ? JSON.parse(e) : e;
      switch (console.log(`RC[${this.instanceId}] 收到iframe消息:`, t), t.type) {
        case "token-expired":
          this.emitEvent(n.EXPIRED, t.message || "Token已过期", t.code, t.data);
          break;
        case "auth-error":
          this.emitEvent(n.AUTH_ERROR, t.message || "认证失败", t.code, t.data);
          break;
        case "network-error":
          this.emitEvent(n.NETWORK_ERROR, t.message || "网络错误", t.code, t.data);
          break;
        case "code-error":
          this.emitEvent(n.CODE_ERROR, t.message || "代码错误", t.code, t.data);
          break;
        case "iframe-ready":
          console.log(`RC[${this.instanceId}] iframe内容已就绪`);
          break;
        case "height-change":
          t.height && this.iframe && (this.iframe.style.height = t.height + "px");
          break;
        default:
          console.log(`RC[${this.instanceId}] 未知消息类型:`, t.type);
      }
    } catch (t) {
      console.error(`RC[${this.instanceId}] 处理iframe消息时出错:`, t);
    }
  }
  /**
   * 向iframe发送消息
   */
  sendMessageToIframe(e) {
    this.iframe?.contentWindow && this.iframe.contentWindow.postMessage(e, c.BASE_DOMAIN);
  }
}
const a = window.RC_INSTANCES || {}, l = {
  // 事件名常量
  EVENTS: n,
  /**
   * 初始化 RC 实例
   */
  init: async function(s, e, t) {
    const i = new m(s, e, t);
    window.RC_INSTANCES[i.instanceId] = i;
    try {
      return await i.start(), i;
    } catch (r) {
      throw delete window.RC_INSTANCES[i.instanceId], r;
    }
  },
  /**
   * 获取所有实例
   */
  getAllInstances: function() {
    return a || {};
  },
  /**
   * 根据 ID 获取实例
   */
  getInstance: function(s) {
    return a[s] || null;
  },
  /**
   * 销毁所有实例
   */
  destroyAll: function() {
    Object.values(a || {}).forEach((s) => {
      s.destroy();
    }), window.RC_INSTANCES = {};
  },
  /**
   * 获取所有可用的事件名
   */
  getEventNames: function() {
    return Object.values(n);
  },
  /**
   * 检查事件名是否有效
   */
  isValidEvent: function(s) {
    return Object.values(n).indexOf(s) !== -1;
  },
  getUrl: function(s) {
    const e = a[s];
    return e && e.iframe?.src || "";
  }
};
window.addEventListener("beforeunload", function() {
  l.destroyAll();
});
console.log("RC 组件库已加载完成 (实例化模式)");
console.log("可用事件:", l.getEventNames());
export {
  l as default
};
