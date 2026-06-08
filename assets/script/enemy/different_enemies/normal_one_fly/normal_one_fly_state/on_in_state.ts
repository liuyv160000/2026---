// 普通飞行敌人进入场景状态
import { _decorator, Component, Node ,Vec2 ,Vec3} from 'cc';
import { IState } from '../../../../fms/FMS';
import { normal_one } from '../normal_one_fiy';
import { Timer } from 'db://assets/script/Timer';
const { ccclass, property } = _decorator;

@ccclass('on_in_state')
export class on_in_state implements IState {
    private enemy: normal_one; // 关联的敌人实例
    private time: number = 1; // 进入状态持续时间
    private changed: boolean = false; // 是否已切换
    private time2: number = 0.75; // 计时器

    // 传入敌人实例
    constructor(enemy: normal_one) {
        this.enemy = enemy;
    }

    // 组件加载
    onLoad() {

    }

    // 状态启动
    start() {

    }

    // 状态更新
    update(deltaTime: number) {
        
    }

    // 进入场景状态
    enter(): void {
        this.enemy.change_dir(new Vec2(-1, 0));
        this.enemy.on_in();
        this.enemy.is_onining = true;
        this.enemy.is_idle = false;
        this.enemy.is_run_away = false;
        this.enemy.is_dead = false;

    }

    // 退出进入状态
    exit(): void {
        this.enemy.is_onining = false;
    }
}


