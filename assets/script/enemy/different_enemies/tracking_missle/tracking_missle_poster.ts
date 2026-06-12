// 场景敌人管理：按时间表投放追踪导弹敌人
import { _decorator, Component, Node, instantiate, Vec2, Vec3, Prefab } from 'cc';
import { Timer } from '../../../Timer';
import { ex_manager } from '../../../ex_ctrl/ex_manager';
import { tracking_missle } from '../../different_enemies/tracking_missle/tracking_missle';
const { ccclass, property } = _decorator;

@ccclass('tracking_missle_maker')
export class tracking_missle_maker extends Component {
    private is_paused: boolean = true; // 游戏是否暂停
    private timer_for_spawn: Timer = null; // 管理游戏全局生成敌人的计时器
    @property(ex_manager)
    private ex_manager: ex_manager = null;  // 外部关卡管理器引用，用于访问关卡时间等信息

    //跟踪导弹敌人的生成时间点和位置偏移设置
    @property({ type: [Number], tooltip: "跟踪导弹生成时间点(秒)" })
    private time_for_spawn_tracking_missle_sets: number[] = [8, 9, 15, 16, 17, 18, 19, 27, 27, 27, 27];
    @property({ type: [Number], tooltip: "跟踪导弹Y轴偏移" })
    private spawn_tracking_missle_pos_offset_sets: number[] = [150, -150, 50, 20, -10, -30, -50, 80, 20, -20, -80];
    @property({ type: Number, tooltip: "跟踪导弹速度" })
    private set_tracking_missle_speed: number = 900;
    @property({ type: Number, tooltip: "跟踪导弹最大速度" })
    private set_tracking_missle_max_speed: number = 4800;
    @property({ type: Number, tooltip: "跟踪导弹伤害" })
    private set_tracking_missle_damage: number = 20;

    private spawn_tracking_missle_index: number = 0; // 当前生成跟踪导弹敌人的时间点索引

    //跟踪导弹预制体
    @property({type: Prefab})
    private tracking_missle_prefab: Prefab = null; // 导弹预制体

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
        this.spawn_tracking_missle();
    }

    //投放跟踪导弹敌人
    private spawn_tracking_missle() {
        if(this.spawn_tracking_missle_index >= this.time_for_spawn_tracking_missle_sets.length) return;
        if(this.timer_for_spawn.get_elapsedTime() >= this.time_for_spawn_tracking_missle_sets[this.spawn_tracking_missle_index]) {
            this.post_tracking_missle();
            this.spawn_tracking_missle_index++;
        }
    }

    // 生成跟踪导弹敌人
    private post_tracking_missle() {
        const new_enemy_node = instantiate(this.tracking_missle_prefab);
        const post_postion = new Vec3(
            this.node.position.x, 
            this.node.position.y + this.spawn_tracking_missle_pos_offset_sets[this.spawn_tracking_missle_index], 
            this.node.position.z
        );      
        new_enemy_node.setPosition(post_postion);
        new_enemy_node.getComponent(tracking_missle).set_speed(this.set_tracking_missle_speed);
        new_enemy_node.getComponent(tracking_missle).set_max_speed(this.set_tracking_missle_max_speed);
        new_enemy_node.getComponent(tracking_missle).set_damage(this.set_tracking_missle_damage);
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