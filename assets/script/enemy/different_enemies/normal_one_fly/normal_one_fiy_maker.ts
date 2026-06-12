// 场景敌人管理：按时间表投放飞行敌人
import { _decorator, Component, Node, instantiate, Vec2, Vec3, Prefab } from 'cc';
import { Timer } from '../../../Timer';
import { normal_one } from '../../different_enemies/normal_one_fly/normal_one_fiy';
import { ex_manager } from '../../../ex_ctrl/ex_manager';
const { ccclass, property } = _decorator;

@ccclass('normal_one_fly_maker')
export class normal_one_fly_maker extends Component {
    private is_paused: boolean = true; // 游戏是否暂停
    private timer_for_spawn: Timer = null; // 管理游戏全局生成敌人的计时器
    @property(ex_manager)
    private ex_manager: ex_manager = null;  // 外部关卡管理器引用，用于访问关卡时间等信息

    //普通飞行敌人的生成时间点和位置偏移设置
    @property({ type: [Number], tooltip: "普通敌人生成时间点(秒)" })
    private time_for_spqwn_sets: number[] = [10, 23, 23];
    @property({ type: [Number], tooltip: "普通敌人Y轴偏移" })
    private pos_offset_sets: number[] = [0, 10, -10];
    @property({ type: [Number], tooltip: "普通敌人巡逻方向" })
    private patrol_dir_sets: number[] = [1, 1, -1];
    @property({ type: Number, tooltip: "飞行敌人速度" })
    private set_normal_fly_speed: number = 400;
    @property({ type: Number, tooltip: "飞行敌人伤害" })
    private set_normal_fly_damage: number = 20;
    @property({ type: Number, tooltip: "飞行敌人子弹速度" })
    private set_normal_fly_bullet_speed: number = 1400;
    @property({ type: Number, tooltip: "飞行敌人子弹伤害" })
    private set_normal_fly_bullet_damage: number = 10;
    
    private spawn_index: number = 0; // 当前生成敌人的时间点索引

    //飞行敌人预制体
    @property({type: Prefab})
    private normal_one_prefab: Prefab = null; // 普通敌人预制体

    // 初始化生成时间表与计时器
    protected onLoad(): void {
        this.timer_for_spawn = this.addComponent(Timer);
        this.timer_for_spawn.set_duration(this.ex_manager.get_total_time()); // 生成敌人的总时间
    }

    // 组件启动：开始计时
    start() {
        this.timer_for_spawn.start();
    }

    // 帧更新：按时间表投放敌人
    update(deltaTime: number) {
        if(this.is_paused) return;
        this.spawn_enemies();
    }

    //投放飞行敌人
    private spawn_enemies() {
        if(this.spawn_index >= this.time_for_spqwn_sets.length) return;
        if(this.timer_for_spawn.get_elapsedTime() >= this.time_for_spqwn_sets[this.spawn_index]) {
            this.post_normal_one();
            this.spawn_index++;
        }
    }

    // 生成普通飞行敌人
    private post_normal_one() {
        const new_enemy_node = instantiate(this.normal_one_prefab);
        const post_postion = new Vec3(this.node.position.x, this.node.position.y + this.pos_offset_sets[this.spawn_index], this.node.position.z);      
        new_enemy_node.setPosition(post_postion);
        new_enemy_node.getComponent(normal_one).set_patrol_dir(this.patrol_dir_sets[this.spawn_index]);
        new_enemy_node.getComponent(normal_one).set_speed(this.set_normal_fly_speed);
        new_enemy_node.getComponent(normal_one).set_damage(this.set_normal_fly_damage);
        new_enemy_node.getComponent(normal_one).set_bullet_speed(this.set_normal_fly_bullet_speed);
        new_enemy_node.getComponent(normal_one).set_bullet_damage(this.set_normal_fly_bullet_damage);
        
        this.node.parent.addChild(new_enemy_node);
    }

    // 暂停生成
    public Pause(){
        if(this.is_paused) return;
        this.timer_for_spawn.stop();
        this.is_paused = true;
    }
    
    // 恢复生成
    public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
        this.timer_for_spawn.reStart();
    }
}