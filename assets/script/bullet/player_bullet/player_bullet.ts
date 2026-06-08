// 玩家子弹：向前移动并伤害敌人
import { _decorator, Component, Node ,Vec2,Vec3,Collider2D,BoxCollider2D,CircleCollider2D,
     Contact2DType, PhysicsSystem2D, IPhysics2DContact, RigidBody2D} from 'cc';
import { bullet_base } from '../bullet_base';
import {enemy_controler_base} from '../../enemy/enemy_controler_base';
const { ccclass, property } = _decorator;

@ccclass('player_bullet')
export class player_bullet extends bullet_base {
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
    protected is_cdir: boolean = false; // 是否已改变方向（用于散射子弹）
    protected new_dir: Vec2 = new Vec2(0,0); // 新的移动方向（散射用）

    @property({ tooltip: "子弹飞行角度偏移(度)，0为默认方向" })
    protected angle_offset: number = 0; // 飞行角度偏移
    protected is_cangle: boolean = false; // 是否已改变角度

    // 初始化子弹参数与碰撞
    protected onLoad(): void {
        super.onLoad();
        this.speed = 800;
        this.damage = 10;
        this.move_dir = new Vec2(1, 0);
        this.move_rotation = 0;
        this.move_distance = 2800;
        this.timer_for_life.set_duration(this.move_distance/this.speed);
        this.collider.enabled = true;               
        PhysicsSystem2D.instance.enable = true;
        this.timer_for_life.reset();
        
        // 根据角度偏移调整移动方向
        if (this.angle_offset !== 0) {
            const angleRad = this.angle_offset * (Math.PI / 180);
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            this.move_dir = new Vec2(
                this.move_dir.x * cos - this.move_dir.y * sin,
                this.move_dir.x * sin + this.move_dir.y * cos
            );
        }
    }

    // 初始化物理组件
    protected initPhysics(): void {
                // 自动获取组件（如果编辑器没绑定）
                if (!this.rigidBody) {
                    this.rigidBody = this.node.getComponent(RigidBody2D);
                }
                if (!this.collider) {
                    this.collider = this.node.getComponent(CircleCollider2D);
                }
    }

     // 碰撞开始：命中敌人则造成伤害
     protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
            this.Physics2DContact = contact;
        // 例如：碰到敌人
            if (other.node.getComponent(enemy_controler_base)) {
                other.node.getComponent(enemy_controler_base).get_hurted(this.damage);
                this.scheduleOnce(() => {
                    this.onDestroy();
                }, 0.01);
            }
    
        } 

    public change_dir(dir: Vec2): void {
        this.new_dir = dir.normalize();
        this.move_dir = this.new_dir;
        this.is_cdir = true;
    }

    public change_angle(angle: number): void {
        this.angle_offset = angle;
        this.is_cangle = true;
    }


    // 组件启动：启动生命周期计时
    start() {
        this.timer_for_life.start();
        if(this.is_cdir)
        {
            this.move_dir = this.new_dir;
            this.is_cdir = false;
        }
        if(this.is_cangle)
        {
            const angleRad = this.angle_offset * (Math.PI / 180);
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            this.move_dir = new Vec2(
                this.move_dir.x * cos - this.move_dir.y * sin,
                this.move_dir.x * sin + this.move_dir.y * cos
            );
            this.is_cangle = false;
        }
    }

    // 帧更新：复用基类逻辑
    update(deltaTime: number) {
        super.update(deltaTime);
    }
}