// 普通飞行敌人：进入、待机、逃跑与死亡状态切换
import { _decorator, Component, Node, Vec2, Vec3 ,UITransform,
    Sprite, CircleCollider2D, Prefab, instantiate, RigidBody2D,Contact2DType,Collider2D, IPhysics2DContact,
    tween, AudioSource, AudioClip, PhysicsSystem2D,
    BoxCollider2D, Animation } from 'cc';
import { FSM, IState } from '../../../fms/FMS';
import { enemy_controler_base } from '../../enemy_controler_base';
import { on_in_state } from './normal_one_fly_state/on_in_state';
import { idle_state } from './normal_one_fly_state/idle_state';
import { run_away_state } from './normal_one_fly_state/run_away_state';
import { dead_state } from './normal_one_fly_state/dead_state';
import { atk_state } from './normal_one_fly_state/atk_state';
import { Timer } from '../../../Timer';
import { Playercontralor } from '../../../player/Playercontralor';
import { annoucer } from '../../../annoucement_system/annoucer';
const { ccclass, property } = _decorator;

@ccclass('normal_one')
export class normal_one extends enemy_controler_base {
    /* private fsm: FSM = null!;
    private player: Node = null!;
    private moveSpeed: number = 100;
    private moveDirRotate: number = 0;
    private moveDir: Vec2 = new Vec2(0, 0) */  
    public enemy_hp: number = 50; // 飞行敌人的生命值
    private platform: Node = null!; // 平台引用
    private height: number = 0; // 平台高度
    private loop_time: number = 0; // 移动循环时间
    public is_onining: boolean = true; // 是否处于进入状态
    public is_idle: boolean = false; // 是否处于待机状态
    public is_run_away: boolean = false; // 是否处于逃跑状态
    public is_dead: boolean = false; // 是否死亡
    @property(Timer)
    private timer_for_move: Timer = null; // 移动计时器
    private timer_for_attack: Timer = null!; // 攻击计时器
    private state_timer: Timer = null!; // 状态切换计时器
    private state_times: number[] = [1,10]; // 各状态持续时间
    private state_index: number = 0; // 当前状态索引

    @property(Number)
    private patrol_dir: number = 1; // 巡逻方向（1或-1）
    
    private transform: UITransform = null!; // UI尺寸组件

    private rigidBody: RigidBody2D = null!; // 刚体组件
    public collider: BoxCollider2D = null!; // 碰撞体组件
    private Physics2DContact: IPhysics2DContact | null = null; // 当前碰撞信息
    private damage: number = 20; // 伤害值

    public anim:Animation = null!; // 动画组件

    private annoucer: annoucer = null!; // 播报系统引用

    private protected_timer: Timer = null!; // 入场前短暂无敌时间

    // 初始化敌人状态与计时器
    onLoad(): void {
        super.onLoad();
        this.on_init_anim();
        this.on_init_fsm();
        
        this.is_onining = true;
        this.platform = this.node.parent.getChildByName("platform")!;
        this.transform = this.node.getComponent(UITransform)!;
        
        this.height = 523/2;
        this.loop_time = this.height/this.move_speed;
        this.timer_for_move = this.addComponent(Timer)!;
        this.protected_timer = this.addComponent(Timer)!;
        this.timer_for_attack = this.addComponent(Timer)!;
        this.state_timer = this.addComponent(Timer)!;
        this.state_timer.set_duration(2);
        this.timer_for_attack.set_duration(0.5);
        this.protected_timer.set_duration(1.5);
        this.timer_for_move.set_duration(this.loop_time);
        this.initPhysics();
        if (this.collider) {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
        PhysicsSystem2D.instance.enable = true;

        this.annoucer = this.node.parent.getChildByName('Camera')!.getChildByName("kill_annoucer")!.getComponent(annoucer)!;
        
    }

    public set_patrol_dir(dir: number) {
        this.patrol_dir = dir;
    }

    public get_patrol_dir(): number {
        return this.patrol_dir;
    }

    //初始化动画组件
    on_init_anim()
    {
        this.anim = this.node.getComponent(Animation)!;
    }

    // 初始化状态机
    on_init_fsm(): void {
        this.fsm = this.node.addComponent(FSM);

        this.fsm.registerState('on_in',new on_in_state(this));    
        this.fsm.registerState('idle', new idle_state(this));
        this.fsm.registerState('run_away', new run_away_state(this));
        this.fsm.registerState('dead', new dead_state(this));
        this.fsm.registerState('atk', new atk_state(this));
        
        this.fsm.changeState('on_in');
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
            this.fsm.changeState('dead');
            this.scheduleOnce(() => {
                this.onDestroy();
            }, 0.5);
        }

    } 

