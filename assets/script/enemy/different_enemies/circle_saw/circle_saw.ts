// 圆锯敌人：直线移动并对玩家造成伤害
import { _decorator, Component, Node, Vec2, Vec3, RigidBody2D, Collider2D,IPhysics2DContact,
        Contact2DType, CircleCollider2D, BoxCollider2D,PhysicsSystem2D,
        Animation
 } from 'cc';
import { enemy_controler_base } from '../../enemy_controler_base';
import { Playercontralor } from '../../../player/Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('circle_saw')
export class circle_saw extends enemy_controler_base {
     /* private fsm: FSM = null!;
    private player: Node = null!;
    private moveSpeed: number = 100;
    private moveDirRotate: number = 0;
    private moveDir: Vec2 = new Vec2(0, 0) */  
    private move_direction: number = -1; // 圆锯的移动方向，1表示向右，-1表示向左
    private position: Vec3 = new Vec3(0, 0, 0); // 圆锯的当前位置
    private rotateSpeed: number = 360; // 圆锯的旋转速度，单位为度/秒
    private damage: number = 30; // 圆锯的伤害值

    //碰撞检测组件
    private rigidBody: RigidBody2D = null!; // 刚体组件
    private collider: Collider2D = null!; // 碰撞体组件
    private Physics2DContact: IPhysics2DContact | null = null; // 当前碰撞信息

    @property(Animation)
    public anim: Animation = null!; // 动画组件

    // 初始化物理组件
    initPhysics(): void {
        // 自动获取组件（如果编辑器没绑定）
        if (!this.rigidBody) {
            this.rigidBody = this.node.getComponent(RigidBody2D);
        }
        if (!this.collider) {
            this.collider = this.node.getComponent(CircleCollider2D);
        }
    }

    // 碰撞开始：命中玩家造成伤害
    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = contact;
    // 例如：碰到玩家
        if (other.node.name === 'player') {
            other.node.getComponent(Playercontralor).get_hurted(this.damage);
        }

    } 
    // 碰撞结束回调
    protected onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
    }

    // 初始化圆锯参数与碰撞监听
    onLoad(): void {
        super.onLoad();
        this.position.y = -37.175;  //设置投放的y轴坐标
        this.position.x = 800; //初始x轴坐标
        this.move_speed = 1000; // 设置圆锯的移动速度
        this.move_dir = new Vec2(this.move_direction, 0); // 设置圆锯的移动方向
        this.initPhysics();
        if (this.collider) {
                      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                    }
                        
        PhysicsSystem2D.instance.enable = true;
        this.anim = this.node.getComponent(Animation)!; // 获取动画组件

    }

        // 组件启动：设置初始位置
    start() {
        this.anim.play('spining'); // 播放旋转动画
        this.node.setPosition(this.position); // 设置圆锯的初始位置
        if(this.if_speed_changed){
            this.move_speed = this.changed_speed;
        }
        if(this.if_damage_changed){
            this.damage = this.changed_damage;
        }
    }

    // 帧更新：移动与出界销毁
    update(deltaTime: number) {
        if(this.is_paused)  return;
        super.update(deltaTime);

        // 如果圆锯移动出屏幕边界，则销毁圆锯节点
        if (this.node.position.x < -800 || this.node.position.x > 1380) {
            this.onDestroy();
        }
    }

    get_hurted(damage: number) {
        this.enemy_hp -= 0;
    }

    private is_paused: boolean = false; // 游戏是否暂停

    // 暂停圆锯逻辑
    public Pause(){
        if(this.is_paused) return;
        this.is_paused = true;
    }

    // 恢复圆锯逻辑
    public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
    
    }


    private if_speed_changed: boolean = false; // 速度是否已改变过
    private changed_speed: number = 0; // 已改变的速度值
    public set_speed(speed: number) {
        this.changed_speed = speed;
        this.if_speed_changed = true;
    }

    private if_damage_changed: boolean = false; // 伤害是否已改变过
    private changed_damage: number = 0; // 已改变的伤害值
    public set_damage(damage: number) {
        this.changed_damage = damage;
        this.if_damage_changed = true;
    }

   

}


