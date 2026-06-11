// 玩家控制器：输入、状态机、物理与受伤逻辑
import { 
    _decorator, 
    Component, 
    input, 
    Input, 
    EventKeyboard, 
    KeyCode,
    Vec2,
    Vec3,
    geometry,
    Animation,
    RigidBody2D,
    BoxCollider2D,
    Contact2DType,
    Collider2D,Collider,
    IPhysics2DContact,
    Color,
    CircleCollider2D,
    tween,
    UITransform,
    Camera,
    view
} from 'cc';
import {  PhysicsSystem2D, ERaycast2DType, Graphics } from 'cc';
import { FSM , IState} from '../fms/FMS';
import { Airstate } from './states/Airstate';
import { jumpstate } from './states/jumpstate';
import { IdleState } from './states/IdleState';
import { ReversingState } from './states/ReversingState';
import { Deadstate } from './states/Deadstate';
import {hp_line} from './hp_line/hp_line_shower/hp_line';
import { Timer } from '../Timer';
import { SkillSystem } from './skill_system/SkillSystem';


const { ccclass, property } = _decorator;

@ccclass('Playercontralor')
export class Playercontralor extends Component {
    //角色参数
    public health: number = 100; //角色生命值
    public ySpeed: number = 0;  //y轴速度
    public xSpeed: number = 0;  //x轴速度
    public x_a: number = 0; //水平加速度
    public jumpSpeed: number = 17; //跳跃初速度
    public faceDir: number = 1; //角色朝向，1朝向右边，-1朝向左边
    public ifAir: boolean = false; //角色状态，是否在空中
    public ifGround: boolean = true; //角色是否在平台地面上
    public Gravity:number = 25; //角色重力水平
    public ifGravityReverse:number = 1; //角色重力反转状态，1为正常，-1为反转
    public ifReversing:boolean = false; //角色是否正在反转
    public if_can_reverse:boolean = true; //角色是否可以反转
    public ifInvincible:boolean = false; //角色是否处于无敌状态
    public invincibleDuration:number = 1; //无敌状态持续时间（秒）
    public invincibleTimer: Timer = null; //无敌状态计时器
    public anim: Animation = null; //角色动画组件

    @property(BoxCollider2D)
    node_to_ignore: BoxCollider2D | null = null; // 反转时需要忽略碰撞的节点，例如平台
    /** 状态机实例 */
    public fsm: FSM = null;

    //外部控制参数
    public is_paused = false; //游戏是否暂停

    //血条显示
    @property(hp_line)
    public hp_line: hp_line = null; // 血条组件

    // ========== 组件引用 ==========
    
    @property(Animation)
    private animation: Animation = null; // 动画组件
    
    @property(RigidBody2D)
    public rigidBody: RigidBody2D = null; // 刚体组件

    @property(UITransform)
    public transform: UITransform = null; // UI尺寸组件

    private camera: Camera | null = null; // 摄像机组件

    @property(SkillSystem)
    private skillSystem: SkillSystem = null; // 技能系统组件

    

    //初始化物理组件
    private initPhysics(): void {
        // 自动获取组件（如果编辑器没绑定）
        if (!this.rigidBody) {
            this.rigidBody = this.node.getComponent(RigidBody2D);
        }
        if (!this.collider) {
            this.collider = this.node.getComponent(CircleCollider2D);
        }
        if (!this.animation) {
            this.animation = this.node.getComponent(Animation);
        }
    }

