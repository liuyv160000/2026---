// 激光敌人：预警后攻击，命中玩家造成伤害
import { _decorator, Component, Node, Vec2, Vec3, RigidBody2D, Collider2D,BoxCollider2D,
    IPhysics2DContact, Contact2DType, PhysicsSystem2D,Animation
 } from 'cc';
import { enemy_controler_base } from '../../enemy_controler_base';
import { Timer } from '../../../Timer';
import { FSM , IState} from '../../../fms/FMS';
import { warning_state } from './laser_state/warning_state';
import { attack_state } from './laser_state/attack_state';
import { Playercontralor } from '../../../player/Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('laser')
export class laser extends enemy_controler_base {
    /* private fsm: FSM = null!;
    private player: Node = null!;
    private move_speed: number = 100;
    private move_dir_rotate: number = 0;
    private move_dir: Vec2 = new Vec2(0, 0) */  
    private post_pos: Vec3 = new Vec3(0, 0, 0); // 生成位置
    private damage: number = 30; // 伤害值

    private rigidBody: RigidBody2D = null!; // 刚体组件
    private collider: Collider2D = null!; // 碰撞体组件
    private Physics2DContact: IPhysics2DContact | null = null; // 当前碰撞信息
    private life_timer: Timer = new Timer(); // 生命周期计时器
    private atk_time: number = 0.5; // 激光持续时间，单位为秒

    private anim: Animation = null!; // 动画组件


    // 初始化激光与状态机
    onLoad(): void {
        super.onLoad();
        this.on_init_fsm();
        this.initPhysics();
        this.move_speed = 0;
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.life_timer = this.addComponent(Timer);
        this.life_timer.set_duration(this.atk_time);
        this.life_timer.stop();
        this.anim = this.node.getComponent(Animation)!;

        PhysicsSystem2D.instance.enable = true;
    }



    // 初始化状态机
    private on_init_fsm(): void { 
        this.fsm = this.node.addComponent(FSM);
        
        this.fsm.registerState('warning',new warning_state(this));
        this.fsm.registerState('attack',new attack_state(this));
    }

    // 初始化物理组件
    private initPhysics(): void {
        // 自动获取组件（如果编辑器没绑定）
        if (!this.rigidBody) {
            this.rigidBody = this.node.getComponent(RigidBody2D);
        }
        if (!this.collider) {
            this.collider = this.node.getComponent(BoxCollider2D);
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

    // 组件启动：开始计时
    start() {
        this.life_timer.start();
        this.anim.play('laser_gun');
    }

    // 帧更新：到期销毁
    update(deltaTime: number) {
        if(this.life_timer.check_if_end()) this.onDestroy();
    }


    public is_paused: boolean = true; // 是否暂停

    // 暂停激光逻辑
    public Pause(){
        if(this.is_paused) return;
        this.is_paused = true;

    }

    // 恢复激光逻辑
    public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
    }

}


