// 场景敌人管理：按时间表投放电锯敌人
import { _decorator, Component, Node, instantiate, Vec2, Vec3, Prefab } from 'cc';
import { Timer } from '../../../Timer';
import { circle_saw } from '../../different_enemies/circle_saw/circle_saw';
import { ex_manager } from '../../../ex_ctrl/ex_manager';
const { ccclass, property } = _decorator;

@ccclass('circle_saw_maker')
export class circle_saw_maker extends Component {
    private is_paused: boolean = true; // 游戏是否暂停
    private timer_for_spawn: Timer = null; // 管理游戏全局生成敌人的计时器
    @property(ex_manager)
    private ex_manager: ex_manager = null;  // 外部关卡管理器引用，用于访问关卡时间等信息

    //电锯敌人的生成时间点设置
    @property({ type: [Number], tooltip: "电锯敌人生成时间点(秒)" })
    private time_for_spawn_circle_saw_sets: number[] = [5, 10, 27];
    @property({ type: Number, tooltip: "电锯敌人速度" })
    private set_circle_saw_speed: number = 1000;
    @property({ type: Number, tooltip: "电锯敌人伤害" })
    private set_circle_saw_damage: number = 30;

    private spawn_circle_saw_index: number = 0; // 当前生成电锯敌人的时间点索引
    
    //电锯敌人预制体
    @property({type: Prefab})
    private circle_saw_prefab: Prefab = null; // 圆锯预制体

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
        this.spawn_circle_saw();
    }

    //投放电锯敌人
    private spawn_circle_saw() {
        if(this.spawn_circle_saw_index >= this.time_for_spawn_circle_saw_sets.length) return;
        if(this.timer_for_spawn.get_elapsedTime() >= this.time_for_spawn_circle_saw_sets[this.spawn_circle_saw_index]) {
            this.post_circle_saw();
            this.spawn_circle_saw_index++;
        }
    }
    
    // 生成电锯敌人
    private post_circle_saw() {
        const new_enemy_node = instantiate(this.circle_saw_prefab);
        new_enemy_node.getComponent(circle_saw).set_speed(this.set_circle_saw_speed);
        new_enemy_node.getComponent(circle_saw).set_damage(this.set_circle_saw_damage);
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