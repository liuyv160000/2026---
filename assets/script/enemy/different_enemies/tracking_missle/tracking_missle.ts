// 追踪导弹敌人：阶段性锁定并攻击玩家
import { _decorator, Component, Node, Vec2, Vec3, BoxCollider2D,
     Sprite, CircleCollider2D, Prefab, instantiate, RigidBody2D,Contact2DType,Collider2D, IPhysics2DContact,
    tween, AudioSource, AudioClip, PhysicsSystem2D,Animation
 } from 'cc';
import { FSM, IState } from '../../../fms/FMS';
import { enemy_controler_base } from '../../enemy_controler_base';
import {Timer} from '../../../Timer';
import { Playercontralor } from '../../../player/Playercontralor';
import { tm_atk_state } from './tracking_missle_state/tm_atk_state';
import { tm_aimming_state } from './tracking_missle_state/tm_aimming_state';
import { tm_dead_state } from './tracking_missle_state/tm_dead_state';
import { tm_on_in_state } from './tracking_missle_state/tm_on_in_state';
import { annoucer } from '../../../annoucement_system/annoucer';
const { ccclass, property } = _decorator;

@ccclass('tracking_missle')
export class tracking_missle extends enemy_controler_base {
     /* private fsm: FSM = null!;
    private player: Node = null!;
    private moveSpeed: number = 100;
    private moveDirRotate: number = 0;
    private moveDir: Vec2 = new Vec2(0, 0) */  
     public enemy_hp: number = 40; // 导弹的生命值
     private damage: number = 20; // 伤害值
    //状态管理
     private state_timer: Timer = null!; // 状态计时器
     private state_times: number[] = [1,1]; // 状态持续时间
     private state_index: number = 0; // 当前状态索引
     public is_onining: boolean = true; // 是否处于进入状态
     public is_aimming: boolean = false // 是否处于瞄准状态
     public is_atking: boolean = false; // 是否处于攻击状态
     public is_dead: boolean = false; // 是否死亡

     // 攻击加速参数（可在编辑器中调整）
     @property
     public atk_start_speed: number = 900; // 进入攻击时的初速度
     @property
     public atk_max_speed: number = 4800; // 攻击时的最高速度
     @property
     public atk_accel: number = 2200; // 攻击时的加速度（单位：每秒）
     private atk_speed_current: number = 0; // 当前攻击速度

    //物理检测组件
     private rigidBody: RigidBody2D = null!; // 刚体组件
     public collider: BoxCollider2D = null!; // 碰撞体组件
     private Physics2DContact: IPhysics2DContact | null = null; // 当前碰撞信息

     @property(Animation)
     public anim: Animation = null!; // 动画组件

     //锁定玩家
     @property(Node)
     public player: Node = null!; // 玩家引用

     private annoucer: annoucer = null!; // 播报系统引用

     private protected_timer: Timer = null!; // 受保护计时器

     // 初始化导弹状态与物理
     onLoad(): void {
        super.onLoad();
        this.on_init_fsm();
        this.init_physics();
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.anim = this.node.getComponent(Animation)!;

        this.state_index = 0;
        this.state_times = [2,1,3];
        this.state_timer = this.node.addComponent(Timer)!;
        this.state_timer.set_duration(this.state_times[this.state_index]);

        this.protected_timer = this.node.addComponent(Timer)!;
        this.protected_timer.set_duration(1.5);

        this.is_onining = true;
        this.move_speed = 400;
        this.move_dir = new Vec2(-1, 0);
     
        PhysicsSystem2D.instance.enable = true;
        this.annoucer = this.node.parent.getChildByName('Camera')!.getChildByName("kill_annoucer")!.getComponent(annoucer)!;
     }

     // 初始化状态机
     on_init_fsm()
     {
          this.fsm = this.node.addComponent(FSM)!;

          this.fsm.registerState("on_in", new tm_on_in_state(this));
          this.fsm.registerState("aimming", new tm_aimming_state(this));
          this.fsm.registerState("atk", new tm_atk_state(this));
          this.fsm.registerState("dead", new tm_dead_state(this));

          this.fsm.changeState("on_in");
     }

     // 初始化物理组件
     init_physics()
     {
          // 自动获取组件（如果编辑器没绑定）
            if (!this.rigidBody) {
                this.rigidBody = this.node.getComponent(RigidBody2D);
            }
            if (!this.collider) {
                this.collider = this.node.getComponent(BoxCollider2D);
            }
     }

