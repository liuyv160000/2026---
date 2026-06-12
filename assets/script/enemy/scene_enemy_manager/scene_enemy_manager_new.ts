import { _decorator, Component, Node } from 'cc';
import { Timer } from '../../Timer';
import { normal_one_fly_maker } from '../different_enemies/normal_one_fly/normal_one_fiy_maker';
import { ex_manager } from '../../ex_ctrl/ex_manager';
import { circle_saw_maker } from '../different_enemies/circle_saw/circle_saw_maker';
import { laser_maker } from '../different_enemies/laser/laser_maker';
import { tracking_missle_maker } from '../different_enemies/tracking_missle/tracking_missle_poster';
const { ccclass, property } = _decorator;

@ccclass('scene_enemy_manager_new')
export class scene_enemy_manager_new extends Component {
    @property(ex_manager)
    private ex_manager: ex_manager = null;  // 外部关卡管理器引用，用于访问关卡时间等信息

    @property(normal_one_fly_maker)
    private normal_one_fly_maker: normal_one_fly_maker = null; // 普通飞行敌人生成器
    @property(circle_saw_maker)
    private circle_saw_maker: circle_saw_maker = null; // 电锯敌人生成器
    @property(laser_maker)
    private laser_maker: laser_maker = null; // 激光敌人生成器
    @property(tracking_missle_maker)
    private tracking_missle_maker: tracking_missle_maker = null; // 跟踪导弹敌人生成器

    start() {

    }

    update(deltaTime: number) {
        
    }


    private is_paused: boolean = true; // 游戏是否暂停
    // 暂停生成
    public Pause(){
        if(this.is_paused) return;
        this.normal_one_fly_maker.Pause();
        this.circle_saw_maker.Pause();
        this.laser_maker.Pause();
        this.tracking_missle_maker.Pause();
        this.is_paused = true;
    }
    
    // 恢复生成
    public Resume(){
        if(!this.is_paused) return;
        this.normal_one_fly_maker.Resume();
        this.circle_saw_maker.Resume();
        this.laser_maker.Resume();
        this.tracking_missle_maker.Resume();
        this.is_paused = false;

    }
}


