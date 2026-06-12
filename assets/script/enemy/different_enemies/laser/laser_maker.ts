// 场景敌人管理：按时间表投放激光敌人和警戒区域
import { _decorator, Component, Node, instantiate, Vec2, Vec3, Prefab } from 'cc';
import { Timer } from '../../../Timer';
import { ex_manager } from '../../../ex_ctrl/ex_manager';
import { box_warning_zone } from '../../different_enemies/warning_zone/box_warning_zone/box_warning_zone';
import { laser } from '../../different_enemies/laser/laser';
const { ccclass, property } = _decorator;

@ccclass('laser_maker')
export class laser_maker extends Component {
    private is_paused: boolean = true; // 游戏是否暂停
    private timer_for_spawn: Timer = null; // 管理游戏全局生成敌人的计时器
    
    @property(ex_manager)
    private ex_manager: ex_manager = null;  // 外部关卡管理器引用，用于访问关卡时间等信息

    //激光敌人的生成时间点和位置偏移设置（同时控制警戒区域）
    @property({ type: [Number], tooltip: "激光敌人生成时间点(秒)（警戒区域提前1秒生成）" })
    private time_for_spawn_laser_sets: number[] = [7, 15, 29, 29];
    @property({ type: [Number], tooltip: "激光敌人Y轴偏移（警戒区域使用相同偏移）" })
    private spawn_laser_pos_offset_sets: number[] = [0, 0, 60, 120];
    @property({ type: Number, tooltip: "激光敌人伤害" })
    private set_laser_damage: number = 30;
    @property({ type: Number, tooltip: "激光敌人持续时间" })
    private set_laser_atk_time: number = 0.5;
    @property({ type: Number, tooltip: "警戒区域警戒时间" })
    private set_warning_count: number = 1;

    private spawn_laser_index: number = 0; // 当前生成激光敌人的时间点索引
    private spawn_warning_zone_index: number = 0; // 当前生成警戒区域的时间点索引

    //敌人预制体
    @property({type: Prefab})
    private box_warning_zone_prefab: Prefab = null; // 警告区域预制体
    @property({type: Prefab})
    private laser_prefab: Prefab = null; // 激光预制体

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
        this.spawn_warning_zone();
        this.spawn_laser();
    }

    //投放激光敌人
    private spawn_laser() {
        if(this.spawn_laser_index >= this.time_for_spawn_laser_sets.length) return;
        if(this.timer_for_spawn.get_elapsedTime() >= this.time_for_spawn_laser_sets[this.spawn_laser_index]) {
            this.post_laser();
            this.spawn_laser_index++;
        }
    }

    // 生成激光敌人
    private post_laser() {
        const new_enemy_node = instantiate(this.laser_prefab);
        const post_postion = new Vec3(
            this.node.position.x - 1150, 
            this.node.position.y + this.spawn_laser_pos_offset_sets[this.spawn_laser_index], 
            this.node.position.z
        );
        new_enemy_node.setPosition(post_postion);
        new_enemy_node.getComponent(laser).set_atk_time(this.set_laser_atk_time);
        new_enemy_node.getComponent(laser).set_damage(this.set_laser_damage);
        this.node.parent.addChild(new_enemy_node);
    }

    //投放警告区域（使用激光的时间点提前1秒，位置偏移相同）
    private spawn_warning_zone() {
        if(this.spawn_warning_zone_index >= this.time_for_spawn_laser_sets.length) return;
        
        // 使用激光的时间点减去1秒作为警戒区域的生成时间
        const warning_time = this.time_for_spawn_laser_sets[this.spawn_warning_zone_index] - this.set_warning_count;
        
        if(this.timer_for_spawn.get_elapsedTime() >= warning_time) {
            this.post_warning_zone();
            this.spawn_warning_zone_index++;
        }
    }

    // 生成警告区域（使用激光的位置偏移）
    private post_warning_zone() {
        const new_warning_zone_node = instantiate(this.box_warning_zone_prefab);
        const post_postion = new Vec3(
            this.node.position.x - 1150, 
            this.node.position.y + this.spawn_laser_pos_offset_sets[this.spawn_warning_zone_index], 
            this.node.position.z
        );
        new_warning_zone_node.setPosition(post_postion);
        new_warning_zone_node.getComponent(box_warning_zone).set_warning_duration(this.set_warning_count);
        this.node.parent.addChild(new_warning_zone_node);
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