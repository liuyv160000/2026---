// 平台组件：作为地面碰撞体的占位脚本
import { _decorator, Component, Node, Collider2D, Contact2DType, IPhysics2DContact, RigidBody2D } from 'cc';
import {Playercontralor} from '../player/Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('plat_line')
export class plat_line extends Component {
    
    private collider: Collider2D = null;
    private rigidBody: RigidBody2D = null;
    
    // 记录站在平台上的节点
    private nodesOnPlatform: Set<Node> = new Set();

    // 组件启动
    start() {
        this.initPhysics();
    }

    /**
     * 初始化物理组件
     */
    private initPhysics(): void {
        // 获取或添加刚体组件
        this.rigidBody = this.node.getComponent(RigidBody2D);
        if (!this.rigidBody) {
            this.rigidBody = this.node.addComponent(RigidBody2D);
        }
        // 设置为静态刚体（不受重力影响，不移动）
        this.rigidBody.type = 0; // 0 = Static
        this.rigidBody.gravityScale = 0;
        
        // 获取碰撞体组件
        this.collider = this.node.getComponent(Collider2D);
        if (!this.collider) {
            console.warn('plat_line: 未找到Collider2D组件！');
            return;
        }
        
        // 注册碰撞监听
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    /**
     * 碰撞开始回调
     */
    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
        const otherNode = otherCollider.node;
        
        // 防止重复检测
        if (this.nodesOnPlatform.has(otherNode)) {
            return;
        }
        
        // 记录碰撞节点
        this.nodesOnPlatform.add(otherNode);
        
        console.log(`有物体接触到平台: ${otherNode.name}`);
        
        // 触发自定义逻辑
        this.onEntityEnterPlatform(otherNode);
    }

    /**
     * 碰撞结束回调
     */
    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
        const otherNode = otherCollider.node;
        
        // 从记录中移除
        this.nodesOnPlatform.delete(otherNode);
        
        console.log(`物体离开平台: ${otherNode.name}`);
        
        // 触发自定义逻辑
        this.onEntityExitPlatform(otherNode);
    }

    /**
     * 当有实体进入平台时触发（可以在这里编写你的逻辑）
     */
    private onEntityEnterPlatform(node: Node): void {
        // TODO: 在这里编写实体进入平台的逻辑
        
    }

    /**
     * 当有实体离开平台时触发（可以在这里编写你的逻辑）
     */
    private onEntityExitPlatform(node: Node): void {
        // TODO: 在这里编写实体离开平台的逻辑
       
    }

    /**
     * 获取当前在平台上的节点数量
     */
    public getNodeCountOnPlatform(): number {
        return this.nodesOnPlatform.size;
    }

    /**
     * 获取当前在平台上的所有节点
     */
    public getNodesOnPlatform(): Node[] {
        return Array.from(this.nodesOnPlatform);
    }

    /**
     * 检查指定节点是否在平台上
     */
    public isNodeOnPlatform(node: Node): boolean {
        return this.nodesOnPlatform.has(node);
    }

    /**
     * 清除平台上的节点记录
     */
    public clearPlatformNodes(): void {
        this.nodesOnPlatform.clear();
    }

    // 帧更新
    update(deltaTime: number) {
        
    }

    onDestroy(): void {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
        this.clearPlatformNodes();
    }
}