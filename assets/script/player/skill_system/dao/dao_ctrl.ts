import { _decorator, Component, Node, Vec3, BoxCollider2D, Collider2D,
     Contact2DType, IPhysics2DContact, input, Input, EventKeyboard, KeyCode,
     UITransform,RigidBody2D ,PhysicsSystem2D} from 'cc';
import { Playercontralor } from '../../Playercontralor';
import { enemy_controler_base } from '../../../enemy/enemy_controler_base';
import { Timer } from '../../../Timer';
const { ccclass, property } = _decorator;

@ccclass('dao_ctrl')
export class dao_ctrl extends Component {
    @property(Node)
    private player: Node = null; // 玩家节点组件
    @property(UITransform)
    private uiTransform: UITransform = null; // 刀的UITransform组件

    @property(Number)
    private damage: number = 100; // 伤害值

    private atk_timer: Timer = new Timer(); // 攻击计时器
    private is_atking: boolean = false; // 是否正在攻击

    @property
    private offsetX: number = 0; // X轴相对距离
    @property
    private offsetY: number = 0; // Y轴相对距离
    @property
    private offsetZ: number = 0; // Z轴相对距离

    @property
    private deadZone: number = 2; // 死区距离，在这个范围内不跟随
    @property
    private maxFollowDistance: number = 5; // 最大跟随距离，超过这个距离将以最大速度跟随
    @property
    private minSpeed: number = 1; // 最小跟随速度
    @property
    private maxSpeed: number = 5; // 最大跟随速度

    // 晃动相关参数
    @property
    private floatAmplitude: number = 0.5; // 晃动幅度
    @property
    private floatFrequency: number = 2; // 晃动频率（值越大晃动越快）
    @property
    private floatPhaseOffset: number = 0; // 晃动相位偏移

    private targetPosition: Vec3 = new Vec3();
    private basePosition: Vec3 = new Vec3(); // 基础位置（用于晃动计算）
    private floatTimer: number = 0; // 晃动计时器
    private isFollowing: boolean = false; // 是否正在跟随

    //物理检测组件
    private rigidBody: RigidBody2D = null!; // 刚体组件
    @property(BoxCollider2D)
    public collider: BoxCollider2D = null!; // 碰撞体组件
    private Physics2DContact: IPhysics2DContact | null = null; // 当前碰撞信息

    on_Load(): void {
        // 确保玩家节点已设置
        if (!this.player) {
            console.warn('玩家节点未设置！请在编辑器中将玩家节点拖到属性面板的player字段上。');
        }
        this.atk_timer = this.addComponent(Timer);
        this.atk_timer.set_duration(0.5); // 设置攻击持续时间
        this.atk_timer.stop(); // 初始状态停止计时

      
    
        // this.atk_timer.stop();  计时器停止
        // this.atk_timer.reset(); 计时器重置并开始
        // this.atk_timer.start(); 计时器开始
        // this.atk_timer.check_if_end(); 计时器是否运行到指定计时，是返回true，否则返回false
    }

     // 初始化物理组件
     init_physics()
     {
          // 自动获取组件（如果编辑器没绑定）
            if (!this.rigidBody) {
                this.rigidBody = this.node.getComponent(RigidBody2D);
            }
           

            if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        this.collider.enabled = true; // 确保碰撞体启用
        
     }

     onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null)
     {
        this.Physics2DContact = contact;
        console.log("刀碰撞检测触发");
        if(other.node.getComponent(enemy_controler_base))
        {
            console.log("刀碰撞到敌人了");
            other.node.getComponent(enemy_controler_base).get_hurted(this.damage);
        }

     }

    private onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
      
    }

    start() {
        if (!this.player) {
            console.warn('玩家节点未设置！');
        }
          this.init_physics();
    
        PhysicsSystem2D.instance.enable = true;

        
        // 初始化位置在玩家附近
        if (this.player) {
            const playerPos = this.player.worldPosition;
            const initialX = playerPos.x + this.offsetX;
            const initialY = playerPos.y + this.offsetY;
            const initialZ = playerPos.z + this.offsetZ;
            
            this.node.setWorldPosition(initialX, initialY, initialZ);
            this.basePosition.set(initialX, initialY, initialZ);
        }

        
        // 注册输入监听
        this.registerInputListener();
    }

    update(deltaTime: number) {
        if (!this.player) return;

        // 更新目标位置
        this.updateTargetPosition();
        
        // 计算与目标位置的距离
        const currentPos = this.node.worldPosition;
        const distance = Vec3.distance(currentPos, this.targetPosition);
        
        // 判断行为模式
       
        if (this.shouldEnterIdleMode(distance)) {
            if(this.is_atking) {
                
            }else{
                // 在死区内，执行晃动
                this.executeFloatingBehavior(deltaTime);
            }
            
        } else {
            if(this.is_atking) {
                
            }else{
                // 超出死区，执行跟随
                this.executeFollowBehavior(deltaTime, distance, currentPos);
            }
            
        }

        if(this.is_atking){
            this.attack();
            if(this.atk_timer.check_if_end()){
                this.is_atking = false;
                this.atk_timer.stop();
            }
        }

       

    }

    /**
     * 注册输入监听器
     */
    private registerInputListener(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    /**
     * 键盘按下事件处理
     * @param event 键盘事件
     */
    private onKeyDown(event: EventKeyboard): void {
        if (event.keyCode === KeyCode.KEY_J) {
            
            this.start_attack();
        }
    }

    public start_attack(): void {
        // 后续在这里添加攻击逻辑

            this.is_atking = true;
            this.atk_timer.reset(); // 重置并开始计时
            this.atk_timer.start(); // 启动计时器
    }

    private attack()
    {
        this.node.setWorldPosition(
            this.player.worldPosition.x + this.uiTransform.contentSize.width * 10,
            this.player.worldPosition.y,
            this.player.worldPosition.z
        );
    }




    /**
     * 更新目标位置（玩家位置 + 偏移量）
     */
    private updateTargetPosition(): void {
        const playerPos = this.player.worldPosition;
        this.targetPosition.set(
            playerPos.x + this.offsetX,
            playerPos.y + this.offsetY,
            playerPos.z + this.offsetZ
        );
    }

    /**
     * 判断是否应该进入待机模式（在死区内）
     * @param distance 当前距离目标位置的距离
     * @returns 是否在死区内
     */
    private shouldEnterIdleMode(distance: number): boolean {
        return distance <= this.deadZone;
    }

    /**
     * 执行跟随行为
     * @param deltaTime 时间增量
     * @param distance 当前距离目标位置的距离
     * @param currentPos 当前位置
     */
    private executeFollowBehavior(deltaTime: number, distance: number, currentPos: Vec3): void {
        // 更新跟随状态
        this.isFollowing = true;
        
        // 更新基础位置为当前实际位置
        this.basePosition.set(currentPos);
        
        // 计算跟随速度
        const currentSpeed = this.calculateFollowSpeed(distance);
        
        // 计算移动方向和距离
        const direction = this.calculateMoveDirection(currentPos, this.targetPosition);
        const moveDistance = this.calculateMoveDistance(currentSpeed, deltaTime, distance);
        
        // 执行移动
        this.moveTowards(direction, moveDistance, currentPos);
        
        // 重置晃动计时器
        this.resetFloatingTimer();
    }

    /**
     * 计算跟随速度（根据距离动态调整）
     * @param distance 当前距离目标位置的距离
     * @returns 计算出的移动速度
     */
    private calculateFollowSpeed(distance: number): number {
        if (distance >= this.maxFollowDistance) {
            return this.maxSpeed;
        }
        
        if (distance > this.deadZone) {
            const speedRange = this.maxSpeed - this.minSpeed;
            const distanceRatio = (distance - this.deadZone) / (this.maxFollowDistance - this.deadZone);
            return this.minSpeed + speedRange * distanceRatio;
        }
        
        return this.minSpeed;
    }

    /**
     * 计算移动方向
     * @param from 起始位置
     * @param to 目标位置
     * @returns 归一化的方向向量
     */
    private calculateMoveDirection(from: Vec3, to: Vec3): Vec3 {
        const direction = new Vec3();
        Vec3.subtract(direction, to, from);
        direction.normalize();
        return direction;
    }

    /**
     * 计算实际移动距离
     * @param speed 移动速度
     * @param deltaTime 时间增量
     * @param distance 剩余距离
     * @returns 实际移动距离
     */
    private calculateMoveDistance(speed: number, deltaTime: number, distance: number): number {
        return Math.min(speed * deltaTime, distance);
    }

    /**
     * 向指定方向移动
     * @param direction 移动方向
     * @param moveDistance 移动距离
     * @param currentPos 当前位置
     */
    private moveTowards(direction: Vec3, moveDistance: number, currentPos: Vec3): void {
        const newPos = new Vec3();
        Vec3.scaleAndAdd(newPos, currentPos, direction, moveDistance);
        this.node.setWorldPosition(newPos);
    }

    /**
     * 执行浮动行为（在死区内时的待机动画）
     * @param deltaTime 时间增量
     */
    private executeFloatingBehavior(deltaTime: number): void {
        this.isFollowing = false;
        
        const floatOffset = this.calculateFloatOffset(deltaTime);
        this.applyFloatEffect(floatOffset);
    }

    /**
     * 计算浮动偏移量
     * @param deltaTime 时间增量
     * @returns 浮动偏移量
     */
    private calculateFloatOffset(deltaTime: number): number {
        this.floatTimer += deltaTime * this.floatFrequency;
        return Math.sin(this.floatTimer) * this.floatAmplitude;
    }

    /**
     * 应用浮动效果到节点
     * @param floatOffset 浮动偏移量
     */
    private applyFloatEffect(floatOffset: number): void {
        const currentPos = this.node.worldPosition;
        const previousOffset = Math.sin(this.floatTimer - 0.016 * this.floatFrequency) * this.floatAmplitude;
        
        this.node.setWorldPosition(
            currentPos.x,
            currentPos.y + floatOffset - previousOffset,
            currentPos.z
        );
    }

    /**
     * 重置浮动计时器
     */
    private resetFloatingTimer(): void {
        this.floatTimer = this.floatPhaseOffset;
    }

    /**
     * 组件销毁时清理监听器
     */
    onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        
       
    }

    // ... 其他公共方法保持不变 ...

    public getIsFollowing(): boolean {
        return this.isFollowing;
    }

    public setFloatParameters(amplitude: number, frequency: number, phaseOffset: number = 0): void {
        this.floatAmplitude = amplitude;
        this.floatFrequency = frequency;
        this.floatPhaseOffset = phaseOffset;
    }

    public setFollowParameters(deadZone: number, maxFollowDistance: number, minSpeed: number, maxSpeed: number): void {
        this.deadZone = deadZone;
        this.maxFollowDistance = maxFollowDistance;
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
    }

    public setOffset(offsetX: number, offsetY: number, offsetZ: number): void {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.offsetZ = offsetZ;
    }

    public getDamage(): number {
        return this.damage;
    }
}