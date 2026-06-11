import { _decorator, Component, Node, Vec2, Vec3 ,UITransform,
    Sprite, CircleCollider2D, Prefab, instantiate, RigidBody2D,Contact2DType,Collider2D, IPhysics2DContact,
    tween, AudioSource, AudioClip, PhysicsSystem2D,
    BoxCollider2D, Animation } from 'cc';
import { annoucer } from '../../../../annoucement_system/annoucer';
import { FSM } from '../../../../fms/FMS';
import { enemy_controler_base } from '../../../../enemy/enemy_controler_base';
const { ccclass, property } = _decorator;

@ccclass('supply_box')
export class supply_box extends enemy_controler_base {

    protected supply_box_hp: number = 10; // 补给箱生命值

    private annoucer: annoucer = null!; // 播报系统引用
    private rigidBody: RigidBody2D = null!; // 刚体组件
    private collider: BoxCollider2D = null!; // 碰撞体组件
    private Physics2DContact: IPhysics2DContact | null = null; // 当前碰撞信息

    // ========== 移动相关 ==========
    @property({ tooltip: "左右移动速度(像素/秒)" })
    move_speed: number = 100;

    @property({ tooltip: "上下移动幅度(像素)" })
    vertical_amplitude: number = 100;

    @property({ tooltip: "上下移动频率(周期/秒)" })
    vertical_frequency: number = 1;

    private move_direction: number = -1;  // 左移方向
    private initial_y: number = 0;        // 初始Y坐标
    private move_timer: number = 0;       // 移动计时器
    private is_moving: boolean = true;    // 是否正在移动（被攻击后停止）

    onLoad() {
        this.annoucer = this.node.parent.getChildByName('Camera')!.getChildByName("kill_annoucer")!.getComponent(annoucer)!;
        this.initPhysics();
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        
        // 记录初始Y坐标
        this.initial_y = this.node.position.y;
    }

    // 初始化物理组件
    private initPhysics(): void {
        if (!this.rigidBody) {
            this.rigidBody = this.node.getComponent(RigidBody2D);
        }
        if (!this.collider) {
            this.collider = this.node.getComponent(BoxCollider2D);
        }
    }

    // 碰撞开始：被玩家子弹命中爆出补给
    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = contact;
        
    }

    @property({type: Prefab})
    private supply_prefab: Prefab = null!; // 补给预制体引用

    post_skill_orbit() {
        if (!this.node.isValid) return;
        
        if (this.supply_prefab) {
            let supply = instantiate(this.supply_prefab);
            supply.setPosition(this.node.getPosition().x + 75, this.node.getPosition().y, this.node.getPosition().z);
            
            // 暂时禁用所有刚体
            const rigidBodies = supply.getComponentsInChildren(RigidBody2D);
            rigidBodies.forEach(rb => {
                if (rb) rb.enabled = false;
            });
            
            // 添加节点（此时刚体不会尝试注册到物理世界）
            this.node.parent.addChild(supply);
            
            // 延迟激活刚体（等物理步进完全结束）
            this.scheduleOnce(() => {
                if (supply && supply.isValid) {
                    supply.getComponentsInChildren(RigidBody2D)
                        .forEach(rb => {
                            if (rb && rb.isValid) {
                                rb.enabled = true;
                            }
                        });
                }
            }, 0.05);
        }
    }

    protected die_check() {
        if (this.supply_box_hp <= 0) {
            this.is_moving = false;            // 停止移动
            this.collider.enabled = false;     // 禁用碰撞体，防止重复触发
            this.annoucer.get_killed_event(); // 播报击杀事件
            this.post_skill_orbit();
            this.scheduleOnce(() => {
                
                this.onDestroy();
            }, 0.1);
        }
    }

    start() {
       
    }

    update(deltaTime: number) {
        if (!this.is_moving) return;
        
        // 累积移动时间
        this.move_timer += deltaTime;
        
        // 计算当前位置
        const currentPos = this.node.position;
        
        // 水平移动：向左移动
        const newX = currentPos.x + this.move_speed * this.move_direction * deltaTime;
        
        // 垂直移动：正弦波上下浮动
        // sin(2π * 频率 * 时间) 产生 -1 到 1 的循环值
        const vertical_offset = Math.sin(2 * Math.PI * this.vertical_frequency * this.move_timer) * this.vertical_amplitude;
        const newY = this.initial_y + vertical_offset;
        
        // 更新位置
        this.node.setPosition(newX, newY, currentPos.z);
        
        // 移出屏幕左边时销毁（可选，防止无限左移）
        if (newX < -500) {
            this.node.destroy();
        }
    }

    onDestroy(): void {
        this.node.destroy();
    }

    // ========== 移动控制方法 ==========

    /** 停止移动（被攻击时调用） */
    public stop_moving(): void {
        this.is_moving = false;
    }

    /** 恢复移动 */
    public resume_moving(): void {
        this.is_moving = true;
    }

    /** 设置移动方向（-1左，1右） */
    public setMoveDirection(direction: number): void {
        this.move_direction = direction > 0 ? 1 : -1;
    }

    /** 设置移动速度 */
    public setMoveSpeed(speed: number): void {
        this.move_speed = speed;
    }

    /** 设置上下浮动参数 */
    public setVerticalMotion(amplitude: number, frequency: number): void {
        this.vertical_amplitude = amplitude;
        this.vertical_frequency = frequency;
    }

    // ========== 受伤逻辑 ==========

    public get_hurted(damage: number) {
        this.supply_box_hp -= damage;
        this.is_moving = false;  // 被攻击后停止移动
        this.die_check();
    }
}