// 场景敌人管理：按时间表投放各类敌人
import { _decorator, Component, Node, instantiate, Vec2, Vec3, Prefab } from 'cc';
import { Timer } from '../../Timer';
const { ccclass, property } = _decorator;

@ccclass('scene_enemy_manager')
export class scene_enemy_manager extends Component {
    private is_paused: boolean = true; // 游戏是否暂停
    private timer_for_spawn: Timer = null; // 管理游戏全局生成敌人的计时器
    //普通飞行敌人的生成时间点和位置偏移设置
    private time_for_spqwn_sets: number[];
    private pos_offset_sets: number[] ;
    private spawn_index: number = 0; // 当前生成敌人的时间点索引
    //电锯敌人的生成时间点和位置偏移设置
    private time_for_spawn_circle_saw_sets: number[];
    private spawn_circle_saw_index: number = 0; // 当前生成电锯敌人的时间点索引
    //激光敌人的生成时间点设置
    private time_for_spawn_laser_sets: number[];
    private spawn_laser_index: number = 0; // 当前生成激光敌人的时间点索引
    private spawn_laser_pos_offset_sets: number[]; // 激光敌人位置偏移设置
    //警示区域生成设置
    private time_for_spawn_warning_zone_sets: number[];
    private spawn_warning_zone_index: number = 0
    private spawn_warning_zone_pos_offset_sets: number[]; // 警示区域位置偏移设置
    //跟踪导弹敌人的生成时间点设置
    private time_for_spawn_tracking_missle_sets: number[];
    private spawn_tracking_missle_index: number = 0; // 当前生成跟踪导弹敌人的时间点索引
    private spawn_tracking_missle_pos_offset_sets: number[]; // 跟踪导弹敌人位置偏移设置


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
        this.timer_for_spawn.set_duration(60); // 生成敌人的总时间为60秒
        this.time_for_spqwn_sets = [7, 15, 20, 30 ,38]; // 普通敌人的生成时间点
        this.pos_offset_sets = [0, 0, -40, 40, -40]; // 每个生成时间点对应的敌人位置偏移

        this.time_for_spawn_circle_saw_sets = [5,7, 15 , 25 , 40]; // 电锯敌人的生成时间点

        //激光敌人的生成时间点和位置偏移设置
        this.time_for_spawn_laser_sets =   [7, 15  , 22, 30 , 32, 39 , 39 ,41 , 42 ];
        this.spawn_laser_pos_offset_sets = [0, 0 ,  50, -50, 50, 50 ,100 , 50, 100 ];

        //警示区域生成设置
        this.time_for_spawn_warning_zone_sets = [6, 14,  21, 29, 31, 38 , 38 ,40 , 41 ];
        this.spawn_warning_zone_pos_offset_sets = [0, 0 ,  50, -50, 50, 50 ,100 , 50, 100 ];

        //跟踪导弹敌人的生成时间点和位置偏移设置
        this.time_for_spawn_tracking_missle_sets = [  10 , 10  , 16 + 2, 17 + 2,18 + 2,19 + 2,20 + 2, 22 + 2, 22 + 2 , 22 + 2 , 22 + 2, 25, 25 , 25 , 40];
        this.spawn_tracking_missle_pos_offset_sets = [150, -150, 50,-50,40,60,80,200, 150, 100, 50, 0 ,-200, -50, 9];
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
        if(this.spawn_index >= this.time_for_spqwn_sets.length) return; // 如果所有生成时间点都已处理，直接返回
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
        const length: number = 1573.488; // 警告区域长度，根据实际情况调整
        const post_postion = new Vec3(this.node.position.x - 1150, this.node.position.y + this.spawn_laser_pos_offset_sets[this.spawn_laser_index], this.node.position.z);
        new_enemy_node.setPosition(post_postion);
        this.node.parent.addChild(new_enemy_node);
    }

    //投放警告区域
    private spawn_warning_zone() {
        if(this.spawn_warning_zone_index >= this.time_for_spawn_warning_zone_sets.length) return;
        if(this.timer_for_spawn.get_elapsedTime() >= this.time_for_spawn_warning_zone_sets[this.spawn_warning_zone_index]) {
            this.post_warning_zone();
            this.spawn_warning_zone_index++;
        }
    }

    // 生成警告区域
    private post_warning_zone() {
        const new_warning_zone_node = instantiate(this.box_warning_zone_prefab);
        const length: number = 1573.488; // 警告区域长度，根据实际情况调整
        const post_postion = new Vec3(this.node.position.x - 1150, this.node.position.y + this.spawn_warning_zone_pos_offset_sets[this.spawn_warning_zone_index], this.node.position.z);
        new_warning_zone_node.setPosition(post_postion);
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
        const post_postion = new Vec3(this.node.position.x, this.node.position.y + this.spawn_tracking_missle_pos_offset_sets[this.spawn_tracking_missle_index], this.node.position.z);      
        new_enemy_node.setPosition(post_postion);
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


