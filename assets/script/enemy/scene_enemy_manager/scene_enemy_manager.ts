// 场景敌人管理：按时间表投放各类敌人
import { _decorator, Component, Node, instantiate, Vec2, Vec3, Prefab } from 'cc';
import { Timer } from '../../Timer';
import { normal_one } from '../different_enemies/normal_one_fly/normal_one_fiy';
import { ex_manager } from '../../ex_ctrl/ex_manager';
import { circle_saw } from '../different_enemies/circle_saw/circle_saw';
import { box_warning_zone } from '../different_enemies/warning_zone/box_warning_zone/box_warning_zone';
import { laser } from '../different_enemies/laser/laser';
import { tracking_missle } from '../different_enemies/tracking_missle/tracking_missle';
const { ccclass, property } = _decorator;

@ccclass('scene_enemy_manager')
export class scene_enemy_manager extends Component {
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
    
    //电锯敌人的生成时间点设置
    @property({ type: [Number], tooltip: "电锯敌人生成时间点(秒)" })
    private time_for_spawn_circle_saw_sets: number[] = [5, 10, 27];
    @property({ type: Number, tooltip: "电锯敌人速度" })
    private set_circle_saw_speed: number = 1000;
    @property({ type: Number, tooltip: "电锯敌人伤害" })
    private set_circle_saw_damage: number = 30;

    private spawn_circle_saw_index: number = 0; // 当前生成电锯敌人的时间点索引
    
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

    //敌人预制体
    @property({type: Prefab})
    private normal_one_prefab: Prefab = null; // 普通敌人预制体
    @property({type: Prefab})
    private circle_saw_prefab: Prefab = null; // 圆锯预制体
    @property({type: Prefab})
    private box_warning_zone_prefab: Prefab = null; // 警告区域预制体
    @property({type: Prefab})
    private laser_prefab: Prefab = null; // 激光预制体
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
        this.spawn_enemies();
        this.spawn_circle_saw();
        this.spawn_warning_zone();
        this.spawn_laser();
        this.spawn_tracking_missle();
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