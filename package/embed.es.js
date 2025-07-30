const i = {
  EXPIRED: "expired",
  // Token 过期事件
  // CODE_ERROR: 'codeError',      // Code 错误事件
  // AUTH_ERROR: 'authError',      // 认证错误事件
  // NETWORK_ERROR: 'networkError', // 网络错误事件
  INIT_ERROR: "initError"
  // 初始化错误事件
  // READY: 'ready',               // 组件就绪事件
  // DESTROY: 'destroy'            // 组件销毁事件
};
class f {
  instanceId;
  containerId;
  accessToken;
  container = null;
  eventListeners = {};
  isInitialized = !1;
  initTime = null;
  iframe = null;
  messageHandler = null;
  constructor(e, t) {
    this.containerId = e, this.accessToken = t, this.instanceId = this.generateInstanceId(), console.log(`RC 实例创建 [${this.instanceId}]:`, { containerId: e });
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
  createEvent(e, t, s = null, o = null) {
    return {
      type: e,
      message: t,
      code: s,
      timestamp: Date.now(),
      instanceId: this.instanceId,
      data: o
    };
  }
  /**
   * 触发事件
   */
  emitEvent(e, t, s = null, o = null) {
    const a = this.eventListeners[e];
    if (!a || a.length === 0)
      return;
    const l = this.createEvent(e, t, s, o);
    a.forEach((c, d) => {
      try {
        c.handler(l), c.once && a.splice(d, 1);
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
    return t ? (t.innerHTML = "", t.style.position = "relative", t.style.overflow = "hidden", t.setAttribute("data-rc-instance", this.instanceId), t) : (this.emitEvent(i.INIT_ERROR, `找不到容器元素: ${e}`, "CONTAINER_NOT_FOUND"), null);
  }
  /**
   * 初始化组件
   */
  async initializeComponent() {
    try {
      this.isInitialized = !0, this.initTime = Date.now();
      const e = document.createElement("iframe");
      e.src = this.accessToken, e.style.width = "100%", e.style.height = "100%", e.style.border = "none", this.iframe = e, this.setupMessageListener(), this.container.appendChild(e), console.log(`RC[${this.instanceId}] 组件初始化成功`);
    } catch (e) {
      throw this.emitEvent(i.INIT_ERROR, `组件初始化失败: ${e.message}`, "INIT_FAILED"), e;
    }
  }
  /**
   * 启动初始化流程
   */
  async start() {
    try {
      if (!this.containerId || typeof this.containerId != "string")
        throw this.emitEvent(i.INIT_ERROR, "containerId 必须是非空字符串", "INVALID_CONTAINER_ID"), new Error("Invalid containerId");
      if (this.container = this.createContainer(this.containerId), !this.container)
        throw new Error("Container creation failed");
      return await this.initializeComponent(), this;
    } catch (e) {
      throw this.emitEvent(i.INIT_ERROR, `初始化异常: ${e.message}`, "INIT_EXCEPTION"), console.error(`RC[${this.instanceId}] 初始化失败:`, e), e;
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
      (s) => s.handler !== t
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
    this.messageHandler && (window.removeEventListener("message", this.messageHandler), this.messageHandler = null), this.container && (this.container.innerHTML = "", this.container.removeAttribute("data-rc-instance")), this.eventListeners = {}, this.isInitialized = !1, this.iframe = null, window.RC_INSTANCES && window.RC_INSTANCES[this.instanceId] && delete window.RC_INSTANCES[this.instanceId], console.log(`RC[${this.instanceId}] 实例已销毁`);
  }
  /**
   * 获取实例信息
   */
  getInfo() {
    return {
      instanceId: this.instanceId,
      containerId: this.containerId,
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
   * 设置 postMessage 监听器
   */
  setupMessageListener() {
    const e = (t) => {
      t.source === this.iframe?.contentWindow && this.handleIframeMessage(t.data);
    };
    window.addEventListener("message", e), this.messageHandler = e;
  }
  /**
   * 处理来自iframe的消息
   */
  handleIframeMessage(e) {
    try {
      const t = typeof e == "string" ? JSON.parse(e) : e;
      switch (console.log(`RC[${this.instanceId}] 收到iframe消息:`, t), t.type) {
        case "token-expired":
          this.emitEvent(i.EXPIRED, t.message || "Token已过期", t.code, t.data);
          break;
        // case 'auth-error':
        //   this.emitEvent(RC_EVENTS.AUTH_ERROR, message.message || '认证失败', message.code, message.data);
        //   break;
        // case 'network-error':
        //   this.emitEvent(RC_EVENTS.NETWORK_ERROR, message.message || '网络错误', message.code, message.data);
        //   break;
        // case 'code-error':
        //   this.emitEvent(RC_EVENTS.CODE_ERROR, message.message || '代码错误', message.code, message.data);
        //   break;
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
    this.iframe?.contentWindow && this.iframe.contentWindow.postMessage(e, "*");
  }
}
const r = window.RC_INSTANCES || {}, h = {
  // 事件名常量
  EVENTS: i,
  /**
   * 初始化 RC 实例
   */
  init: async function(n, e) {
    const t = new f(n, e);
    r[t.instanceId] = t;
    try {
      return await t.start(), t;
    } catch (s) {
      throw delete window.RC_INSTANCES[t.instanceId], s;
    }
  },
  /**
   * 获取所有实例
   */
  getAllInstances: function() {
    return r || {};
  },
  /**
   * 根据 ID 获取实例
   */
  getInstance: function(n) {
    return r[n] || null;
  },
  /**
   * 销毁所有实例
   */
  destroyAll: function() {
    Object.values(r || {}).forEach((n) => {
      n.destroy();
    }), window.RC_INSTANCES = {};
  },
  /**
   * 获取所有可用的事件名
   */
  getEventNames: function() {
    return Object.values(i);
  },
  /**
   * 检查事件名是否有效
   */
  isValidEvent: function(n) {
    return Object.values(i).indexOf(n) !== -1;
  },
  getUrl: function(n) {
    const e = r[n];
    return e && e.iframe?.src || "";
  }
};
window.addEventListener("beforeunload", function() {
  h.destroyAll();
});
console.log("RC 组件库已加载完成 (实例化模式)");
console.log("可用事件:", h.getEventNames());
export {
  h as default
};
