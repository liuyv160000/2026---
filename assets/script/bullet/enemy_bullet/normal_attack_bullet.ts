// 敌方普通子弹：向玩家方向移动并造成伤害
import { _decorator, Component, Node ,Vec2,Vec3,Collider2D,BoxCollider2D,
     Contact2DType, PhysicsSystem2D, IPhysics2DContact, RigidBody2D} from 'cc';
import { Playercontralor } from '../../player/Playercontralor';
import { bullet_base } from '../bullet_base';
const { ccclass, property } = _decorator;

@ccclass('normal_attack_bullet')
export class normal_attack_bullet extends bullet_base {
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
    protected rigidBody: RigidBody2D = null; // 刚体组件

    // 初始化子弹参数与碰撞
    protected onLoad(): void {
        super.onLoad();
        this.speed = 1400;
        this.damage = 10;
        this.move_dir = new Vec2(-1, 0);
        this.move_rotation = 0;
        this.move_distance = 1400;
        this.timer_for_life.set_duration(this.move_distance/this.speed);
        this.collider.enabled = true;               
        if (this.collider) {
              this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
              this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
        PhysicsSystem2D.instance.enable = true;
        this.timer_for_life.reset();
    }

    // 初始化物理组件
    protected initPhysics(): void {
                // 自动获取组件（如果编辑器没绑定）
                if (!this.rigidBody) {
                    this.rigidBody = this.node.getComponent(RigidBody2D);
                }
                if (!this.collider) {
                    this.collider = this.node.getComponent(BoxCollider2D);
                }
    }

    // 碰撞开始：命中玩家则造成伤害
    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = contact;
    // 例如：碰到玩家
        if (other.node.name === 'player') {
            other.node.getComponent(Playercontralor).get_hurted(this.damage);
            this.scheduleOnce(() => {
                this.onDestroy();
            }, 0.05);
        }

    } 


    // 组件启动：启动生命周期计时
    start() {
        this.timer_for_life.start();
        if(this.if_damage_changed){
            this.damage = this.changed_damage;
        }
        if(this.if_speed_changed){
            this.speed = this.changed_speed;
            this.onLoad(); // 重新加载以应用速度改变
        }
    }


    // 帧更新：复用基类逻辑
    update(deltaTime: number) {
        super.update(deltaTime);
    }

    private if_damage_changed: boolean = false; // 伤害是否已改变过
     private changed_damage: number = 0; // 已改变的伤害值
     public set_damage(damage: number) {
        this.changed_damage = damage;
        this.if_damage_changed = true;
     }

    private if_speed_changed: boolean = false; // 速度是否已改变过
     private changed_speed: number = 0; // 已改变的速度值
     public set_speed(speed: number) {
        this.changed_speed = speed;
        this.if_speed_changed = true;
     }

     






    

}


