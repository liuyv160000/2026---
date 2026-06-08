// 普通飞行敌人逃跑状态
import { _decorator, Component, Node ,Vec2 } from 'cc';
import { IState } from '../../../../fms/FMS';
import { normal_one } from '../normal_one_fiy';
const { ccclass, property } = _decorator;

@ccclass('run_away_state')
export class run_away_state implements IState {
    private enemy: normal_one; // 关联的敌人实例
    private last_time: number = 0; // 逃跑持续时间

    // 传入敌人实例
    constructor(enemy: normal_one) {
        this.enemy = enemy;
    }

    // 状态更新：到时销毁
    update(deltaTime: number) {
        this.last_time -= deltaTime;
        if(this.last_time <= 0)
        {
            this.enemy.onDestroy();
        }
    }

    // 进入逃跑状态
    enter(): void {
        this.enemy.change_speed(600);
        this.enemy.change_dir(new Vec2(-1, 0));
        this.last_time = 3;
        this.enemy.is_run_away = true;
        this.enemy.is_idle = false;
        this.enemy.is_onining = false;
        this.enemy.is_dead = false;
    }

    // 退出逃跑状态
    exit(): void {
        
    }

}



