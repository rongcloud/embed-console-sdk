declare global{
  interface Window {
    RC_INSTANCES: Record<string, RCInstance>;
    RC: RC;
  }
}

interface RCEvents {
  EXPIRED: string;
  // CODE_ERROR: string;
  // AUTH_ERROR: string;
  // NETWORK_ERROR: string;
  INIT_ERROR: string;
  // READY: string;
  // DESTROY: string;
}

interface EventListener {
  handler: (event: RCEvent) => void;
  once: boolean;
}

interface RCEvent {
  type: string;
  message: string;
  code: string | number | null;
  timestamp: number;
  instanceId: string;
  data: any;
}

interface IframeMessage {
  type: string;
  message?: string;
  code?: string | number;
  data?: any;
  height?: number;
}

interface InstanceInfo {
  instanceId: string;
  containerId: string;
  code: string;
  isInitialized: boolean;
  initTime: number | null;
  eventListenerCount: number;
}

interface RC {
  EVENTS: RCEvents;
  init: (containerId: string, code: string, accessToken: string) => Promise<RCInstance>;
  getAllInstances: () => Record<string, RCInstance>;
  getInstance: (instanceId: string) => RCInstance | null;
  destroyAll: () => void;
  getEventNames: () => string[];
  isValidEvent: (eventName: string) => boolean;
  getUrl: (instanceId: string) => string;
}

  // 事件名常量定义
  const RC_EVENTS: RCEvents = {
    EXPIRED: 'expired',           // Token 过期事件
    // CODE_ERROR: 'codeError',      // Code 错误事件
    // AUTH_ERROR: 'authError',      // 认证错误事件
    // NETWORK_ERROR: 'networkError', // 网络错误事件
    INIT_ERROR: 'initError',      // 初始化错误事件
    // READY: 'ready',               // 组件就绪事件
    // DESTROY: 'destroy'            // 组件销毁事件
  };

  /**
   * RC 实例类
   */
  class RCInstance {
    public readonly instanceId: string;
    public readonly containerId: string;
    public readonly code: string;
    public readonly accessToken: string;
    private container: HTMLElement | null = null;
    private eventListeners: Record<string, EventListener[]> = {};
    private isInitialized: boolean = false;
    private initTime: number | null = null;
    public iframe: HTMLIFrameElement | null = null;
    private messageHandler: ((event: MessageEvent) => void) | null = null;

    constructor(containerId: string, code: string, accessToken: string) {
      this.containerId = containerId;
      this.code = code;
      this.accessToken = accessToken;
      this.instanceId = this.generateInstanceId();

      console.log(`RC 实例创建 [${this.instanceId}]:`, { containerId, code });
    }

    /**
     * 生成唯一实例 ID
     */
    private generateInstanceId(): string {
      return 'rc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建事件对象
     */
    private createEvent(type: string, message: string, code: string | number | null = null, data: any = null): RCEvent {
      return {
        type,
        message,
        code,
        timestamp: Date.now(),
        instanceId: this.instanceId,
        data
      };
    }

    /**
     * 触发事件
     */
    private emitEvent(eventType: string, message: string, code: string | number | null = null, data: any = null): void {
      const listeners = this.eventListeners[eventType];
      if (!listeners || listeners.length === 0) {
        return;
      }

      const event = this.createEvent(eventType, message, code, data);

      // 执行所有监听器
      listeners.forEach((listener, index) => {
        try {
          listener.handler(event);

          // 如果是一次性监听器，执行后移除
          if (listener.once) {
            listeners.splice(index, 1);
          }
        } catch (error) {
          console.error(`RC[${this.instanceId}] 事件处理器执行错误 [${eventType}]:`, error);
        }
      });
    }

    /**
     * 创建组件容器
     */
    private createContainer(containerId: string): HTMLElement | null {
      const container = document.getElementById(containerId);
      if (!container) {
        this.emitEvent(RC_EVENTS.INIT_ERROR, `找不到容器元素: ${containerId}`, 'CONTAINER_NOT_FOUND');
        return null;
      }

      // 清空容器内容
      container.innerHTML = '';

      // 添加基本样式和实例标识
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      container.setAttribute('data-rc-instance', this.instanceId);

      return container;
    }

    /**
     * 初始化组件
     */
    private async initializeComponent(): Promise<void> {
      try {
        this.isInitialized = true;
        this.initTime = Date.now();

        // 创建 iframe 容器
        const iframe = document.createElement('iframe');
        iframe.src = this.accessToken;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        // 保存iframe引用
        this.iframe = iframe;

        // 添加 postMessage 监听器
        this.setupMessageListener();

        this.container!.appendChild(iframe);

        console.log(`RC[${this.instanceId}] 组件初始化成功`);

      } catch (error: any) {
        this.emitEvent(RC_EVENTS.INIT_ERROR, `组件初始化失败: ${error.message}`, 'INIT_FAILED');
        throw error;
      }
    }

    /**
     * 启动初始化流程
     */
    public async start(): Promise<RCInstance> {
      try {
        // 参数验证
        if (!this.containerId || typeof this.containerId !== 'string') {
          this.emitEvent(RC_EVENTS.INIT_ERROR, 'containerId 必须是非空字符串', 'INVALID_CONTAINER_ID');
          throw new Error('Invalid containerId');
        }
        // 创建容器
        this.container = this.createContainer(this.containerId);
        if (!this.container) {
          throw new Error('Container creation failed');
        }

        // 初始化组件
        await this.initializeComponent();

        return this;

      } catch (error: any) {
        this.emitEvent(RC_EVENTS.INIT_ERROR, `初始化异常: ${error.message}`, 'INIT_EXCEPTION');
        console.error(`RC[${this.instanceId}] 初始化失败:`, error);
        throw error;
      }
    }

    /**
     * 监听事件
     */
    public on(eventType: string, handler: (event: RCEvent) => void): RCInstance {
      if (typeof handler !== 'function') {
        throw new Error('事件处理器必须是函数');
      }

      if (!this.eventListeners[eventType]) {
        this.eventListeners[eventType] = [];
      }

      this.eventListeners[eventType].push({ handler, once: false });
      return this;
    }

    /**
     * 移除事件监听器
     */
    public off(eventType: string, handler?: (event: RCEvent) => void): RCInstance {
      if (!this.eventListeners[eventType]) {
        return this;
      }

      if (!handler) {
        delete this.eventListeners[eventType];
      } else {
        this.eventListeners[eventType] = this.eventListeners[eventType].filter(
          listener => listener.handler !== handler
        );

        if (this.eventListeners[eventType].length === 0) {
          delete this.eventListeners[eventType];
        }
      }

      return this;
    }

    /**
     * 一次性事件监听
     */
    public once(eventType: string, handler: (event: RCEvent) => void): RCInstance {
      if (typeof handler !== 'function') {
        throw new Error('事件处理器必须是函数');
      }

      if (!this.eventListeners[eventType]) {
        this.eventListeners[eventType] = [];
      }

      this.eventListeners[eventType].push({ handler, once: true });
      return this;
    }

    /**
     * 销毁实例
     */
    public destroy(): void {
      // 移除消息监听器
      if (this.messageHandler) {
        window.removeEventListener('message', this.messageHandler);
        this.messageHandler = null;
      }

      if (this.container) {
        this.container.innerHTML = '';
        this.container.removeAttribute('data-rc-instance');

        // this.emitEvent(RC_EVENTS.DESTROY, 'RC 组件已销毁', null, {
        //   containerId: this.containerId,
        //   instanceId: this.instanceId,
        //   duration: this.initTime ? Date.now() - this.initTime : 0
        // });
      }

      // 清理事件监听器
      this.eventListeners = {};
      this.isInitialized = false;
      this.iframe = null;

      // 从全局实例管理器中移除
      if (window.RC_INSTANCES && window.RC_INSTANCES[this.instanceId]) {
        delete window.RC_INSTANCES[this.instanceId];
      }

      console.log(`RC[${this.instanceId}] 实例已销毁`);
    }

    /**
     * 获取实例信息
     */
    public getInfo(): InstanceInfo {
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
    public isReady(): boolean {
      return this.isInitialized;
    }


    /**
     * 设置 postMessage 监听器
     */
    private setupMessageListener(): void {
      const messageHandler = (event: MessageEvent): void => {
        // 安全检查：验证消息来源
        // if (!this.isValidOrigin(event.origin)) {
        //   console.warn(`RC[${this.instanceId}] 收到来自非法源的消息:`, event.origin);
        //   return;
        // }

        // 验证消息是否来自当前iframe
        if (event.source !== this.iframe?.contentWindow) {
          return;
        }

        this.handleIframeMessage(event.data);
      };

      // 添加消息监听器
      window.addEventListener('message', messageHandler);

      // 保存引用以便清理
      this.messageHandler = messageHandler;
    }
    /**
     * 处理来自iframe的消息
     */
    private handleIframeMessage(data: any): void {
      try {
        // 解析消息数据
        const message: IframeMessage = typeof data === 'string' ? JSON.parse(data) : data;

        console.log(`RC[${this.instanceId}] 收到iframe消息:`, message);

        // 根据消息类型触发相应事件
        switch (message.type) {
          case 'token-expired':
            this.emitEvent(RC_EVENTS.EXPIRED, message.message || 'Token已过期', message.code, message.data);
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

          case 'iframe-ready':
            console.log(`RC[${this.instanceId}] iframe内容已就绪`);
            break;

          case 'height-change':
            // 处理iframe高度变化
            if (message.height && this.iframe) {
              this.iframe.style.height = message.height + 'px';
            }
            break;

          default:
            console.log(`RC[${this.instanceId}] 未知消息类型:`, message.type);
        }

      } catch (error) {
        console.error(`RC[${this.instanceId}] 处理iframe消息时出错:`, error);
      }
    }

    /**
     * 向iframe发送消息
     */
    public sendMessageToIframe(message: any): void {
      if (this.iframe?.contentWindow) {
        this.iframe.contentWindow.postMessage(message, '*');
      }
    }
  }

  // 全局实例管理器
  const RC_INSTANCES = window.RC_INSTANCES || {};

  // RC 主对象
  const RC: RC = {
    // 事件名常量
    EVENTS: RC_EVENTS,

    /**
     * 初始化 RC 实例
     */
    init: async function(containerId: string, code: string, accessToken: string): Promise<RCInstance> {
      const instance = new RCInstance(containerId, code, accessToken);

      // 保存到全局实例管理器
      RC_INSTANCES[instance.instanceId] = instance;

      try {
        await instance.start();
        return instance;
      } catch (error) {
        // 初始化失败时清理实例
        delete window.RC_INSTANCES[instance.instanceId];
        throw error;
      }
    },

    /**
     * 获取所有实例
     */
    getAllInstances: function(): Record<string, RCInstance> {
      return RC_INSTANCES || {};
    },

    /**
     * 根据 ID 获取实例
     */
    getInstance: function(instanceId: string): RCInstance | null {
      return RC_INSTANCES[instanceId] || null;
    },

    /**
     * 销毁所有实例
     */
    destroyAll: function(): void {
      Object.values(RC_INSTANCES || {}).forEach(instance => {
        instance.destroy();
      });
      window.RC_INSTANCES = {};
    },

    /**
     * 获取所有可用的事件名
     */
    getEventNames: function(): string[] {
      return Object.values(RC_EVENTS);
    },

    /**
     * 检查事件名是否有效
     */
    isValidEvent: function(eventName: string): boolean {
      return Object.values(RC_EVENTS).indexOf(eventName) !== -1;
    },
    
    getUrl: function(instanceId: string): string {
      const instance = RC_INSTANCES[instanceId];
      if(!instance) {
        return '';
      }
      return instance.iframe?.src || '';
    }
  };


  // 页面卸载时自动销毁所有实例
  window.addEventListener('beforeunload', function() {
    RC.destroyAll();
  });

  console.log('RC 组件库已加载完成 (实例化模式)');
  console.log('可用事件:', RC.getEventNames());

export default RC;

  
