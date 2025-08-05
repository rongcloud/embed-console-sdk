declare global {
    interface Window {
        RC_INSTANCES: Record<string, RCInstance>;
        RC: RC;
    }
}
interface RCEvents {
    EXPIRED: string;
    INIT_ERROR: string;
}
interface RCEvent {
    type: string;
    message: string;
    code: string | number | null;
    timestamp: number;
    instanceId: string;
    data: any;
}
interface InstanceInfo {
    instanceId: string;
    containerId: string;
    isInitialized: boolean;
    initTime: number | null;
    eventListenerCount: number;
}
interface RC {
    EVENTS: RCEvents;
    init: (containerId: string, accessToken: string, showMenu: boolean) => RCInstance;
    getEventNames: () => string[];
    getInstance: (instanceId: string) => RCInstance | null;
}
/**
 * RC 实例类
 */
declare class RCInstance {
    readonly instanceId: string;
    readonly containerId: string;
    readonly accessToken: string;
    private container;
    private eventListeners;
    private isInitialized;
    private initTime;
    iframe: HTMLIFrameElement | null;
    private messageHandler;
    private showMenu;
    constructor(containerId: string, accessToken: string, showMenu: boolean);
    /**
     * 生成唯一实例 ID
     */
    private generateInstanceId;
    /**
     * 创建事件对象
     */
    private createEvent;
    /**
     * 触发事件
     */
    private emitEvent;
    /**
     * 创建组件容器
     */
    private createContainer;
    /**
     * 初始化组件
     */
    private initializeComponent;
    /**
     * 启动初始化流程
     */
    start(): RCInstance;
    /**
     * 监听事件
     */
    on(eventType: string, handler: (event: RCEvent) => void): RCInstance;
    /**
     * 销毁实例
     */
    destroy(): void;
    /**
     * 获取实例信息
     */
    getInfo(): InstanceInfo;
    /**
     * 检查是否已初始化
     */
    isReady(): boolean;
    /**
     * 设置 postMessage 监听器
     */
    private setupMessageListener;
    /**
     * 处理来自iframe的消息
     */
    private handleIframeMessage;
    /**
     * 向iframe发送消息
     */
    sendMessageToIframe(message: any): void;
}
declare const RC: RC;
export default RC;
