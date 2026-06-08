// 道具生成器：按时间投放道具
import { _decorator, Component, Node, Vec2, Vec3 ,UITransform,
    Sprite, CircleCollider2D, Prefab, instantiate, 
    AudioSource, AudioClip} from 'cc';
import { Timer } from '../Timer';

const { ccclass, property } = _decorator;

@ccclass('toolmaker')
export class toolmaker extends Component {
    protected timer_for_life: Timer = null; // 生命周期计时器
    protected position: Vec3 = new Vec3(0, 0,0); // 投放位置
    protected movable = false; // 是否可移动
    protected move_speed; // 移动速度
    protected move_direction: Vec2 = new Vec2(0, 0); // 移动方向
    protected time_for_post_bullet_skill_orb: number[] = [5]; // 投放子弹或技能球的时间间隔
    protected time_index: number = 0; // 当前时间间隔索引
    protected pos_for_post_bullet_skill_orb: number[] = null; // 子弹技能球投放位置列表
    protected bullet_time = 0;
    protected is_posted = false; // 是否已投放过道具

    // 初始化计时器与默认参数
    protected onLoad(): void {
        this.timer_for_life = this.addComponent(Timer);
        this.timer_for_life.set_duration(1);
        this.position = this.node.getPosition();
        this.movable = false;
        this.move_speed = 0;
        this.time_for_post_bullet_skill_orb = [5];
        this.pos_for_post_bullet_skill_orb = [100];
        this.time_index = 0;
    }

    // 组件启动：开始计时
    start() {
        this.timer_for_life.start();
    }

    // 帧更新：按时间投放与移动
    update(deltaTime: number) {
        if(this.is_paused) return;
        if(!this.is_posted)
            this.bullet_time += deltaTime;
        if (this.bullet_time >= this.time_for_post_bullet_skill_orb[this.time_index]) {
            this.post_bullet_or_skill_orb();
            this.bullet_time = 0;
            this.is_posted = true;
            //this.time_index = (this.time_index + 1) % this.time_for_post_bullet_skill_orb.length; // 循环使用时间间隔
        }
        
        this.put_by_time();
        this.move();
    }

    @property({type: Prefab})
    prefeb_bullet:Prefab = null; // 子弹道具预制体

    @property({type: Prefab})
    prefeb_skill_orb: Prefab = null; // 技能球预制体

    @property
    use_skill_orb: boolean = false; // 是否投放技能球

    @property({type: Prefab})
    supply_prefab: Prefab = null; // 补给预制体引用


    // 生成可拾取道具
    public make_collectible_tool(prefab: Prefab, position: Vec3) {
        const new_tool_node = instantiate(prefab);
        const post_postion = new Vec3(position.x, position.y, position.z);
        new_tool_node.setPosition(post_postion);
        this.node.parent.addChild(new_tool_node);
    }

    // 道具移动逻辑
    protected move()
    {
        if(!this.movable) return;
    }

    // 按计时器投放道具
    put_by_time()
    {
        if (this.timer_for_life.check_if_end()) {
           
            this.make_collectible_tool(this.prefeb_bullet, this.position);
            
             this.timer_for_life.reset();
             this.timer_for_life.start();
        }
    }

    post_bullet_or_skill_orb()
    {
        if (this.use_skill_orb && this.prefeb_skill_orb) {
            this.make_collectible_tool(this.prefeb_skill_orb, new Vec3(this.node.position.x,this.node.position.y + this.pos_for_post_bullet_skill_orb[0], this.node.position.z));
        }
    }

    public is_paused = false; //游戏是否暂停

    // 暂停投放
    public Pause(){
        if(this.is_paused) return;
        this.is_paused = true;
        this.timer_for_life.stop();
    }
    
    // 恢复投放
    public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
        this.timer_for_life.start();
    }

}