    // 碰撞结束回调
    protected onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = null;
        // 确保物理组件已初始化
    }
    
    die_check()
    {
        super.die_check();
        if(this.enemy_hp <= 0)
        {
            this.annoucer.get_killed_event();
            if(this.collider)
            {
                this.collider.enabled = false;
            }
            this.fsm.changeState('dead');
        }
    }

    // 组件启动：开始计时器
    start() {
        this.Resume();
        this.timer_for_move.start();
        this.timer_for_attack.start();
        this.protected_timer.start();
        this.collider.enabled = false; // 初始禁用碰撞体，进入状态结束时启用
        this.fsm.changeState('on_in');
    }

    public exit_atk() {
        
        this.anim.play('idle');
    }

    // 帧更新：状态切换与移动
    update(deltaTime: number) {
        if(this.is_paused) return;
        if(this.is_dead) return;
        if(this.protected_timer.check_if_end() && this.is_onining)
        {
            this.collider.enabled = true;   
        }
        
        super.update(deltaTime);
        if(this.state_timer.check_if_end())
        {
            if(this.state_index == 0)
            {
                this.fsm.changeState('idle');
            }
            else if(this.state_index == 1)
            {
                this.fsm.changeState('run_away');
            }
            
            this.state_index++;
            this.state_timer.reset();
            this.state_timer.set_duration(this.state_times[this.state_index % this.state_times.length]);
        }
        //this.move_way();
        //this.attack();
    }

    // 移动方向定时反转
    override move_way(){
        if(this.timer_for_move.check_if_end())
        {
            this.move_dir = this.move_dir.multiplyScalar(-1);
            this.timer_for_move .reset();
        }
    }

    @property({type: Prefab})
    prefeb_bullet:Prefab = null; // 子弹预制体

    private audioSource: AudioSource = null; // 音频组件

    @property({ type: AudioClip })
    public atkSound: AudioClip = null; // 攻击音效


    attack(){
        if(this.is_dead)  return;
        const bullet_post_pos_y = this.node.getPosition().y + (this.transform.contentSize.height * this.node.scale.y / 2);
        if(bullet_post_pos_y > this.player.getPosition().y && bullet_post_pos_y < this.player.getPosition().y + 26)
        {
            if(this.timer_for_attack.get_duration() > this.timer_for_attack.get_elapsedTime())
            {
                return;
            }
            if(this.prefeb_bullet)
            {
                this.anim.play('atk');
                let bullet = instantiate(this.prefeb_bullet);
                bullet.setPosition(new Vec3(this.node.getPosition().x, bullet_post_pos_y,0));
                this.node.parent.addChild(bullet);
                this.timer_for_attack.reset();
                this.scheduleOnce(() => {
                    this.exit_atk();
                }, 0.22);
                
            }
            
        }

    }

    
    public on_Destroy() {
        this.fsm.changeState('dead');
        this.anim.play('die');
        super.onDestroy();
    }

    // 进入场景时的速度设置
    on_in()
    {
        this.move_speed = 400;
    }


    // 设置移动方向
    public change_dir(new_dir: Vec2)
    {
        this.move_dir = new_dir;
    }

    public is_paused: boolean = true; // 是否暂停

    // 暂停敌人逻辑
    public Pause(){
        if(this.is_paused) return;
        this.is_paused = true;
        this.timer_for_attack.stop();
        this.timer_for_move.stop();
        this.state_timer.stop();
    }

    // 恢复敌人逻辑
    public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
        this.timer_for_attack.reStart();
        this.timer_for_move.reStart();
        this.state_timer.reStart();
    }



}


