// 普通金币：沿固定方向移动，被玩家触碰后销毁
import { _decorator, Component, Node ,Vec2,Vec3,Collider2D,BoxCollider2D,
     Contact2DType, PhysicsSystem2D, CircleCollider2D,
    IPhysics2DContact} from 'cc';
import { Playercontralor } from '../../player/Playercontralor';
import { bullet_base } from '../../bullet/bullet_base';
const { ccclass, property } = _decorator;

@ccclass('normal_coin')
export class normal_coin extends bullet_base {
     /* @property
    protected speed: number = 0;
    protected damage: number = 0;
    protected move_dir: Vec2 = new Vec2(0,0);
    protected move_rotation: number = 0;
    protected move_distance: number = 0;
    protected timer: Timer = null; 
     //碰撞检测
        protected Physics2DContact: IPhysics2DContact | null = null;
        protected collider: Collider2D = null;*/

    // 初始化金币参数与碰撞
    protected onLoad(): void {
        super.onLoad();
        this.speed = 500;
        this.damage = 0;
        this.move_dir = new Vec2(-1, 0);
        this.move_rotation = 0;
        this.move_distance = 1400;
        this.timer_for_life.set_duration(this.move_distance/this.speed);
        this.collider = this.getComponent(CircleCollider2D);
        this.reLoadPhysics();
        this.collider.enabled = true;               
        PhysicsSystem2D.instance.enable = true;
        this.timer_for_life.reset();
    }

    // 重新绑定物理事件
    reLoadPhysics() {
        if (this.collider) {
              this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
              this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
    }

    // 碰撞开始：玩家触碰后销毁
    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = contact;
    
    // 例如：碰到玩家
        if (other.node.name === 'player') {
            this.scheduleOnce(() => {
            this.node.active = false; // 先将节点设置为不可见，避免在销毁前继续与玩家发生碰撞
            this.onDestroy(); // 销毁节点
        }, 0.005 );
        }
    
    } 
    
    // 碰撞结束回调
    protected onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        if (other.node.name === 'player') {
                
        }
    
        if (this.Physics2DContact === contact) {
            this.Physics2DContact = null;
        }
    }

    // 组件启动：启动生命周期计时
    start() {
        this.timer_for_life.start();
    }

    // 销毁金币节点
    protected onDestroy(): void {
        this.node.active = false; // 先将节点设置为不可见，避免在销毁前继续与玩家发生碰撞
        this.node.destroy();
    }

    // 帧更新：复用基类逻辑
    update(deltaTime: number) {
        super.update(deltaTime);
    }
}