     // 碰撞开始：命中玩家造成伤害
     onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null)
     {
          this.Physics2DContact = contact;
           if (other.node.name === 'player') {
            other.node.getComponent(Playercontralor).get_hurted(this.damage);
            this.collider.enabled = false; // 禁用碰撞体避免重复触发
            this.fsm.changeState("dead");
            this.is_dead = true;
            this.scheduleOnce(() => {
                this.onDestroy();
            }, 0.5);
        }

     }

     // 组件启动：恢复计时器
     start() {
          this.collider.enabled = false; // 初始禁用碰撞体，进入状态结束后启用
          if(this.if_speed_changed){
               this.move_speed = this.changed_speed;
          }
          if(this.if_damage_changed){
               this.damage = this.changed_damage;
               this.onLoad(); // 重新加载以应用伤害改变
          }
          if(this.if_max_speed_changed){
               this.atk_max_speed = this.changed_max_speed;
          }

          this.Resume();
    }

     // 帧更新：状态切换与移动
     update(deltaTime: number) {
         if(this.is_paused || this.is_dead) return;
         super.update(deltaTime);
         this.state_change();
          this.update_atk_speed(deltaTime);
          if(this.protected_timer.check_if_end())
          {
               this.collider.enabled = true;
          }
    }
    

     // 状态转换
    state_change() {
     if(this.state_timer.check_if_end())
     {
          this.state_index++;
          if(this.state_index == 1)
          {
               this.fsm.changeState("aimming");
               this.state_timer.set_duration(this.state_times[this.state_index]);
          }
          else if(this.state_index == 2)
          {
               this.fsm.changeState("atk");
               this.state_timer.set_duration(this.state_times[this.state_index]);
          }
          else if(this.state_index == 3)
          {
               this.fsm.changeState("dead");
          }
          
     }
    }


    die_check()
    {
        if(this.is_dead) return;
        super.die_check();
        if(this.enemy_hp <= 0)
        {
            
            this.annoucer.get_killed_event();
            this.collider.enabled = false;
            this.fsm.changeState('dead');
        }
     }

     // 设置移动速度
     public change_speed(speed: number) {
     this.move_speed = speed;
    }

     // 计算并朝向玩家
     public aiming() {
     let player_pos = this.player.getWorldPosition();
     let self_pos = this.node.getWorldPosition();
     let dir = new Vec2(player_pos.x - self_pos.x, player_pos.y - self_pos.y);
     dir.normalize();
     this.move_dir = dir;
     this.move_dir_rotate = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
     this.node.setRotationFromEuler(new Vec3(0, 0, 180 + this.move_dir_rotate));
     }

       // 进入攻击状态时重置速度
       public reset_atk_speed() {
            this.atk_speed_current = this.atk_start_speed;
            this.change_speed(this.atk_speed_current);
       }

       // 攻击状态下逐步加速
       private update_atk_speed(deltaTime: number) {
            if(!this.is_atking) return;
            if(this.atk_speed_current >= this.atk_max_speed) return;
            this.atk_speed_current = Math.min(
                    this.atk_speed_current + this.atk_accel * deltaTime,
                    this.atk_max_speed
            );
            this.change_speed(this.atk_speed_current);
       }

    

     public is_paused: boolean = true; // 是否暂停

     // 暂停导弹逻辑
     public Pause(){
        if(this.is_paused) return;
        this.is_paused = true;
        this.state_timer.stop();
        this.protected_timer.stop();
    }

     // 恢复导弹逻辑
     public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
        this.state_timer.reStart();
        this.protected_timer.reStart();
    }


     private if_speed_changed: boolean = false; // 速度是否已改变过
     private changed_speed: number = 0; // 已改变的速度值
     public set_speed(speed: number) {
        this.changed_speed = speed;
        this.if_speed_changed = true;
     }

     private if_max_speed_changed: boolean = false; // 最大速度是否已改变过
     private changed_max_speed: number = 0; // 已改变的最大速度值
     public set_max_speed(max_speed: number) {
        this.changed_max_speed = max_speed;
        this.if_max_speed_changed = true;
     }

     private if_damage_changed: boolean = false; // 伤害是否已改变过
     private changed_damage: number = 0; // 已改变的伤害值
     public set_damage(damage: number) {
        this.changed_damage = damage;
        this.if_damage_changed = true;
     }


}


