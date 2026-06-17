import { _decorator, Component, Node } from 'cc';
import { Timer } from '../../Timer';
import { normal_one_fly_maker } from '../different_enemies/normal_one_fly/normal_one_fiy_maker';
import { ex_manager } from '../../ex_ctrl/ex_manager';
import { circle_saw_maker } from '../different_enemies/circle_saw/circle_saw_maker';
import { laser_maker } from '../different_enemies/laser/laser_maker';
import { tracking_missle_maker } from '../different_enemies/tracking_missle/tracking_missle_poster';
import { machine_mouse_maker } from '../different_enemies/machine_mouse/machine_mouse_maker';
import { searchlight_guard_maker } from '../different_enemies/searchlight_guard/searchlight_guard_maker';
import { poison_bomb_maker } from '../different_enemies/poison_bomb/poison_bomb_maker';
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
    @property(machine_mouse_maker)
    private machine_mouse_maker: machine_mouse_maker = null; // 机械老鼠敌人生成器
    @property(searchlight_guard_maker)
    private searchlight_guard_maker: searchlight_guard_maker = null; // 探照灯守卫敌人生成器
    @property(poison_bomb_maker)
    private poison_bomb_maker: poison_bomb_maker = null; // 毒 bomb 敌人生成器

    start() {

    }

    update(deltaTime: number) {
        
    }


    private is_paused: boolean = true; // 游戏是否暂停
    // 暂停生成
public Pause(){
    if(this.is_paused) return;
    if (this.normal_one_fly_maker) this.normal_one_fly_maker.Pause();
    if (this.circle_saw_maker) this.circle_saw_maker.Pause();
    if (this.laser_maker) this.laser_maker.Pause();
    if (this.tracking_missle_maker) this.tracking_missle_maker.Pause();
    if (this.machine_mouse_maker) this.machine_mouse_maker.Pause();
    if (this.searchlight_guard_maker) this.searchlight_guard_maker.Pause();
    if (this.poison_bomb_maker) this.poison_bomb_maker.Pause();
    this.is_paused = true;
}

// 恢复生成
public Resume(){
    if(!this.is_paused) return;
    if (this.normal_one_fly_maker) this.normal_one_fly_maker.Resume();
    if (this.circle_saw_maker) this.circle_saw_maker.Resume();
    if (this.laser_maker) this.laser_maker.Resume();
    if (this.tracking_missle_maker) this.tracking_missle_maker.Resume();
    if (this.machine_mouse_maker) this.machine_mouse_maker.Resume();
    if (this.searchlight_guard_maker) this.searchlight_guard_maker.Resume();
    if (this.poison_bomb_maker) this.poison_bomb_maker.Resume();
    this.is_paused = false;
}
}