    /** 初始化输入系统 */
    private initInput(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

            /** 初始化状态机 */
    private initFSM(): void {
        // 创建状态机组件
        this.fsm = this.node.addComponent(FSM);
        
        // 注册状态（传入 this 供状态访问玩家数据）
        this.fsm.registerState('idle', new IdleState(this));
        this.fsm.registerState('jump', new jumpstate(this));
        this.fsm.registerState('air', new Airstate(this));
        this.fsm.registerState('reversing', new ReversingState(this, this.node_to_ignore)); // 反转状态暂用Airstate，后续可替换为专门的ReverseState        
        this.fsm.registerState('dead', new Deadstate(this)); // 死亡状态，后续可实现具体逻辑
        // 设置初始状态
        this.fsm.changeState('IdleState');
    }

    // 按键按下处理
    private onKeyDown(event: EventKeyboard): void {
        if(this.ifReversing) return; // 如果正在反转，暂不响应输入
        if(this.ifGravityReverse == 1)
        {
             if(this.ifGround)
            {
                 switch (event.keyCode) {
                    case KeyCode.KEY_S:
                    case KeyCode.ARROW_DOWN:
                    this.Reverse();
                    break;
                }
            }
            else
            {
                switch (event.keyCode) {
                case KeyCode.KEY_S:
                case KeyCode.ARROW_DOWN:
                this.quickDown();
                    break;
            }
        }

        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.Jump();
                break;
           
        }
        }
        else
        {
            if(this.ifGround)
            {
                 switch (event.keyCode) {
                    case KeyCode.KEY_W:
                    case KeyCode.ARROW_UP:
                    this.Reverse();
                    break;
                }
            }
            else
            {
                 switch (event.keyCode) {
                    case KeyCode.KEY_W:
                    case KeyCode.ARROW_UP:
                    this.quickDown();
                    break;
                }
            }
            switch (event.keyCode) {
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.Jump();
                break;
            

        
        }
        }

       
    }
    
    // 按键抬起处理
    private onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                if (this.faceDir < 0) this.faceDir = -1;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                if (this.faceDir > 0) this.faceDir = 1;
                break;
        }
    }
    
    // ========== 碰撞检测 ==========
    //射线起始点，位于角色中心
    public sta_position: Vec2 ;
    Physics2DContact: IPhysics2DContact | null = null;
    public collider: CircleCollider2D = null;
    
    // 清理碰撞监听
    onDestroy() {
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

    // 碰撞开始处理
    private onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
    this.Physics2DContact = contact;
    
    // 例如：碰到地面
    if (other.node.getComponent('plat')) {
        if(this.ifReversing ) return; // 如果是反转状态，碰撞体是触发器，不执行落地逻辑
        if(other.node.name === 'plat_line')
        {
            this.if_can_reverse = true; 
            this.Land();
        }// 站在线平台上时允许反转
        else
        {
            this.if_can_reverse = false; 
        }
        
    }

    // 如果需要接触点信息（引擎支持时）
    // const wm = contact?.getWorldManifold?.();
  }

    // 碰撞结束处理
    private onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
    if (other.node.name === 'platform') {
        this.if_can_reverse = false; // 默认碰撞后不允许反转，除非满足特定条件
    }

  }

    // ✅ 添加死亡标志
    public isDead: boolean = false;
    // ✅ 修改检查死亡
    private check_dead() {
        if (this.health <= 0 && !this.isDead) {
            this.die();    
        }
    }

    // 检查是否飞出摄像机视野
    private check_out_of_view() {
        if (this.health <= 0) return;
        if (!this.camera) {
            this.camera = this.node.scene?.getComponentInChildren(Camera) ?? null;
        }
        if (!this.camera) return;

        const visibleSize = view.getVisibleSizeInPixel();
        const buffer = 100;
        const screenPos = this.camera.worldToScreen(this.node.worldPosition);
        if (
            screenPos.x < -buffer || screenPos.x > visibleSize.width + buffer ||
            screenPos.y < -buffer || screenPos.y > visibleSize.height + buffer
        ) {
            this.health = 0;
            this.die();
        }
    }

    // 获取角色高度
    public get_size_y(){
    return this.transform.contentSize.y*this.node.scale.y;
  }

    // 获取角色宽度
    public get_size_x(){
    return this.transform.contentSize.x*this.node.scale.x;
  }

    // 初始化输入、状态机与物理
    protected onLoad(): void {
        this.initInput();
        this.initFSM(); 
        this.initPhysics();
        this.transform = this.node.getComponent(UITransform);
        this.anim = this.node.getComponent(Animation);
        this.skillSystem = this.skillSystem ?? this.node.getComponent(SkillSystem);


        if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
       
        this.invincibleTimer = this.node.addComponent(Timer);
        this.invincibleTimer.set_duration(this.invincibleDuration);
        this.invincibleTimer.stop(); // 初始状态下无敌计时器不工作

        PhysicsSystem2D.instance.enable = true;
    }

    // 组件启动
    start() {
       this.invincibleTimer.stop(); // 确保初始状态下无敌计时器不工作
       this.sta_position = new Vec2(this.node.position.x + 13, this.node.position.y + 13);
       this.ifAir = false;
       this.ifGround = true;
       
    }

    // 帧更新：状态机、重力与技能
    update(deltaTime: number) {
    if(this.is_paused) return;    
    this.check_dead();
    if (this.fsm) {
        this.fsm.update(deltaTime);
    }
    
    this.infectedByGravity(deltaTime);
    this.skillSystem?.updateSkills(deltaTime);
    
    //改为可选链
    if(this.invincibleTimer?.check_if_end()) {
        this.ifInvincible = false;
    }
}

    // 跳跃逻辑
    protected Jump()
    {
        if(this.ifAir || this.ifReversing) return;
        //切换到跳跃状态
        this.node.setPosition(this.node.position.x + 1, this.node.position.y);
        this.fsm.changeState('jump');
    }

    // 落地逻辑
    protected Land()
    {
        if(this.ifGround) return;
        this.ifGround = true;
        this.ifAir = false;
        this.fsm.changeState('idle');
    }

    // 受重力影响的速度更新
    protected infectedByGravity(deltatime: number)
    {
        if(!this.ifReversing)
        {
            this.ySpeed -= this.Gravity * this.ifGravityReverse * deltatime;
            this.xSpeed = this.xSpeed; // 水平速度逐渐增加，模拟加速效果
            this.xSpeed += this.x_a; // 水平加速度影响水平速度
        }
        this.rigidBody.linearVelocity = new Vec2(this.xSpeed, this.ySpeed);
    }

    // 位移调试逻辑
    protected check(deltatime: number)
    {
        if(this.ifAir) {
            this.node.setPosition(this.node.position.x - 1, this.node.position.y);
        }
        if(this.ifGround) {
            this.node.setPosition(this.node.position.x + 1, this.node.position.y);
        }
    }

    // 快速下落
    protected quickDown()
    {
        if(this.ifGround) return;
        this.ySpeed = -this.jumpSpeed*2*this.ifGravityReverse;
    }

    // 反转重力
    public reverseGravity()
    {
        this.ifGravityReverse *= -1;
        this.rigidBody.gravityScale *= -1;
    }

    // 触发反转状态
    public Reverse()
    {
        if(!this.ifGround || !this.if_can_reverse || this.ifAir) return;
        this.ifReversing = true;
        this.fsm.changeState('reversing');
           
    }

    // 关卡结束处理
    public end_out_completed()
    {
        this.ySpeed = 0;
        this.rigidBody.gravityScale = 0;
        this.Gravity = 0;
        this.xSpeed = 10;
        this.x_a = 5;
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 1);
    }

    // 死亡处理
    protected die() {
    if (this.isDead) return; // 防止重复调用
    this.isDead = true;
    this.fsm.changeState('dead');
}
   
    // 暂停角色逻辑
    public Pause(){
        if(this.is_paused) return;
        this.is_paused = true;
    }

    // 恢复角色逻辑
    public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
    }

    private hurt_duration: number = 0.5; // 受伤状态持续时间（秒）

    // 受到伤害
    public get_hurted(damage: number) {
    if(this.ifInvincible) return;
    
    // ✅ 安全调用
    this.invincibleTimer?.reset();
    this.ifInvincible = true;
    this.health -= damage;
    this.anim?.play('invincle_hurt');
    this.show_hp_line();
    this.node.scene?.emit('player_hurt');
    
    // ✅ 立即检查死亡
    if (this.health <= 0) {
        this.die();
    }
}

    // 更新血条显示
    show_hp_line(){
        this.hp_line.change_hp_line();
    }

}
